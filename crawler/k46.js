const k46 = require('./src/k46-crawler')
//自command line帶入參數
var argv = require('minimist')(process.argv.slice(2));

if (argv.a) {
  k46.downloadMemberBlog(argv.a);
} else {
  k46.printMemberList();
}