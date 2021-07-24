/**
 *  Convert archived blog in ./viewer into epub
 *  For downloading image,you should run a static server at 127.0.0.1:8080 before run this code.
 */
const Epub = require('epub-gen');
const Fs = require('fs');
const Crypto = require('crypto');

let member = JSON.parse(Fs.readFileSync('./viewer/member.json'));
let content = JSON.parse(Fs.readFileSync('./viewer/result.json'));

const option = {
  title: member.name,
  author: member.name,
  tocTitle: '目次',
  content: content.map((value) => {
    return {
      title: value.title,
      author: value.author,
      data: value.content.replace(/\"img\//g, '"http://127.0.0.1:8080/img/'),
      filename: Crypto.createHash('md5').update(value.url).digest('hex')
    };
  })
};

new Epub(option, './viewer/blog.epub');
