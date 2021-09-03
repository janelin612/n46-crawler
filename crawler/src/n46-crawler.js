const fs = require('fs');
const Crawler = require('crawler');
const ImageUtil = require('./image');

const BLOG_URL = 'http://blog.nogizaka46.com/';
/** Demo Site 的目錄位置 */
const PROJECT_FOLDER = '../../n46-crawler/mb/';
const RESULT_JSON_FILE = 'result.json';
const MEMBER_INFO_FILE = 'member.json';

let folder = './viewer/';

module.exports = {
  listMember() {
    memberListCrawler.queue(BLOG_URL);
  },
  download(memberPath, save) {
    if (save) {
      createDirectory(memberPath);
    }
    ImageUtil.setDirectory(folder);
    archiveListCrawler.queue(BLOG_URL + memberPath);
  }
};

/**
 * 如果 Demo Site 存在，就不把資料存到預設的./viewer內
 */
function createDirectory(memberPath) {
  if (fs.existsSync(PROJECT_FOLDER)) {
    folder = `${PROJECT_FOLDER}${memberPath}/`;
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
  }
}

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
      $('#sidemember a').each((index, value) => {
        let path = $(value).attr('href').replace('./', '');
        let name = '';
        if ($(value).find('img').length > 0) {
          name = $(value).find('.kanji').text();
        } else {
          name = $(value).text();
        }
        console.log(name + ' \t' + path);
      });
    }
    done();
  }
});

/**
 * 自畫面右側取得年月清單
 */
let archiveListCrawler = new Crawler({
  maxConnections: 1,
  callback: (error, res, done) => {
    if (error) {
      console.warn(error);
    } else {
      let $ = res.$;
      let list = [];
      $('#sidearchives select option').each((index, value) => {
        let url = $(value).attr('value');
        if (url) {
          list.push(url);
        }
      });
      paginateListCrawler.queue(list);

      let memberUrl = $('#sideprofile .txt p a').attr('href');
      if (memberUrl != null && memberUrl.length > 0) {
        memberInfoCrawler.queue(memberUrl);
      }
    }
    done();
  }
});

/**
 * 取回單一年月的分頁清單
 */
let paginateListCrawler = new Crawler({
  maxConnections: 1,
  callback: (error, res, done) => {
    if (error) {
      console.warn(error);
    } else {
      let $ = res.$;
      let URL = res.request.uri.href;

      let size = $('#sheet .paginate:first-child a').length;
      if (size == 0) size += 1;
      for (let i = 0; i < size; i++) {
        blogLinkListCrawler.queue(`${URL}&p=${i + 1}`);
      }
    }
    done();
  }
});

/**
 * 取回每一個分頁的標題清單
 */
let blogLinkListCrawler = new Crawler({
  maxConnections: 5,
  jQuery: {
    name: 'cheerio',
    options: {
      decodeEntities: false
    }
  },
  callback: (error, res, done) => {
    if (error) {
      console.warn(error);
    } else {
      let $ = res.$;
      $('#sheet .entrytitle a').each((index, value) => {
        let link = $(value).attr('href');
        blogContentCrawler.queue(link);
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
 * 下載內文資訊
 */
let blogContentCrawler = new Crawler({
  maxConnections: 5,
  jQuery: {
    name: 'cheerio',
    options: {
      decodeEntities: false
    }
  },
  callback: (error, res, done) => {
    if (error) {
      console.warn(error);
    } else {
      let $ = res.$;

      //拔掉DecoMailer的圖片備份連結
      $('#sheet div.entrybody a').each((index, value) => {
        let href = $(value).attr('href');
        if (href != null && href.indexOf('dcimg.awalker.jp') != -1) {
          let child = $(value).html();
          $(value).after(child);
          $(value).remove();
        }
      });

      //將圖片網址改為本地端位置，並下載圖片
      $('#sheet div.entrybody img').each(function (index, value) {
        let src = $(value).attr('src');
        if (src != null && src.length > 0 && !src.startsWith('blob')) {
          let localPath = ImageUtil.download(src);
          $(value).attr('src', localPath);
        }
      });

      let item = {
        datetime: $('#sheet div.entrybottom').text().trim(),
        author: $('#sheet h1.clearfix .heading .author').text(),
        title: $('#sheet h1.clearfix .heading .entrytitle').html(),
        url: res.request.uri.href,
        content: $('#sheet div.entrybody').html()
      };
      result.push(item);
      console.log(item.datetime + ' | ' + item.title);
    }
    done();
  }
});

/**
 * 啟用多線程下載的話最後需要重新排序
 */
blogContentCrawler.on('drain', function () {
  const regex = /20[0-9]{2}\/[0-9]{2}\/[0-9]{6}/;
  result.sort((a, b) => {
    let idB = b.url.match(regex)[0].replace(/\//g, '');
    let idA = a.url.match(regex)[0].replace(/\//g, '');
    return parseInt(idB) - parseInt(idA);
  });
  fs.writeFileSync(folder + RESULT_JSON_FILE, JSON.stringify(result), 'utf8');
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
      let memberImage = $('#profile img').first().attr('src');
      if (memberImage) {
        memberImage = ImageUtil.download(memberImage);
      }

      //成員姓名
      let memberName_hiragana = $('#profile div.txt h2 span').text();
      $('#profile div.txt h2 span').remove();
      let memberName = $('#profile div.txt h2').text();

      //table
      let introList = [];
      $('#profile div.txt dl dt').each((index, item) => {
        let key = $(item).text().replace('：', '');
        let value = $(item).nextAll('dd').first().text();
        introList.push({
          key: key,
          value: value
        });
      });

      //tag
      let tagList = [];
      $('#profile div.txt div.status div').each((index, item) => {
        tagList.push($(item).text());
      });

      //write all
      let member = {
        name: memberName,
        name_hiragana: memberName_hiragana,
        image: memberImage,
        intro: introList,
        tag: tagList
      };
      fs.writeFileSync(
        folder + MEMBER_INFO_FILE,
        JSON.stringify(member),
        'utf8'
      );
    }
    done();
  }
});
