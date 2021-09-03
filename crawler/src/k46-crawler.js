const fs = require('fs');
const Crawler = require('crawler');
const Image = require('./image');

const DOMAIN = 'https://www.keyakizaka46.com';
const BLOG_URL = `${DOMAIN}/s/k46o/diary/member/list`;

const RESULT_JSON_FILE = './viewer/result.json';
const MEMBER_INFO_FILE = './viewer/member.json';

module.exports = {
  listMember() {
    memberListCrawler.queue(BLOG_URL);
  },
  download(ct, append) {
    if (isNaN(ct)) {
      console.warn('wrong member ct');
      return;
    }
    ct = parseInt(ct);
    if (ct < 10) {
      ct = '0' + ct;
    }

    appendMode = append;
    pageCursor.queue(`${BLOG_URL}?ct=${ct}&page=0`);
    if (!appendMode) {
      memberInfoCrawler.queue(`${DOMAIN}/s/k46o/artist/${ct}`);
    }
  }
};

/**
 * 拼接模式
 * 開啟此模式時舊的result不會被覆寫，而是直接接在陣列後端
 * 用來將同一成員於櫻坂、櫸坂兩個時期的文章全部整合
 */
let appendMode = false;

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
          return parseInt(a.ct) - parseInt(b.ct);
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
let pageCursor = new Crawler({
  maxConnections: 3,
  callback(error, res, done) {
    if (error) {
      console.warn(error);
    } else {
      let $ = res.$;
      //找下一頁
      $('.pager ul li').each((index, value) => {
        value = $(value);
        if (value.find('span.active').length > 0) {
          let next = value.next();
          if (next.find('a').length > 0) {
            let url = DOMAIN + next.children('a').attr('href');
            pageCursor.queue(url);
          }
        }
      });

      //儲存每一篇文章
      $('.box-content .box-main article').each((index, value) => {
        handleArticle($, $(value));
      });
    }
    done();
  }
});

function handleArticle($, article) {
  //拔掉DecoMailer的圖片備份連結
  article.find('.box-article a').each((index, value) => {
    let href = $(value).attr('href');
    if (href != null && href.indexOf('dcimg.awalker.jp') != -1) {
      let child = $(value).html();
      $(value).after(child);
      $(value).remove();
    }
  });

  //下載圖片
  article.find('.box-article img').each((index, value) => {
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

  let datetime = article.find('.box-bottom li:first-of-type').text().trim();
  let author = article.find('.box-ttl p.name').text().trim();
  let title = article.find('.box-ttl h3').text().trim();
  let url = new URL(DOMAIN + article.find('.box-ttl h3 a').attr('href'));
  url = url.origin + url.pathname;

  //透過預先移除多餘段落的方式減少因為div沒有關閉而弄壞爬蟲
  article.find('.box-bottom').remove();
  let content = article.children('div.box-article').html();

  let item = {
    datetime,
    author,
    title,
    url,
    content
  };
  result.push(item);
  console.log(`${item.datetime} | ${item.title}`);
}

/**
 * 重新排序結果並寫入檔案
 */
pageCursor.on('drain', function () {
  const regex = /\/(\d+)$/; //取出文章ID區塊數字的部分
  result.sort((a, b) => {
    let idA = a.url.match(regex)[1];
    let idB = b.url.match(regex)[1];
    return parseInt(idB) - parseInt(idA);
  });

  if (!appendMode) {
    fs.writeFileSync(RESULT_JSON_FILE, JSON.stringify(result), 'utf8');
  } else {
    result = JSON.parse(fs.readFileSync(RESULT_JSON_FILE)).concat(result);
    fs.writeFileSync(RESULT_JSON_FILE, JSON.stringify(result), 'utf8');
  }
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
      fs.writeFileSync(MEMBER_INFO_FILE, JSON.stringify(member), 'utf8');
    }
    done();
  }
});
