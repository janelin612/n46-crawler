const fs = require('fs');
const Crawler = require("crawler");
const Image=require('./image');

var member={};

module.exports ={
  downloadImage:'',
  crawler:new Crawler({
    maxConnections : 1,
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            let URL=res.request.uri.href;
            let $ = res.$;
  
            let memberImage=$("#profile img").first().attr("src");
  
            if(module.exports.downloadImage){
              Image.downloader.queue(memberImage);
              memberImage="img/"+memberImage.replace(/^http(s){0,1}\S\/\/\S+?\//,'');
            }
  
            let memberName_hiragana=$("#profile div.txt h2 span").text();
            $("#profile div.txt h2 span").remove();
            let memberName=$("#profile div.txt h2").text();
  
            //table
            let introList=[];
            $("#profile div.txt dl dt").each(function(index,view){
              let key=$(view).text().replace("：","");
              let value=$(view).nextAll("dd").first().text();
              introList.push({
                key:key,value:value
              });
            });
  
            //tag
            let tagList=[];
            $("#profile div.txt div.status div").each(function(index,view){
              tagList.push($(view).text());
            });
  
            //write all
            member={
              name:memberName,
              name_hiragana:memberName_hiragana,
              image:memberImage,
              intro:introList,
              tag:tagList
            }
  
            let fileName='./viewer/member.json'
            fs.writeFile(fileName, JSON.stringify(member), 'utf8',function(){;});
        }
        done();
    }
  })
}
