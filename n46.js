const N46Crawler = require('./src/n46-crawler');

/**
 * 成員名稱
 * 留白的話表示抓全部人的
 */
var MEMBER_NAME = '';

//自command line帶入參數
var argv = require('minimist')(process.argv.slice(2));
if (argv.a) {
    MEMBER_NAME = argv.a;
}

//執行!
if (argv.list) {
    N46Crawler.printMemberList();
} else {
    N46Crawler.downloadMemberBlog(MEMBER_NAME);
}