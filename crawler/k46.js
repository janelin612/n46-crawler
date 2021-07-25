const crawler = require('./src/k46-crawler');
//自command line帶入參數
var argv = require('minimist')(process.argv.slice(2));

if (argv.a) {
  crawler.download(argv.a);
} else {
  crawler.listMember();
}
