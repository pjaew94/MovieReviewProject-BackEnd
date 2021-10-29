import puppeteer from "puppeteer";
import { IScraperInitialize } from "../types";

class ScraperInitialize implements IScraperInitialize {
  googlePage!: puppeteer.Page;
  rottenPage!: puppeteer.Page;
  imbdPage!: puppeteer.Page;
  browser!: puppeteer.Browser;
  query: string;

  constructor(query: string) {
    this.query = query;
  }

  async initialize() {
    this.browser = await puppeteer.launch({ headless: false });
    this.googlePage = await this.browser.newPage();
    await this.googlePage.goto("https://www.google.com/");
    await this.googlePage.waitForSelector(".gLFyf");
    await this.googlePage.type(".gLFyf", this.query);
    await this.googlePage.waitForSelector("ul.G43f7e > li:first-child");
    await this.googlePage.click("ul.G43f7e > li:first-child");

    this.assignRottenImbd();
  }

  async assignRottenImbd() {
    await this.googlePage.waitForSelector("[jscontroller='cSX9Xe']");

    const assignURLs = await this.googlePage.evaluate(() => {
      let urls: string[] = [];
      const ratings = document.querySelectorAll("a.TZahnb.vIUFYd");
      urls.push(ratings[0].getAttribute("href")!);
      urls.push(ratings[1].getAttribute("href")!);
      return urls;
    });
    // this.imbdPage = await this.browser.newPage();
    // await this.imbdPage.goto(assignURLs[0]);

    this.imbd(assignURLs[0])
    this.rottenTomato(assignURLs[1]);

  }

  async google() {
    await this.googlePage.waitForSelector("[jscontroller='cSX9Xe']");

    const getSourcesToWatch = await this.googlePage.evaluate(() => {
      let viewSources: any[] = [];
      const listOfViewWhere = document.querySelectorAll("div.nGOerd a");

      listOfViewWhere.forEach((source) => {
        const sourceHref = source.getAttribute("href");
        const sourceImgSrc = source.querySelector("img")?.getAttribute("src");
        const sourceName = source.querySelector(".ellip.bclEt")?.textContent;
        const sourceType = source.querySelector(".ellip.rsj3fb")?.textContent;
        let obj = {
          sourceHref,
          sourceImgSrc,
          sourceName,
          sourceType,
        };

        viewSources.push(obj);
      });
      return viewSources;
    });

    const getRatings = await this.googlePage.evaluate(() => {
      let ratings: any[] = [];
      const listOfRatings = document.querySelectorAll("a.TZahnb.vIUFYd");
      listOfRatings.forEach((rating) => {
        const ratingHref = rating.getAttribute("href");
        const score = rating.querySelector("span.gsrt.KMdzJ")?.textContent;
        const source = rating.querySelector("span.rhsB.pVA7K")?.textContent;

        ratings.push({
          ratingHref: ratingHref,
          score: score,
          source: source,
        });
      });

      return ratings;
    });
  }

  async rottenTomato(url: string) {
    this.rottenPage = await this.browser.newPage();
    await this.rottenPage.goto(url);
    await this.rottenPage.waitForSelector("div.panel-body.content_body");
    const getMovieDescription = await this.rottenPage.evaluate(() => {
      return document.querySelector("div#movieSynopsis")?.textContent;
    });

    // const getBasicMovieInfo = await this.page.evaluate(() => {
    //   let basicInfo: any = {};
    //   const title = document.querySelector("h1[slot='title']");
    //   basicInfo["title"] = "Water";
    //   const infoList = document.querySelectorAll(
    //     "li[data-qa='movie-info-item']"
    //   );
    //   infoList.forEach((item) => {
    //     const key = item.querySelector(
    //       "[data-qa='movie-info-item-label']"
    //     )?.textContent;
    //     const value = item.querySelector(
    //       "[data-qa='movie-info-item-value']"
    //     )?.textContent;

    //     basicInfo[key!] = value;
    //   });
    //   return basicInfo;
    // });

    // console.log(getBasicMovieInfo)

    const getCriticReviews = await this.rottenPage.evaluate(() => {
      let criticReviews: any[] = [];
      const reviewList = document.querySelectorAll("critic-review-bubble");

      reviewList.forEach((r) => {
        const reviewQuote = r.getAttribute("reviewquote");
        const reviewDate = r.getAttribute("createdate");
        const criticName = r
          .querySelector("a.critic-name")
          ?.textContent?.replace(/\n+/g, "")
          .trim();
        const criticPublisher = r
          .querySelector("a.critic-source")
          ?.textContent?.replace(/\n+/g, "")
          .trim();

        criticReviews.push({
          reviewQuote,
          reviewDate,
          criticName,
          criticPublisher,
        });
      });

      return criticReviews;
    });
  }

  async imbd(url: string) {
        this.imbdPage = await this.browser.newPage();
        await this.imbdPage.goto(url);

    const posterImgURL = await this.imbdImgExtractor(
      "a.ipc-lockup-overlay.ipc-focusable"
    );
    console.log(posterImgURL)
    const bgImgURL = await this.imbdImgExtractor(
      "a[data-testid='photos-image-overlay-1']"
    );
    console.log(bgImgURL)
  }

  async imbdImgExtractor(target: string) {
    await this.imbdPage.waitForSelector(target);

    const imgHref = await this.imbdPage.evaluate((target) => {
      return document.querySelector(target)?.getAttribute("href");
    }, target);
    const newPage = await this.browser.newPage();
    await newPage.goto("https://www.imdb.com" + imgHref);

    const getImgURL = await newPage.evaluate(() => {
      return document.querySelector("img")?.getAttribute("src");
    });

    return getImgURL;
  }
}

const searching = async () => {
  const newSearch = new ScraperInitialize("Waterboy");
  await newSearch.initialize();
};

searching();
