import { Injectable } from '@nestjs/common';
import { StrategyService } from '../strategy.service';
import puppeteer, { Browser, Page } from 'puppeteer';
import Filters from './domain/filters';
import { DocTypes } from './enums/docTypes.enum';
import { DocSubTypes } from './enums/docSubTypes.enum';

@Injectable()
export class CmbStrategyService extends StrategyService {
  private browser: Browser;
  private page: Page;
  private pagination = { pagesQty: 0, paginatioButtonsQty: 0 };
  private docLinks: string[] = [];

  async init(): Promise<void> {
    this.browser = await puppeteer.launch({ headless: true });
    this.page = await this.browser.newPage();
  }

  async scrape() {
    if (!this.browser) await this.init();
    await this.getDocLinks();
    console.log(this.docLinks);
  }

  async getDocLinks(): Promise<string[]> {
    const url = this.filterUrl({
      type: DocTypes.PROPOSICOES,
      subType: DocSubTypes.MOCAO,
      year: 2023,
    });
    await this.page.goto(url);

    for (let i = 1; i <= (await this.getNextPage(i)); i++) {
      await this.page.goto(url + '/page:' + i);
      const docsList = await this.page.$$('.list-documentos li');
      for (const li of docsList)
        this.docLinks.push(await li.$eval('a', (a) => a.getAttribute('href')));
    }

    return this.docLinks;
  }

  async getNextPage(pageNumber: number): Promise<number> {
    if (this.pagination.pagesQty === 0) {
      this.pagination.paginatioButtonsQty = (
        await this.page.$$('.pagination.pagination-alt li')
      ).length;
      this.pagination.pagesQty = this.pagination.paginatioButtonsQty - 1;
    }

    if (
      pageNumber + 1 === this.pagination.paginatioButtonsQty &&
      this.pagination.paginatioButtonsQty < 11
    ) {
      this.pagination.paginatioButtonsQty = (
        await this.page.$$('.pagination.pagination-alt li')
      ).length;
      this.pagination.pagesQty = this.pagination.pagesQty + 4;
    }

    if (
      pageNumber === this.pagination.pagesQty &&
      this.pagination.paginatioButtonsQty === 11
    ) {
      this.pagination.paginatioButtonsQty = (
        await this.page.$$('.pagination.pagination-alt li')
      ).length;
      this.pagination.pagesQty = this.pagination.pagesQty + 4;
    }

    return this.pagination.pagesQty;
  }

  filterUrl({ type, subType, year }: Filters) {
    const baseUrl = process.env.CMB_URL + process.env.CMB_ENDPOINT;
    const filters = [
      type && '/tipo:' + type,
      type && subType && '/subtipo:' + subType,
      year && '/ano:' + year,
    ].filter(Boolean);
    return baseUrl + filters.join('');
  }
}
