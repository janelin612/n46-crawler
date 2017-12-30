/**
 * 為了爬網友備份的老橋部落格而特化出來的爬蟲
 */

const fs = require('fs');
const Crawler = require("crawler");
const Image=require('./image');

const FOLDER="./HashimotoNanami/";

/**
 * 儲存最後結果
 */
var result=[];
/**
 * 取回每一個畫面上的blog標題、時間、網址...etc
 * 並將結果輸出至json
 */
var blogCrawler= new Crawler({
    maxConnections : 1,
    jQuery:{name: 'cheerio',options:{decodeEntities: false}},
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;

            //將圖片網址改為本地端位置
            if(true){
                $("#sheet div.entrybody").find("img").each(function(index,value){
                  var src=$(value).attr("src");
                  
                  var localLocation="img/"+src.replace(/^http\S\/\/\S+?\//,'');
                  $(value).attr("src",localLocation);
                  fs.renameSync(FOLDER+src, "viewer/img/"+src); //圖片搬過去
                });
              }
            
            //處理href被多包一層的問題
            $("#sheet div.entrybody").find("a").each(function(index,value){
                var href=$(value).attr('href');
                if(href.startsWith("javascript")){
                    href=href.replace(/\n/g,'').replace(/javascript.+tion=/,'').replace(/'/g,"");
                    $(value).attr('href',href);
                }
            });
              
             var item={
               datetime:$("#sheet div.entrybottom").first().text().split('｜')[0].trim(),
               author:$("#sheet h1.clearfix .heading .author").text(),
               title:$("#sheet h1.clearfix .heading .entrytitle").html(),
               url:"",
               content:$("#sheet div.entrybody").html()
             };
            result.unshift(item);
            console.log(result.length+' results');
            

            var fileName='./viewer/result.json'
            fs.writeFile(fileName, JSON.stringify(result), 'utf8');
        }
        done();
    }
});

var i=0;
fs.readdir(FOLDER, (err, files) => {
    files.forEach(file => {
        //0開頭htm結尾，且跳過留言相關的畫面
        if(file.startsWith("0")&&file.endsWith("htm")&&file.indexOf("cp")==-1){
            fs.readFile(FOLDER+file,function(err,html){
                blogCrawler.queue({html:html})
            });
        }
    });
})