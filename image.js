const fs = require('fs');
const Crawler = require("crawler");

/**
 * 圖片儲存路徑
 */
const IMAGE_SAVE_DIR="./viewer/img"
/**
 * 去除圖片網址前綴的正規表達式
 */
const REGEX_REMOVE_SCHEME_AND_DOMAIN=/^http(s){0,1}\S\/\/\S+?\//;

module.exports ={
  download:(imgUrl)=>{
    imageDownloader.queue(imgUrl);
  },
  getLocalUrl:(imgUrl)=>{
    return "img/"+imgUrl.replace(REGEX_REMOVE_SCHEME_AND_DOMAIN,'');
  }
}

let imageDownloader=new Crawler({
  maxConnections:20,
  encoding:null,
  jQuery:false,
  callback:function(error,res,done){
    if(error){
      console.log(error);
    }else{
      let urlWithoutDomain=res.request.uri.href.replace(REGEX_REMOVE_SCHEME_AND_DOMAIN,'');
      let splitArray=urlWithoutDomain.split("/");

      let d=IMAGE_SAVE_DIR;
      for(i=0;i<splitArray.length;i++){
        if (!fs.existsSync(d)) {
          fs.mkdirSync(d);
        }
        d+="/"+splitArray[i];
        // d+="-"+splitArray[i];
      }
      console.log(d);
      let writeStream = fs.createWriteStream(d);
      writeStream.write(res.body);
      writeStream.end();
    }
    done();
  }
});

//資料夾不存在的話就開一個
if (!fs.existsSync(IMAGE_SAVE_DIR)) {
  fs.mkdirSync(IMAGE_SAVE_DIR);
}
