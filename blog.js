const fs = require('fs');
const Crawler = require("crawler");
const Image=require('./image')
const Member=require('./member')

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
 * 下載圖片
 * 若本功能啟用的話 會將部落格內的所有照片網址替換成本地端
 * 並把圖片下載至本地端
 */
var downloadImage=false;

/**
 * 嚴謹模式
 * 啟用後會整理出部落格的文章連結之後一篇一篇進去爬 理論上會慢五倍...
 * 但可以確保跑版不會搞掛爬蟲
 */
var strict=false;


//自command line帶入參數
var argv = require('minimist')(process.argv.slice(2));
if(argv.a){
  MEMBER_NAME=argv.a;
}
downloadImage=(argv.image!=null);
strict=(argv.strict!=null);

/**
 * 取回成員列表
 */
var authorCrawler=new Crawler({
  maxConnections:1,
  callback:function(error,res,done){
    if(error){
      console.log(error);
    }else{
      let $=res.$;
      $("#sidemember a").each(function(index,value){
          let path=$(value).attr("href").replace("./",'');
          let name='';
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
            let $ = res.$;
            let archieveList=[];
            $('#sidearchives select option').each(function(index,value){
                if($(value).attr("value").length>1){
                  archieveList.push($(value).attr("value"));
                }
              }
            );
            pageCountCrawler.queue(archieveList);

            let memberUrl=$("#sideprofile .txt p a").attr("href");
            if(memberUrl!=null && memberUrl.length>0){
              Member.downloadImage=downloadImage;
              Member.crawler.queue(memberUrl);
            }
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
    maxConnections : 1,
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            let URL=res.request.uri.href;
            let $ = res.$;

            let pageInArchieveList=[];
            //若有分頁則整理出分頁list 沒有就直接用網址本身
            if($("#sheet .paginate").length>0){
              let size=$("#sheet .paginate").first().children("a").length;
              for(let i=1;i<=size;i++){
                pageInArchieveList.push(URL+"&p="+i);
              }
            }else{
              pageInArchieveList.push(URL);
            }

            if(!strict){
              blogCrawler.queue(pageInArchieveList)
            }else{
              blogLinkListCrawler.queue(pageInArchieveList);
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
    maxConnections : 1,
    jQuery:{name: 'cheerio',options:{decodeEntities: false}},
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            let $ = res.$;

            $("#sheet h1.clearfix").each(function(index,value){
              //將圖片網址改為本地端位置，並下載圖片
              if(downloadImage){
                $(value).nextAll('div.entrybody').first().find("img").each(function(index,value){
                  let src=$(value).attr("src");
                  if(src!=null && src.length>0){
                    Image.downloader.queue(src);
                  
                    let localLocation="img/"+src.replace(/^http\S\/\/\S+?\//,'');
                    $(value).attr("src",localLocation);
                  }
                });
              }
              
              let item={
                datetime:$(value).nextAll('div.entrybottom').first().text().split('｜')[0].trim(),
                author:$(value).find('.heading .author').text(),
                title:$(value).find('.heading a').html(),
                url:$(value).find('.heading a').attr('href'),
                content:$(value).nextAll('div.entrybody').first().html()
              };
              result.push(item);
            });
            console.log(result.length+' results');

            let fileName='./viewer/result.json'
            fs.writeFile(fileName, JSON.stringify(result), 'utf8',function(){;});
        }
        done();
    }
});


/**
 * 取回畫面上的部落格連結
 * 並呼叫後續的爬蟲
 */
var blogLinkListCrawler=new Crawler({
  maxConnections : 1,
  jQuery:{name: 'cheerio',options:{decodeEntities: false}},
  callback : function (error, res, done) {
      if(error){
          console.log(error);
      }else{
          let $ = res.$;

          $("#sheet .entrytitle a").each(function(index,value){
            let link=$(value).attr("href");
            singleBlogCrawler.queue(link);
          });
          
      }
      done();
  }
});

var singleBlogCrawler = new Crawler({
  maxConnections: 1,
  jQuery: { name: 'cheerio', options: { decodeEntities: false } },
  callback: function (error, res, done) {
    if (error) {
      console.log(error);
    } else {
      let $ = res.$;

      //將圖片網址改為本地端位置，並下載圖片
      if (downloadImage) {
        $("#sheet div.entrybody").find("img").each(function (index, value) {
          let src = $(value).attr("src");
          if (src != null && src.length > 0) {
            Image.downloader.queue(src);

            let localLocation = "img/" + src.replace(/^http\S\/\/\S+?\//, '');
            $(value).attr("src", localLocation);
          }
        });
      }

      let item = {
        datetime: $("#sheet div.entrybottom").first().text().split('｜')[0].trim(),
        author: $("#sheet h1.clearfix .heading .author").text(),
        title: $("#sheet h1.clearfix .heading .entrytitle").html(),
        url: res.request.uri.href,
        content: $("#sheet div.entrybody").html()
      };
      result.push(item);
      console.log(item.url+" | "+item.title);

      let fileName = './viewer/result.json'
      fs.writeFile(fileName, JSON.stringify(result), 'utf8',function(){;});
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
