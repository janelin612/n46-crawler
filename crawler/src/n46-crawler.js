const fs = require('fs');
const Crawler = require('crawler');
const ImageUtil = require('./image');

const DOMAIN = 'https://www.nogizaka46.com';
const MEMBER_PAGE = `${DOMAIN}/s/n46/artist`;
const BLOG_PAGE = `${DOMAIN}/s/n46/diary/MEMBER`;

const RESULT_JSON_FILE = 'result.json';
const MEMBER_INFO_FILE = 'member.json';
const DIR = './viewer/';

module.exports = {
  listMember() {
    memberListCrawler.queue(BLOG_PAGE);
  },
  download(ct) {
    memberInfoCrawler.queue(`${MEMBER_PAGE}/${ct}`);
    pageCursor.queue(`${BLOG_PAGE}/list?ct=${ct}&page=0`);
  }
};

/**
 * 取得成員列表並輸出在終端機上
 */
let memberListCrawler = new Crawler({
  maxConnections: 1,
  callback: (error, res, done) => {
    if (error) {
      console.warn(error);
    } else {
      let $ = res.$;
      $('main section div.ba--ml__list>div').each((index, value) => {
        let ct = $(value)
          .find('a.hv--thumb')
          .attr('href')
          .match(/ct=(\d+)/)[1];
        let name = $(value).find('p.f--head').text();
        console.log(`${ct}\t${name}`);
      });
    }
    done();
  }
});

let pageCursor = new Crawler({
  maxConnections: 1,
  callback(error, res, done) {
    if (error) {
      console.warn(error);
    } else {
      let $ = res.$;
      //拉每一則的清單
      $('main div.bl--list a').each((index, value) => {
        let url = DOMAIN + $(value).attr('href');
        contentCrawler.queue(url);
      });
      //找下一頁
      $('main div.bl--pg ul li').each((index, value) => {
        value = $(value);
        if (value.find('span.active').length > 0) {
          let next = value.next();
          if (next.find('a').length > 0) {
            let url = DOMAIN + next.children('a').attr('href');
            pageCursor.queue(url);
          }
        }
      });
    }
    done();
  }
});

/**
 * 儲存最後結果
 */
var result = [];
let contentCrawler = new Crawler({
  maxConnections: 10,
  jQuery: { name: 'cheerio', options: { decodeEntities: false } },
  callback(error, res, done) {
    if (error) {
      console.warn(error);
    } else {
      let $ = res.$;

      /**比對官網的圖床*/
      const REGEX_MATCH_IMG_URL =
        /https{0,1}:\/\/\S+?\.nogizaka46\.com\/\S+\.(jpg|jpeg|png|gif)/;

      $('main div.bd--edit a').each((index, value) => {
        let href = $(value).attr('href');
        // 拔掉DecoMailer的圖片備份連結
        if (href && href.indexOf('dcimg.awalker.jp') != -1) {
          let child = $(value).html();
          $(value).after(child);
          $(value).remove();
        }

        // 處理早期的預覽圖片
        if (href && href.match(REGEX_MATCH_IMG_URL)) {
          $(value).children('img').attr('src', href);
          let child = $(value).html();
          $(value).after(child);
          $(value).remove();
        }
      });

      $('main div.bd--edit img').each((index, value) => {
        value = $(value);
        value.removeAttr('width');
        value.removeAttr('height');
        let src = value.attr('src');
        if (src && src.match(/(^\/.+)|(^http.+)/)) {
          let localPath;
          if (src.startsWith('/')) {
            localPath = ImageUtil.download(DOMAIN + src);
          } else {
            localPath = ImageUtil.download(src);
          }
          value.attr('src', localPath);
        }
      });

      // 處置一些因為div沒有關閉造成的錯誤
      $('main div.bd--edit .m--pnv').remove();
      $('main div.bd--edit .bd--cmt').remove();
      $('main div.bd--edit .bd--aside').remove();

      let title = $('title').text().trim();
      let datetime = $('header div.bd--hd__sub p.bd--hd__date').text().trim();
      let content = $('main div.bd--edit').html();
      let url = new URL(res.request.uri.href);
      url = url.origin + url.pathname;

      let item = {
        datetime,
        title,
        content,
        url
      };
      console.log(datetime + ' | ' + title);
      result.push(item);
    }
    done();
  }
});
contentCrawler.on('drain', () => {
  const regex = /\/detail\/(\d+)/;
  result.sort((a, b) => {
    let idA = a.url.match(regex)[1];
    let idB = b.url.match(regex)[1];
    return parseInt(idB) - parseInt(idA);
  });
  fs.writeFileSync(DIR + RESULT_JSON_FILE, JSON.stringify(result), 'utf-8');
});

/**
 * 下載成員資訊
 */
let memberInfoCrawler = new Crawler({
  maxConnections: 1,
  callback: (error, res, done) => {
    if (error) {
      console.warn(error);
    } else {
      let $ = res.$;

      //成員姓名
      let name_hiragana = $('header div.md--hd__name p.md--hd__j.f--head')
        .text()
        .trim();
      let name = $('header h1.f--head').text().trim();

      //照片
      let img = $('main div.md--hd__fig>div').data('src');
      if (img) {
        img = ImageUtil.download(DOMAIN + img);
      }

      //table
      let introList = [];
      $('div.md--hd__ds dl').each((index, item) => {
        let key = $(item).children('dt').text().trim();
        let value = $(item).children('dd').text().trim();
        introList.push({
          key,
          value
        });
      });

      let output = {
        name,
        name_hiragana,
        intro: introList,
        image: img,
        tag: []
      };
      fs.writeFileSync(DIR + MEMBER_INFO_FILE, JSON.stringify(output), 'utf8');
    }
    done();
  }
});
