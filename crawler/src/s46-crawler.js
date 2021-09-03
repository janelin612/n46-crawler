const fs = require('fs');
const Crawler = require('crawler');
const Image = require('./image');
const k46 = require('./k46-crawler');

const DOMAIN = 'https://sakurazaka46.com';
const BLOG_URL = `${DOMAIN}/s/s46/diary/blog/list`;

const RESULT_JSON_FILE = './viewer/result.json';
const MEMBER_INFO_FILE = './viewer/member.json';

module.exports = {
  listMember() {
    memberListCrawler.queue(BLOG_URL);
  },
  download(ct, only) {
    if (isNaN(ct)) {
      console.warn('wrong member ct');
      return;
    }
    ct = parseInt(ct);
    if (ct < 10) {
      ct = '0' + ct;
    }
    memberCt = ct;
    onlyMode = only;
    memberInfoCrawler.queue(`${DOMAIN}/s/s46/artist/${ct}`);
    pageCursor.queue(`${BLOG_URL}?ct=${ct}&page=0`);
  }
};

/**
 * 嚴格模式
 * 開啟此模式時將不會往前追加櫸坂時期的部落格文章
 */
let onlyMode = false;
let memberCt = '';

let memberListCrawler = new Crawler({
  maxConnections: 1,
  callback(error, res, done) {
    if (error) {
      console.warn(error);
    } else {
      let $ = res.$;
      let list = [];
      $('.com-blog-circle li a').each((index, value) => {
        value = $(value);
        let ct = new URLSearchParams(value.attr('href')).get('ct');
        let name = value.find('p.name').text().trim();
        list.push({ ct: ct, name: name });
      });
      list
        .sort((a, b) => {
          return parseInt(a.ct) - parseInt(b.ct);
        })
        .forEach((item) => {
          console.log(`${item.ct} | ${item.name}`);
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
      $('.com-blog-part .box a').each((index, value) => {
        value = $(value);
        let url = DOMAIN + value.attr('href');
        contentCrawler.queue(url);
      });
      //找下一頁
      $('.com-pager ul li').each((index, value) => {
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

var result = [];
let contentCrawler = new Crawler({
  maxConnections: 10,
  jQuery: { name: 'cheerio', options: { decodeEntities: false } },
  callback(error, res, done) {
    if (error) {
      console.warn(error);
    } else {
      let $ = res.$;

      $('article.post .box-article img').each((index, value) => {
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

      let title = $('article.post h1.title').text().trim();
      let datetime = $('.blog-foot .date').text().trim();
      let content = $('article.post .box-article').html();
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
  if (!onlyMode) {
    k46.download(memberCt, true);
  }
});

let memberInfoCrawler = new Crawler({
  maxConnections: 1,
  callback(error, res, done) {
    if (error) {
      console.warn(error);
    } else {
      let $ = res.$;

      //成員姓名
      let name_hiragana = $('.prof-elem p.kana').text().trim();
      let name = $('.prof-elem p.name').text().trim();

      //照片
      let img = $('.member-profcont p.ph img').attr('src');
      img = Image.download(DOMAIN + img);

      //table
      let introList = [];
      $('.prof-elem .dltb dt').each((index, item) => {
        let key = $(item).text().trim();
        let value = $(item).next('dd').text().trim();
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
