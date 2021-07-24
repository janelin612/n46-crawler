const n46 = require('./src/n46-crawler');
//自command line帶入參數
var argv = require('minimist')(process.argv.slice(2));

if (argv.a) {
  n46.downloadMemberBlog(argv.a, argv.save);
} else {
  n46.printMemberList();
}
