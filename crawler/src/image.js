const fs = require('fs');
const Crawler = require('crawler');

const DIR = './viewer/';
const IMAGE_FOLDER_NAME = 'img/';

/**
 * 比對網址主機名稱
 * @example https://ooo.xxx/
 */
const REGEX_HTTP_ORIGIN = /^http(s){0,1}:\/\/\S+?\//;

module.exports = {
  /** 下載圖片，並回傳檔案路徑 */
  download(imgUrl) {
    let localPath = getLocalUrl(imgUrl);
    if (!fs.existsSync(DIR + localPath)) {
      downloader.queue(imgUrl);
    }
    return localPath;
  }
};

function getLocalUrl(imgUrl) {
  return imgUrl.replace(REGEX_HTTP_ORIGIN, IMAGE_FOLDER_NAME);
}

let downloader = new Crawler({
  maxConnections: 5,
  encoding: null,
  jQuery: false,
  callback: function (error, res, done) {
    if (error) {
      console.warn(error);
    } else {
      if (res.statusCode == 200) {
        let path = decodeURIComponent(res.request.uri.href);
        path = path.replace(REGEX_HTTP_ORIGIN, DIR + IMAGE_FOLDER_NAME);
        let dir = path.match(/\S+\//)[0];
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(path, res.body, 'binary');
      } else {
        console.warn(`${res.statusCode} : ${res.request.uri.href}`);
      }
    }
    done();
  }
});
