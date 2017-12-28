const fs = require('fs');
const Crawler = require("crawler");

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
        var urlWithoutDomain=res.request.uri.href.replace(/^http\S\/\/\S+?\//,'');
        var splitArray=urlWithoutDomain.split("/");

        var d=IMAGE_SAVE_DIR;
        for(i=0;i<splitArray.length;i++){
          if (!fs.existsSync(d)) {
            fs.mkdirSync(d);
          }
          d+="/"+splitArray[i];
          // d+="-"+splitArray[i];
        }
        console.log(d);
        fs.createWriteStream(d).write(res.body);
        
      }
      done();
    }
  })
}

//資料夾不存在的話就開一個
if (!fs.existsSync(IMAGE_SAVE_DIR)) {
  fs.mkdirSync(IMAGE_SAVE_DIR);
}
