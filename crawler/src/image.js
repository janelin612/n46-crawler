const fs = require('fs');
const Crawler = require('crawler');

let directory = './viewer/';
const IMAGE_FOLDER_NAME = 'img/';

/**
 * 去除圖片網址前綴的正規表達式
 */
const REGEX_REMOVE_SCHEME_AND_DOMAIN = /^http(s){0,1}\S\/\/\S+?\//;

module.exports = {
  /** 下載圖片，並回傳檔案路徑 */
  download(imgUrl) {
    let localPath = getLocalUrl(imgUrl);
    if (!fs.existsSync(directory + localPath)) {
      downloader.queue(imgUrl);
    }
    return localPath;
  },
  setDirectory(dir) {
    directory = dir;
  }
};

function getLocalUrl(imgUrl) {
  return IMAGE_FOLDER_NAME + imgUrl.replace(REGEX_REMOVE_SCHEME_AND_DOMAIN, '');
}

let downloader = new Crawler({
  maxConnections: 20,
  encoding: null,
  jQuery: false,
  callback: function (error, res, done) {
    if (error) {
      console.warn(error);
    } else {
      let urlWithoutDomain = res.request.uri.href.replace(
        REGEX_REMOVE_SCHEME_AND_DOMAIN,
        ''
      );
      let splitArray = urlWithoutDomain.split('/');

      let dir = directory + IMAGE_FOLDER_NAME;
      for (i = 0; i < splitArray.length; i++) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        dir += '/' + splitArray[i];
      }

      fs.writeFileSync(dir, res.body, 'binary');
    }
    done();
  }
});
