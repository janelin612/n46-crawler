const s46 = require('./src/s46-crawler');
//自command line帶入參數
var argv = require('minimist')(process.argv.slice(2));

if (argv.a) {
  s46.download(argv.a);
} else {
  s46.print();
}
