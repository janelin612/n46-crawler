const Fs = require('fs');
const Crawler = require("crawler");

/**
 * 圖片儲存路徑
 */
const IMAGE_SAVE_DIR = "./viewer/img"
/**
 * 去除圖片網址前綴的正規表達式
 */
const REGEX_REMOVE_SCHEME_AND_DOMAIN = /^http(s){0,1}\S\/\/\S+?\//;

module.exports = {
  download: (imgUrl) => {
    downloader.queue(imgUrl);
  },
  getLocalUrl: (imgUrl) => {
    return "img/" + imgUrl.replace(REGEX_REMOVE_SCHEME_AND_DOMAIN, '');
  }
}

let downloader = new Crawler({
  maxConnections: 20,
  encoding: null,
  jQuery: false,
  callback: function (error, res, done) {
    if (error) {
      console.warn(error);
    } else {
      let urlWithoutDomain = res.request.uri.href.replace(REGEX_REMOVE_SCHEME_AND_DOMAIN, '');
      let splitArray = urlWithoutDomain.split("/");

      let dir = IMAGE_SAVE_DIR;
      for (i = 0; i < splitArray.length; i++) {
        if (!Fs.existsSync(dir)) {
          Fs.mkdirSync(dir);
        }
        dir += "/" + splitArray[i];
      }

      Fs.writeFileSync(dir,res.body,'binary');
    }
    done();
  }
});