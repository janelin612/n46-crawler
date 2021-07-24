/**
 * 為了爬網友備份的老橋部落格而特化出來的爬蟲
 * 資料來源: https://www.ptt.cc/bbs/Nogizaka46/M.1487774034.A.B74.html
 */

const fs = require('fs');
const Crawler = require('crawler');
const Image = require('./image');

const FOLDER = './HashimotoNanami/';

/**
 * 執行重新排序
 */
var resort = false;

//自command line帶入參數
var argv = require('minimist')(process.argv.slice(2));
resort = argv.resort != null;

/**
 * 儲存最後結果
 */
var result = {};

var multi = new Crawler({
  maxConnections: 1,
  jQuery: { name: 'cheerio', options: { decodeEntities: false } },
  callback: function (error, res, done) {
    if (error) {
      console.log(error);
    } else {
      var $ = res.$;

      $('#sheet h1.clearfix').each(function (index, value) {
        //將圖片網址改為本地端位置，並下載圖片
        $(value)
          .nextAll('div.entrybody')
          .first()
          .find('img')
          .each(function (index, value) {
            var src = $(value).attr('src');

            var localLocation = 'img/' + src.replace(/^http\S\/\/\S+?\//, '');
            $(value).attr('src', localLocation);
            //把圖片搬過去
            if (fs.existsSync(FOLDER + src)) {
              // fs.createReadStream(FOLDER + src).pipe(fs.createWriteStream("viewer/img/" + src));
              fs.renameSync(FOLDER + src, 'viewer/img/' + src);
            }
          });

        //處理href被多包一層的問題
        $(value)
          .nextAll('div.entrybody')
          .first()
          .find('a')
          .each(function (index, value) {
            var href = $(value).attr('href');
            if (href.startsWith('javascript')) {
              href = href
                .replace(/\n/g, '')
                .replace(/javascript.+tion=/, '')
                .replace(/'/g, '');
              $(value).attr('href', href);
            }
          });

        var item = {
          datetime: $(value)
            .nextAll('div.entrybottom')
            .first()
            .text()
            .split('｜')[0]
            .trim(),
          author: $(value).find('.heading .author').text(),
          title: $(value).find('.heading a').html(),
          url: '#',
          content: $(value).nextAll('div.entrybody').first().html()
        };
        var urlArr = $(value).find('.heading a').attr('href').split('/');
        var id = urlArr[urlArr.length - 1].split('.')[0];

        result[parseInt(id)] = item;
        console.log(id + ' | ' + item.title);
      });

      var fileName = './viewer/result-unsorted.json';
      fs.writeFile(fileName, JSON.stringify(result), 'utf8');
    }
    done();
  }
});

if (!resort) {
  fs.readdir(FOLDER, (err, files) => {
    files.forEach((file) => {
      //htm結尾，且跳過留言相關的畫面
      if (file.endsWith('htm') && file.indexOf('cp=') == -1) {
        if (file.startsWith('-') && file.indexOf('archives') == -1) {
          fs.readFile(FOLDER + file, function (err, html) {
            multi.queue({ html: html });
          });
        }
      }
    });
  });
} else {
  var json = JSON.parse(fs.readFileSync('viewer/result-unsorted.json', 'utf8'));

  //比對 確認被我跳過的那些html畫面都是不用爬的
  fs.readdir(FOLDER, (err, files) => {
    files.forEach((file) => {
      if (
        file.startsWith('0') &&
        file.endsWith('htm') &&
        file.indexOf('cp=') == -1
      ) {
        var k = file.split('.')[0];
        console.log(k + 'isExist?' + (parseInt(k) in json));
      }
    });
  });

  //重新排序
  var sortedResult = [];
  var keyArr = Object.keys(json);
  for (i = 0; i < keyArr.length; i++) {
    console.log(keyArr[i]);
    sortedResult.unshift(json[keyArr[i]]);
  }
  var fileName = './viewer/result.json';
  fs.writeFile(fileName, JSON.stringify(sortedResult), 'utf8');
}
