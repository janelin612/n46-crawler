const fs = require('fs');
const Crawler = require('crawler');
const Image = require('./image');

const DOMAIN = 'https://www.hinatazaka46.com';
const BLOG_URL = `${DOMAIN}/s/official/diary/member`;

const RESULT_JSON_FILE = './viewer/result.json';
const MEMBER_INFO_FILE = './viewer/member.json';

module.exports = {
  listMember() {
    memberListCrawler.queue(BLOG_URL);
  },
  download(ct) {
    if (isNaN(ct)) {
      console.warn('wrong member ct');
      return;
    }
    ct = parseInt(ct);
    if (ct == 0) {       // Special Handling for Poka
      ct = '000';
    }
    memberCt = ct;
    memberInfoCrawler.queue(`${DOMAIN}/s/official/artist/${ct}`);
    pageCursor.queue(`${BLOG_URL}/list?ima=0000&page=0&ct=${ct}&cd=member`);
  }
};

let memberListCrawler = new Crawler({
  maxConnections: 1,
  callback(error, res, done) {
    if (error) {
      console.warn(error);
    } else {
      let $ = res.$;
      let list = [];
      $('.p-blog-face__list').each((index, value) => {
        value = $(value);
        let ct = new URLSearchParams(value.attr('href')).get('ct');
        let name = value.find('.c-blog-face__name').text().trim();
        list.push({ ct: ct, name: name });
      });
      list
        .sort((a, b) => {
          return parseInt(a.ct) - parseInt(b.ct);
        })
        .forEach((item) => {
          console.log(`${item.ct} \t ${item.name}`);
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
      $('.p-button__blog_detail>.c-button-blog-detail').each((index, value) => {
        value = $(value);
        let url = DOMAIN + value.attr('href');
        contentCrawler.queue(url);
      });
      //找下一頁
      $('.p-pager--count>a').each((index, value) => {
        value = $(value);
        if (value.find('.c-pager__item--next').length > 0) {
          let url = DOMAIN + value.attr('href');
          pageCursor.queue(url);
        }
      });
    }
    done();
  }
});

var result = [];
let contentCrawler = new Crawler({
  maxConnections: 10,
  jQuery: { name: 'cheerio', options: { decodeEntities: false } },
  callback(error, res, done) {
    if (error) {
      console.warn(error);
    } else {
      let $ = res.$;

      $('.p-blog-article img').each((index, value) => {
        value = $(value);
        let src = value.attr('src');
        if (src != null && src.length > 0 && !src.startsWith('blob')) {
          let localPath;
          if (!src.startsWith('http')) {
            localPath = Image.download(DOMAIN + src);
          } else {
            localPath = Image.download(src);
          }
          value.attr('src', localPath);
        }
      });

      let title = $('.p-blog-article .c-blog-article__title').text().trim();
      let datetime = $('.p-blog-article .c-blog-article__date').text().trim();
      let content = $('.p-blog-article .c-blog-article__text').html();
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
  const regex = /\/(\d+)$/;
  result.sort((a, b) => {
    let idA = a.url.match(regex)[1];
    let idB = b.url.match(regex)[1];
    return parseInt(idB) - parseInt(idA);
  });
  fs.writeFileSync(RESULT_JSON_FILE, JSON.stringify(result), 'utf-8');

});

let memberInfoCrawler = new Crawler({
  maxConnections: 1,
  callback(error, res, done) {
    if (error) {
      console.warn(error);
    } else {
      let $ = res.$;

      //成員姓名
      let name_hiragana = $('.c-member__kana').text().trim();
      let name = $('.c-member__name--info').text().trim();

      //照片
      let img = $('.p-member__box>.c-member__thumb>img').attr('src');
      img = Image.download(img);

      //table
      let introList = [];
      $('.p-member__info-table tr').each((index, item) => {
        let key = $(item).children('.c-member__info-td__name').text().trim();
        let value = $(item).children('.c-member__info-td__text').text().trim();
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
      fs.writeFileSync(MEMBER_INFO_FILE, JSON.stringify(output), 'utf8');
    }
    done();
  }
});
