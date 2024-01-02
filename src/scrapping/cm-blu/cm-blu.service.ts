import { Injectable } from '@nestjs/common';
import puppeteer, { Browser, ElementHandle, Page } from 'puppeteer';
import { ExtractedDocCmBluDto } from './dto/extracted-doc-cm-blu.dto';
import Filters, { AllFilters } from './domain/models/filters';
import { DocCmBluTypes } from './enums/doc-cm-blu-types.enum';
import { DocCmBluSubTypes } from './enums/doc-cm-blu-sub-types.enum';
import { DocLabelCmBluTypes } from './enums/doc-label-cm-blu-types.enum';
import { DocLabelCmBluSubTypes } from './enums/doc-label-cm-blu-sub-types.enum';
import { ScrappingStandardizeService } from '../utils/scrapping-standardize.service';

type DocLabelMap = Map<DocCmBluTypes, DocLabelCmBluTypes> &
  Map<DocCmBluSubTypes, DocLabelCmBluSubTypes>;

interface InfoElement {
  pageLink: string;
  key?: string;
  value?: string;
  arrValue?: string[];
  link?: string;
}

@Injectable()
export class CmBluService {
  private _serviceName = 'CmBluService';
  private _browser: Browser;
  private _page: Page;
  private _pagination = { pagesQty: 0, paginatioButtonsQty: 0 };
  private _maxTimeout: number = parseInt(process.env.CMB_SERVICE_MAX_TIMEOUT);
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
    console.info(
      `[${this._serviceName}]:(${new Date()}) init() - [STATUS {START SCRAPE}]`,
    );

    this._filters = filters || defaultFilters;
    this._filteredUrl = this.buildUrl(this._filters);
    console.info(
      `[${
        this._serviceName
      }]:(${new Date()}) init() - [STATUS {genereted URL}: ${
        this._filteredUrl
      }]`,
    );
    this._docLabel.set(
      this._filters.type,
      DocLabelCmBluTypes[this._filters.type.toUpperCase()],
    );
    this._docLabel.set(
      this._filters.subType,
      DocLabelCmBluSubTypes[this._filters.subType.toUpperCase()],
    );

    this._browser = await puppeteer.launch({ headless: 'new' });
    this._page = await this._browser.newPage();
  }

  public async scrape(filters?: Filters): Promise<ExtractedDocCmBluDto[]> {
    try {
      await this.init(filters);
      return await (await this.scrapeDocLinks()).getDocsData();
    } catch (error) {
      console.error(`[${this._serviceName}]:(${new Date()}) [STATUS {ERROR}]`);
      console.error(error);
    } finally {
      this._browser.close();
      console.info(
        `[${
          this._serviceName
        }]:(${new Date()}) scrape() - [STATUS {browser close}]`,
      );
    }
  }

  private async getDocsData(): Promise<ExtractedDocCmBluDto[]> {
    console.info(`[${this._serviceName}]:(${new Date()}) getDocsData()`);

    const docsInfos = await this.scrapeDocsInfos();
    await this._browser.close();
    console.info(
      `[${
        this._serviceName
      }]:(${new Date()}) getDocsData() - [STATUS {browser close}]`,
    );
    const { stringStandardize } = ScrappingStandardizeService;

    return docsInfos.map((infos) => {
      const parsedInfos = [];
      let propositionPageLink;
      infos.forEach(({ key, value, arrValue, link, pageLink }) => {
        propositionPageLink = pageLink;
        const keyToCompare = stringStandardize(key);
        if (
          keyToCompare === 'DATADODOCUMENTO' ||
          keyToCompare === 'SITUAÇAO' ||
          keyToCompare === 'SITUACAO' ||
          keyToCompare === 'EMENTA' ||
          keyToCompare === 'SESSAO'
        )
          parsedInfos.push(value);

        if (keyToCompare === 'AUTORES' && arrValue.length > 0)
          parsedInfos.push(arrValue);

        if (keyToCompare === 'DOCUMENTOIMPRESSAO')
          parsedInfos.push({ title: value, link });
      });

      return new ExtractedDocCmBluDto(
        propositionPageLink,
        this._docLabel.get(this._filters.type),
        this._docLabel.get(this._filters.subType),
        parsedInfos[0], // DATE
        parsedInfos[1], // AUTHORS
        parsedInfos[3], // STATUS
        parsedInfos[4], // EMENTA
        parsedInfos[2], // DOC
        parsedInfos[5], // SESSION
      );
    });
  }

  private async scrapeDocsInfos(): Promise<InfoElement[][]> {
    console.info(`[${this._serviceName}]:(${new Date()}) scrapeDocsInfos()`);
    const docsInfosPromise = this._docLinks.map(async (endpoint) => {
      const page = await this._browser.newPage();
      const propositionURL = this.buildUrl({ endpoint });
      console.info(
        `[${
          this._serviceName
        }]:(${new Date()}) scrapeDocsInfos() - [STATUS {genereted URL}: ${propositionURL}]`,
      );
      await page.goto(propositionURL, {
        timeout: this._maxTimeout,
      });

      const infoItems = await page.$$('li.documento-item');

      return await this.scrapeDocInfos(infoItems, propositionURL);
    });

    return Promise.all(docsInfosPromise);
  }

  private async scrapeDocInfos(
    infoItems: ElementHandle<HTMLLIElement>[],
    pageLink: string,
  ) {
    const docInfos: InfoElement[] = [];
    for await (const infoItem of infoItems) {
      docInfos.push({
        pageLink,
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
        arrValue: await (async () => {
          try {
            return await infoItem.$$eval('.info-value a', (anchors) =>
              anchors.map((anchor) => anchor.textContent.trim()),
            );
          } catch (error) {
            return undefined;
          }
        })(),
        link: await (async () => {
          try {
            return await infoItem.$eval('a.info-value', (a) =>
              a.getAttribute('href'),
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
    console.info(`[${this._serviceName}]:(${new Date()}) scrapeDocLinks()`);
    await this._page.goto(this._filteredUrl, {
      waitUntil: 'domcontentloaded',
    });

    for (let i = 1; i <= (await this.getNextPage(i)); i++) {
      console.info(
        `[${
          this._serviceName
        }]:(${new Date()}) getNextPage() - [STATUS {Navigate to page: ${i}}]`,
      );
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
