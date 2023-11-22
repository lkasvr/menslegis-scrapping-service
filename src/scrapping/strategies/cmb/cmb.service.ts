import { Injectable } from '@nestjs/common';
import { StrategyService } from '../strategy.service';
import puppeteer, { Browser, ElementHandle, Page } from 'puppeteer';
import Filters from './domain/filters';
import { DocTypes } from './enums/docTypes.enum';
import { DocSubTypes } from './enums/docSubTypes.enum';
import { DocDto } from './DocDto';

interface InfoElement {
  key: string;
  value: string;
}

@Injectable()
export class CmbStrategyService extends StrategyService {
  private _browser: Browser;
  private _page: Page;
  private _pagination = { pagesQty: 0, paginatioButtonsQty: 0 };
  private _filters: Filters;
  private _filteredUrl: string;
  private _docLinks: string[] = [];

  async init(): Promise<void> {
    const filters = {
      type: DocTypes.PROPOSICOES,
      subType: DocSubTypes.MOCAO,
      year: 2023,
    };

    this._browser = await puppeteer.launch({ headless: true });
    this._page = await this._browser.newPage();
    this._filters = filters;
    this._filteredUrl = this.filterUrl(filters);
  }

  async scrape() {
    await this.init();
    const x = await (await this.scrapeDocLinks()).getDocsData();
    console.log(x);
  }

  async getDocsData(): Promise<DocDto[]> {
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
      return new DocDto(
        this._filters.type,
        this._filters.subType,
        parsedInfos[0],
        parsedInfos[1],
        parsedInfos[2],
        parsedInfos[3],
      );
    });
  }

  async scrapeDocsInfos(): Promise<InfoElement[][]> {
    const docsInfosPromise = this._docLinks.map(async (endpoint) => {
      const page = await this._browser.newPage();
      await page.goto(this.filterUrl({ endpoint }));

      const infoItems = await page.$$('li.documento-item');

      return await this.scrapeDocInfos(infoItems);
    });

    return Promise.all(docsInfosPromise);
  }

  async scrapeDocInfos(infoItems: ElementHandle<HTMLLIElement>[]) {
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

  async scrapeDocLinks(): Promise<this> {
    await this._page.goto(this._filteredUrl);

    for (let i = 1; i <= (await this.getNextPage(i)); i++) {
      await this._page.goto(this._filteredUrl + '/page:' + i, {
        waitUntil: 'domcontentloaded',
      });
      const docsList = await this._page.$$('.list-documentos li');
      for (const li of docsList)
        this._docLinks.push(await li.$eval('a', (a) => a.getAttribute('href')));
    }

    return this;
  }

  async getNextPage(pageNumber: number): Promise<number> {
    if (this._pagination.pagesQty === 0) {
      this._pagination.paginatioButtonsQty = (
        await this._page.$$('.pagination.pagination-alt li')
      ).length;
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

  filterUrl(filters?: Filters) {
    if (!filters) return this._filteredUrl;
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
}
