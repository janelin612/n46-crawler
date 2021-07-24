const Fs = require('fs');
const Crawler = require('crawler');
const Image = require('./image');

const DOMAIN = 'http://www.keyakizaka46.com';
const BLOG_URL = `${DOMAIN}/s/k46o/diary/member/list?`;

const RESULT_JSON_FILE = './viewer/result.json';
const MEMBER_INFO_FILE = './viewer/member.json';

/**
 * 欅坂46成立時間 所有部落格文章都不應早於此日期
 */
const TIME_BEGIN = new Date('2015-08-21');

module.exports = {
  printMemberList: () => {
    memberListCrawler.queue(BLOG_URL);
  },
  downloadMemberBlog: (ct) => {
    if (ct == null || ct.length == 0 || isNaN(new Number(ct))) {
      console.log('wrong member ct');
      return;
    }
    if (new Number(ct) < 10) {
      ct = '0' + ct;
    }

    contentCrawler.queue(generateTimeTable(ct));
    memberInfoCrawler.queue(`${DOMAIN}/s/k46o/artist/${ct}`);
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
      let list = [];
      $('.box-memberBlog ul.thumb li').each((index, value) => {
        let ct = $(value).data('member');
        let name = $(value).find('p.name').text().trim();
        list.push({ ct: ct, name: name });
      });

      list
        .sort((a, b) => {
          return new Number(a.ct) - new Number(b.ct);
        })
        .forEach((item) => {
          console.log(`${item.ct} | ${item.name}`);
        });
    }
    done();
  }
});

/**
 * 儲存最後結果
 */
var result = [];
/**
 * 自每月清單中取得內文
 */
let contentCrawler = new Crawler({
  maxConnections: 10,
  jQuery: { name: 'cheerio', options: { decodeEntities: false } },
  callback: (error, res, done) => {
    if (error) {
      console.warn(error);
    } else {
      let $ = res.$;

      //拔掉DecoMailer的圖片備份連結
      $('.box-main a').each((index, value) => {
        let href = $(value).attr('href');
        if (href != null && href.indexOf('dcimg.awalker.jp') != -1) {
          let child = $(value).html();
          $(value).after(child);
          $(value).remove();
        }
      });

      //將圖片網址改為本地端位置，並下載圖片
      $('.box-main img').each((index, value) => {
        let src = $(value).attr('src');
        if (src != null && src.length > 0 && !src.startsWith('blob')) {
          let localPath = Image.download(src);
          $(value).attr('src', localPath);
        }
      });

      $('.box-main article').each((index, value) => {
        let item = {
          datetime: $(value).find('.box-bottom li:first-of-type').text().trim(),
          author: $(value).find('.box-ttl p.name').text().trim(),
          title: $(value).find('.box-ttl h3').text().trim(),
          url: DOMAIN + $(value).find('.box-ttl h3 a').attr('href'),
          content: $(value).find('div.box-article').html()
        };
        result.push(item);
        console.log(`${item.datetime} | ${item.title}`);
      });
    }
    done();
  }
});

/**
 * 重新排序結果並寫入檔案
 */
contentCrawler.on('drain', function () {
  let regex = /\/([0-9]+)\?/; //取出文章ID區塊數字的部分
  result.sort((a, b) => {
    let idA = a.url.match(regex)[1];
    let idB = b.url.match(regex)[1];
    return new Number(idB) - new Number(idA);
  });
  Fs.writeFileSync(RESULT_JSON_FILE, JSON.stringify(result), 'utf8');
});

/**
 * 產生現在時間至創團日的所有年月列表並組合出網址
 */
function generateTimeTable(ct) {
  let now = new Date();
  let list = [];
  while (now > TIME_BEGIN) {
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    if (new Number(month) < 10) {
      month = '0' + month;
    }
    list.push(`${BLOG_URL}ct=${ct}&dy=${year}${month}`);
    now.setMonth(now.getMonth(), 0);
  }
  return list;
}

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

      //處理成員頭像
      let memberImage = $('div.box-profile_img img').first().attr('src');
      if (memberImage) {
        memberImage = Image.download(memberImage);
      }

      //成員姓名
      let memberName_hiragana = $('.box-profile_text p.furigana').text().trim();
      let memberName = $('.box-profile_text p.name').text().trim();

      //table
      let introList = [];
      $('.box-info dl dd').each((index, item) => {
        let key = $(item).text().replace(':', '').trim();
        let value = $(item).nextAll('dt').first().text().trim();
        introList.push({
          key: key,
          value: value
        });
      });

      //write all
      let member = {
        name: memberName,
        name_hiragana: memberName_hiragana,
        image: memberImage,
        intro: introList,
        tag: []
      };
      Fs.writeFileSync(MEMBER_INFO_FILE, JSON.stringify(member), 'utf8');
    }
    done();
  }
});
