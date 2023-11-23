import { Injectable } from '@nestjs/common';
import puppeteer, { Browser, ElementHandle, Page } from 'puppeteer';
import { ExtractedDocCmBluDto } from './dto/extracted-doc-cm-blu.dto';
import Filters, { AllFilters } from './domain/models/filters';
import { DocCmBluTypes } from './enums/doc-cm-blu-types.enum';
import { DocCmBluSubTypes } from './enums/doc-cm-blu-sub-types.enum';
import { DocLabelCmBluTypes } from './enums/doc-label-cm-blu-types.enum';
import { DocLabelCmBluSubTypes } from './enums/doc-label-cm-blu-sub-types.enum';

type DocLabelMap = Map<DocCmBluTypes, DocLabelCmBluTypes> &
  Map<DocCmBluSubTypes, DocLabelCmBluSubTypes>;

interface InfoElement {
  key: string;
  value: string;
}

@Injectable()
export class CmBluService {
  private _browser: Browser;
  private _page: Page;
  private _pagination = { pagesQty: 0, paginatioButtonsQty: 0 };
  private _docLabel: DocLabelMap = new Map();
  private _filters: Filters;
  private _filteredUrl: string;
  private _docLinks: string[] = [];

  async init(filters?: Filters): Promise<void> {
    const defaultFilters: Filters = {
      type: DocCmBluTypes.PROPOSICOES,
      subType: DocCmBluSubTypes.MOCAO,
      status: 'arquivado-130000',
      author: 'adriano-pereira-450',
      year: 2023,
    };

    this._filters = filters || defaultFilters;
    this._filteredUrl = this.buildUrl(this._filters);
    this._docLabel.set(
      this._filters.type,
      DocLabelCmBluTypes[this._filters.type.toUpperCase()],
    );
    this._docLabel.set(
      this._filters.subType,
      DocLabelCmBluSubTypes[this._filters.subType.toUpperCase()],
    );

    this._browser = await puppeteer.launch({ headless: true });
    this._page = await this._browser.newPage();
  }

  public async scrape(filters?: Filters): Promise<ExtractedDocCmBluDto[]> {
    await this.init(filters);
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
        this._docLabel.get(this._filters.type),
        this._docLabel.get(this._filters.subType),
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
    await this._page.goto(this._filteredUrl, {
      waitUntil: 'domcontentloaded',
    });

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

  private buildUrl(filters: AllFilters) {
    const { endpoint, type, subType, status, author, year } = filters;
    const baseUrl = [
      process.env.CMB_URL,
      endpoint || process.env.CMB_ENDPOINT,
    ].join('');

    const processFilters = [
      type && '/tipo:' + type,
      type && subType && '/subtipo:' + subType,
      status && '/situacao:' + status,
      author && '/autor:' + author,
      year && '/ano:' + year,
    ].filter(Boolean);

    return baseUrl + processFilters.join('');
  }
}
