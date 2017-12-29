const fs = require('fs');
const Crawler = require("crawler");
const Image=require('./image')

/**
 * 主網站網址
 */
const BLOG_URL='http://blog.nogizaka46.com/';
/**
 * 成員名稱
 * 留白的話表示抓全部人的
 */
var MEMBER_NAME='';

/**
 * 爬蟲的最高連線數
 * >1的話，結果會無法照時間排序，但會加快執行速度
 */
var connCount=1;

/**
 * 圖片下載模式
 * 若此變數改為true
 * 則爬蟲會改為下載所有部落格照片
 * 而非原始的json設計
 */
var imageMode=false;

//自command line帶入參數
var argv = require('minimist')(process.argv.slice(2));
if(argv.a){
  MEMBER_NAME=argv.a;
}
if(argv.speed){
  connCount=10;
}
imageMode=(argv.image!=null);

/**
 * 取回成員列表
 */
var authorCrawler=new Crawler({
  maxConnections:1,
  callback:function(error,res,done){
    if(error){
      console.log(error);
    }else{
      var $=res.$;
      $("#sidemember a").each(function(index,value){
          var path=$(value).attr("href").replace("./",'');
          var name='';
          if($(value).find("img").length>0){
            name=$(value).find(".kanji").text();
          }else {
            name=$(value).text();
          }
          console.log(name+'\t'+path);
      });
    }
    done();
  }
});


/**
 * 從畫面右側的下拉選單抽取全部的年月列表
 */
var archieveCrawler=new Crawler({
    maxConnections : 1,
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            var archieveList=[];
            $('#sidearchives select option').each(function(index,value){
                if($(value).attr("value").length>1){
                  archieveList.push($(value).attr("value"));
                }
              }
            );
            pageCountCrawler.queue(archieveList);
        }
        done();
    }
});

/**
 * 處理依年月封存時的分頁狀況
 * 若存在分頁則拼湊出每個分頁的url
 * 反之表示只有一頁，直接開始爬取
 */
var pageCountCrawler = new Crawler({
    maxConnections : connCount,
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var URL=res.request.uri.href;
            var $ = res.$;
            //若有分頁則整理出分頁list 沒有就直接開始爬
            if($("#sheet .paginate").length>0){
              var pageInArchieveList=[];
              var size=$("#sheet .paginate").first().children("a").length;
              for(var i=1;i<=size;i++){
                pageInArchieveList.push(URL+"&p="+i);
              }
              blogCrawler.queue(pageInArchieveList)
            }else{
              blogCrawler.queue(URL)
            }
        }
        done();
    }
});

/**
 * 儲存最後結果
 */
var result=[];
/**
 * 取回每一個畫面上的blog標題、時間、網址...etc
 * 並將結果輸出至json
 */
var blogCrawler= new Crawler({
    maxConnections : connCount,
    jQuery:{name: 'cheerio',options:{decodeEntities: false}},
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;

            if(imageMode){
              $("#sheet .entrybody img").each(function(index,value){
                Image.downloader.queue($(value).attr("src"));
              });
            }else{
              $("#sheet h1.clearfix").each(function(index,value){
                $(value).nextAll('div.entrybody').first().find("img").each(function(index,value){
                  var src="img/"+$(value).attr("src").replace(/^http\S\/\/\S+?\//,'');
                  $(value).attr("src",src);
                });

                var item={
                  datetime:$(value).nextAll('div.entrybottom').first().text().split('｜')[0].trim(),
                  author:$(value).find('.heading .author').text(),
                  // author_path:$(value).find('.heading a').attr('href').replace(BLOG_URL,'').split('/')[0].trim(),
                  title:$(value).find('.heading a').text(),
                  url:$(value).find('.heading a').attr('href'),
                  content:$(value).nextAll('div.entrybody').first().html()
                };
                result.push(item);
              });
              console.log(result.length+' results');

              var fileName='./viewer/result.json'
              fs.writeFile(fileName, JSON.stringify(result), 'utf8');
            }
        }
        done();
    }
});

//執行!
if(argv.list){
  authorCrawler.queue(BLOG_URL);
}else{
  archieveCrawler.queue(BLOG_URL+MEMBER_NAME);
}
