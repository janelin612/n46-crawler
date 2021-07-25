const crawler = require('./src/n46-crawler');
//自command line帶入參數
var argv = require('minimist')(process.argv.slice(2));

if (argv.a) {
  crawler.download(argv.a, argv.save);
} else {
  crawler.listMember();
}
