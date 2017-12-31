const fs = require('fs');
const Crawler = require("crawler");

var member={};

module.exports ={
  downloadImage:false,
  crawler:new Crawler({
    maxConnections : 1,
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var URL=res.request.uri.href;
            var $ = res.$;
  
            var memberImage=$("#profile img").first().attr("src");
  
            if(this.downloadImage){
              Image.downloader.queue(memberImage);
              memberImage="img/"+memberImage.replace(/^http\S\/\/\S+?\//,'');
            }
  
            var memberName_hiragana=$("#profile div.txt h2 span").text();
            $("#profile div.txt h2 span").remove();
            var memberName=$("#profile div.txt h2").text();
  
            //table
            var introList=[];
            $("#profile div.txt dl dt").each(function(index,view){
              var key=$(view).text().replace("：","");
              var value=$(view).nextAll("dd").first().text();
              introList.push({
                key:key,value:value
              });
            });
  
            //tag
            var tagList=[];
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
  
            var fileName='./viewer/member.json'
            fs.writeFile(fileName, JSON.stringify(member), 'utf8');
        }
        done();
    }
  })
}
