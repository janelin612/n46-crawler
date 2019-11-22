/*
 * 建置 github.io 環境用到的工具
 * 與爬蟲本身無關
 * 
 * 額外依賴：
 * npm i xml-js
 */

/** 網站在本地端的資料夾 */
const SITE_FOLDER = "../nogizaka46";
/** 網站在github io上的網址 */
const BASE_URL = "https://janelin612.github.io/n46-crawler";
/** 預載在html內的文章數量 */
const COUNT_OF_PRELOADING = 4;

const cvt = require("xml-js");
const fs = require("fs");
const cheerio = require("cheerio");
const babel = require("@babel/core");

injectPartialInfo();
buildSitemap();
transformJsFile();

/**
 * 遍歷所有存在JSON檔內的成員資訊
 */
function memberForEach(callback) {
  let memberList = JSON.parse(fs.readFileSync(`${SITE_FOLDER}/memberlist.json`));
  memberList.forEach((year) => {
    year.member.forEach((memb) => {
      callback(memb);
    });
  });
}

/**
 * 手動gen出sitemap
 */
function buildSitemap() {
  let urlList = [{
    loc: `${BASE_URL}`,
    lastmod: new Date().toISOString()
  }];

  memberForEach((memb) => {
    let modifiedTime =
      fs.statSync(`${SITE_FOLDER}/${memb.link.split("/")[0]}/result.json`)
        .mtime.toISOString();

    urlList.push({
      loc: `${BASE_URL}/${memb.link}`,
      lastmod: modifiedTime
    });
  });

  let result = {
    "_declaration": { "_attributes": { "version": "1.0", "encoding": "utf-8" } },
    urlset: {
      "_attributes": {
        "xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9"
      },
      url: urlList
    }
  };

  fs.writeFileSync(`${SITE_FOLDER}/sitemap.xml`, cvt.js2xml(result, { compact: true, spaces: "\t" }), 'utf-8');
};

/**
 * 將template html複製至各子資料夾內，並預載片段資訊
 */
function injectPartialInfo() {
  let html = fs.readFileSync(`${SITE_FOLDER}/template/index.html`, 'utf-8');

  memberForEach((memb) => {
    let $ = cheerio.load(html, { decodeEntities: false });
    let json = JSON.parse(fs.readFileSync(`${SITE_FOLDER}/${memb.link.replace("index.html", "result.json")}`));
    json = json.slice(0, COUNT_OF_PRELOADING);

    let text_script = `\n<script> const defaultList=${JSON.stringify(json)}; </script>`;
    $("title").text(`${memb.name} | 乃木坂46卒業メンバーのブログ`);
    $("body").after(text_script);
    fs.writeFileSync(`${SITE_FOLDER}/${memb.link}`, $.html(), "utf-8");
  });
}

/**
 * 使用babel轉譯js檔後移入正確的資料夾
 */
function transformJsFile() {
  let result = babel.transformFileSync("./viewer/script/main.js", {
    "presets": [
      [
        "@babel/preset-env", {
          "targets": {
            "chrome": "41", //Google Bot
          }
        }
      ]
    ]
  });
  fs.writeFileSync(`${SITE_FOLDER}/script/main.js`, result.code, "UTF-8");
}