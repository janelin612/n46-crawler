const Fs = require("fs");
const Crawler = require("crawler");
const Image = require("./image")

const BLOG_URL = "http://blog.nogizaka46.com/";
const RESULT_JSON_FILE = "./viewer/result.json";
const MEMBER_INFO_FILE = "./viewer/member.json";

module.exports = {
    printMemberList: () => {
        memberListCrawler.queue(BLOG_URL);
    },
    downloadMemberBlog: (memberPath) => {
        archiveListCrawler.queue(BLOG_URL + memberPath)
    }
}

/**
 * 取得成員列表並輸出在終端機上
 */
let memberListCrawler = new Crawler({
    maxConnections: 1,
    callback: (error, res, done) => {
        if (error) {
            console.warn(error);
        } else {
            let $ = res.$;
            $("#sidemember a").each((index, value) => {
                let path = $(value).attr("href").replace("./", '');
                let name = '';
                if ($(value).find("img").length > 0) {
                    name = $(value).find(".kanji").text();
                } else {
                    name = $(value).text();
                }
                console.log(name + ' \t' + path);
            })
        }
        done();
    }
});

/**
 * 自畫面右側取得年月清單
 */
let archiveListCrawler = new Crawler({
    maxConnections: 1,
    callback: (error, res, done) => {
        if (error) {
            console.warn(error);
        } else {
            let $ = res.$;
            let list = [];
            $("#sidearchives select option").each((index, value) => {
                let url = $(value).attr("value");
                if (url) { list.push(url) }
            });
            paginateListCrawler.queue(list);

            let memberUrl = $("#sideprofile .txt p a").attr("href");
            if (memberUrl != null && memberUrl.length > 0) {
                memberInfoCrawler.queue(memberUrl);
            }
        }
        done();
    }
});

/**
 * 取回單一年月的分頁清單
 */
let paginateListCrawler = new Crawler({
    maxConnections: 1,
    callback: (error, res, done) => {
        if (error) {
            console.warn(error);
        } else {
            let $ = res.$;
            let URL = res.request.uri.href;

            let list = [];
            if ($("#sheet .paginate").length > 0) {
                $("#sheet .paginate:first-child a").each((index, value) => {
                    list.push(URL + "&p=" + (index + 1));
                })
            } else {
                list.push(URL);
            }
            blogLinkListCrawler.queue(list);
        }
        done();
    }
})

/**
 * 取回每一個分頁的標題清單
 */
let blogLinkListCrawler = new Crawler({
    maxConnections: 1,
    jQuery: { name: 'cheerio', options: { decodeEntities: false } },
    callback: (error, res, done) => {
        if (error) {
            console.warn(error);
        } else {
            let $ = res.$;
            $("#sheet .entrytitle a").each((index, value) => {
                let link = $(value).attr("href");
                blogContentCrawler.queue(link);
            });
        }
        done();
    }
});


/**
 * 儲存最後結果
 */
var result = [];
/**
 * 下載內文資訊
 */
let blogContentCrawler = new Crawler({
    maxConnections: 1,
    jQuery: { name: 'cheerio', options: { decodeEntities: false } },
    callback: (error, res, done) => {
        if (error) {
            console.warn(error);
            done();
        } else {
            let $ = res.$;

            //將圖片網址改為本地端位置，並下載圖片
            $("#sheet div.entrybody").find("img").each(function (index, value) {
                let src = $(value).attr("src");
                if (src != null && src.length > 0) {
                    Image.download(src);

                    let localLocation = Image.getLocalUrl(src);
                    $(value).attr("src", localLocation);
                }
            });

            let item = {
                datetime: $("#sheet div.entrybottom").first().text().split('｜')[0].trim(),
                author: $("#sheet h1.clearfix .heading .author").text(),
                title: $("#sheet h1.clearfix .heading .entrytitle").html(),
                url: res.request.uri.href,
                content: $("#sheet div.entrybody").html()
            };
            result.push(item);
            console.log(item.datetime + " | " + item.title);

            Fs.writeFile(
                RESULT_JSON_FILE,
                JSON.stringify(result),
                'utf8',
                function () { done(); });
        }
    }
})

/**
 * 下載成員資訊
 */
let memberInfoCrawler = new Crawler({
    maxConnections: 1,
    callback: (error, res, done) => {
        if (error) {
            console.warn(error);
            done();
        } else {
            let $ = res.$;

            //處理成員頭像
            let memberImage = $("#profile img").first().attr("src");
            Image.download(memberImage);
            memberImage = Image.getLocalUrl(memberImage);

            //成員姓名
            let memberName_hiragana = $("#profile div.txt h2 span").text();
            $("#profile div.txt h2 span").remove();
            let memberName = $("#profile div.txt h2").text();

            //table
            let introList = [];
            $("#profile div.txt dl dt").each((index, item) => {
                let key = $(item).text().replace("：", "");
                let value = $(item).nextAll("dd").first().text();
                introList.push({
                    key: key, value: value
                });
            });

            //tag
            let tagList = [];
            $("#profile div.txt div.status div").each((index, item) => {
                tagList.push($(item).text());
            });

            //write all
            member = {
                name: memberName,
                name_hiragana: memberName_hiragana,
                image: memberImage,
                intro: introList,
                tag: tagList
            }
            Fs.writeFile(
                MEMBER_INFO_FILE,
                JSON.stringify(member),
                'utf8',
                function () { done(); });
        }
    }
})