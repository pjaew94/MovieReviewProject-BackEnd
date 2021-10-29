import puppeteer from "puppeteer";

export interface IScraperInitialize {
  query: string;
  googlePage: puppeteer.Page;
  rottenPage: puppeteer.Page;
  imbdPage: puppeteer.Page;
  initialize(): void;
}
