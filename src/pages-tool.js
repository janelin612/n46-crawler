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
const BASE_URL = "https://janelin612.github.io/n46-crawler"

var cvt = require('xml-js');
var fs = require("fs");
buildSitemap();

/**
 * 手動gen出sitemap
 */
function buildSitemap() {
    let urlList = [{
        loc: `${BASE_URL}`
    }];

    let memberList = JSON.parse(fs.readFileSync(`${SITE_FOLDER}/memberlist.json`));
    memberList.forEach((year) => {
        year.member.forEach((memb) => {
            urlList.push({
                loc: `${BASE_URL}/${memb.link}`
            });
        })
    })

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