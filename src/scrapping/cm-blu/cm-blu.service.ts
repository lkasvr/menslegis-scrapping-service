import { Injectable } from '@nestjs/common';
import puppeteer, { Browser, ElementHandle, Page } from 'puppeteer';
import { ExtractedDocCmBluDto } from './dto/extracted-doc-cm-blu.dto';
import Filters from './domain/models/filters';

interface InfoElement {
  key: string;
  value: string;
}

@Injectable()
export class CmBluService {
  private _browser: Browser;
  private _page: Page;
  private _pagination = { pagesQty: 0, paginatioButtonsQty: 0 };
  private _filters: [string, string];
  private _filteredUrl: string;
  private _docLinks: string[] = [];

  async init(url: string): Promise<void> {
    // const defaultFilters = {
    //   type: DocTypes.PROPOSICOES,
    //   subType: DocSubTypes.MOCAO,
    //   year: 2023,
    // };

    this._browser = await puppeteer.launch({ headless: true });
    this._page = await this._browser.newPage();
    this._filters = this.filterUrl(url);
    this._filteredUrl = this.buildUrl(url);
  }

  public async scrape(url: string) {
    await this.init(url);
    return await (await this.scrapeDocLinks()).getDocsData();
  }

  private async getDocsData(): Promise<ExtractedDocCmBluDto[]> {
    const docsInfos = await this.scrapeDocsInfos();
    await this._browser.close();
    return docsInfos.map((infos) => {
      const parsedInfos = [];
      infos.forEach(({ key, value }) => {
        if (
          key === 'Data do Documento' ||
          key === 'Autores' ||
          key === 'Ementa' ||
          key === 'Situação'
        )
          parsedInfos.push(value);
      });
      return new ExtractedDocCmBluDto(
        this._filters[0],
        this._filters[1],
        parsedInfos[0],
        parsedInfos[1],
        parsedInfos[2],
        parsedInfos[3],
      );
    });
  }

  private async scrapeDocsInfos(): Promise<InfoElement[][]> {
    const docsInfosPromise = this._docLinks.map(async (endpoint) => {
      const page = await this._browser.newPage();
      await page.goto(this.buildUrl({ endpoint }));

      const infoItems = await page.$$('li.documento-item');

      return await this.scrapeDocInfos(infoItems);
    });

    return Promise.all(docsInfosPromise);
  }

  private async scrapeDocInfos(infoItems: ElementHandle<HTMLLIElement>[]) {
    const docInfos: InfoElement[] = [];
    for await (const infoItem of infoItems) {
      docInfos.push({
        key: await (async () => {
          try {
            return await infoItem.$eval('.info-label', (el) =>
              el.textContent.trim(),
            );
          } catch (error) {
            return undefined;
          }
        })(),
        value: await (async () => {
          try {
            return await infoItem.$eval('.info-value', (el) =>
              el.textContent.trim().replace(/\s{2,}/g, ''),
            );
          } catch (error) {
            return undefined;
          }
        })(),
      });
    }

    return docInfos;
  }

  private async scrapeDocLinks(): Promise<this> {
    await this._page.goto(this._filteredUrl);

    for (let i = 1; i <= (await this.getNextPage(i)); i++) {
      await this._page.goto(this._filteredUrl + '/page:' + i);
      const docsList = await this._page.$$('.list-documentos li');
      for (const li of docsList)
        this._docLinks.push(await li.$eval('a', (a) => a.getAttribute('href')));
    }

    return this;
  }

  private async getNextPage(pageNumber: number): Promise<number> {
    if (this._pagination.pagesQty === 0) {
      this._pagination.paginatioButtonsQty = (
        await this._page.$$('.pagination.pagination-alt li')
      ).length;
      if (this._pagination.paginatioButtonsQty === 0) return 1;
      this._pagination.pagesQty = this._pagination.paginatioButtonsQty - 1;
    }

    if (
      pageNumber + 1 === this._pagination.paginatioButtonsQty &&
      this._pagination.paginatioButtonsQty < 11
    ) {
      this._pagination.paginatioButtonsQty = (
        await this._page.$$('.pagination.pagination-alt li')
      ).length;
      this._pagination.pagesQty = this._pagination.pagesQty + 4;
    }

    if (
      pageNumber === this._pagination.pagesQty &&
      this._pagination.paginatioButtonsQty === 11
    ) {
      this._pagination.paginatioButtonsQty = (
        await this._page.$$('.pagination.pagination-alt li')
      ).length;
      this._pagination.pagesQty = this._pagination.pagesQty + 4;
    }

    return this._pagination.pagesQty;
  }

  private buildUrl(filters?: Filters) {
    if (!filters) return this._filteredUrl;
    if (typeof filters === 'string') return filters;
    const { endpoint, type, subType, author, year } = filters;
    const baseUrl = [
      process.env.CMB_URL,
      endpoint || process.env.CMB_ENDPOINT,
    ].join('');

    const processFilters = [
      type && '/tipo:' + type,
      type && subType && '/subtipo:' + subType,
      author && '/autor:' + author,
      year && '/ano:' + year,
    ].filter(Boolean);

    return baseUrl + processFilters.join('');
  }

  private filterUrl(url: string): [string, string] {
    const tipoRegex = /\/tipo:([^/]+)/;
    const subtipoRegex = /\/subtipo:([^/]+)/;

    return [RegExp(tipoRegex).exec(url)[1], RegExp(subtipoRegex).exec(url)[1]];
  }
}
