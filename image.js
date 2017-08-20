const fs = require('fs');
const Crawler = require("crawler");

/**
 * 照片主機網址
 */
const IMAGE_HOST='http://img.nogizaka46.com/blog/';
/**
 * 圖片儲存路徑
 */
var IMAGE_SAVE_DIR="./img"

module.exports ={
  downloader:new Crawler({
    maxConnections:10,
    encoding:null,
    jQuery:false,
    callback:function(error,res,done){
      if(error){
        console.log(error);
      }else{
        var filename=IMAGE_SAVE_DIR+"/"+res.request.uri.href.replace(IMAGE_HOST,'').replace(/\//g,'_');
        fs.createWriteStream(filename).write(res.body);
        console.log(filename);
      }
      done();
    }
  })
}

//資料夾不存在的話就開一個
if (!fs.existsSync(IMAGE_SAVE_DIR)) {
  fs.mkdirSync(IMAGE_SAVE_DIR);
}
