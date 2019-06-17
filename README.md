n46-crawler
===========

將乃木坂46[官方部落格](https://blog.nogizaka46.com/)的文章整理成`json`格式的檔案，同時下載所有圖片檔，供備份即將畢業的成員部落格使用。  
本專案包含:

1. 爬蟲程式碼
2. 一個簡單的Html檢視器，用來閱讀爬好的json檔 

### [Demo Site-乃木坂46卒業メンバーのブログ](https://janelin612.github.io/n46-crawler/)
+ [橋本奈々未](https://janelin612.github.io/n46-crawler/nanami.hashimoto) - archived on 2017-12-31
+ [伊藤万理華](https://janelin612.github.io/n46-crawler/marika.ito) - archived on 2017-12-31
+ [中元日芽香](https://janelin612.github.io/n46-crawler/himeka.nakamoto) - archived on 2017-12-31
+ [川村真洋](https://janelin612.github.io/n46-crawler/mahiro.kawamura) - archived on 2018-04-27
+ [生駒里奈](https://janelin612.github.io/n46-crawler/rina.ikoma) - archived on 2018-05-12
+ 相樂伊織 - sorry I forgot to archive ... Orz
+ [斎藤ちはる](https://janelin612.github.io/n46-crawler/chiharu.saito/) - archived on 2018-07-17
+ [若月佑美](https://janelin612.github.io/n46-crawler/yumi.wakatsuki/) - archived on 2018-12-13
+ [川後陽菜](https://janelin612.github.io/n46-crawler/hina.kawago/) - archived on 2018-12-31
+ [能條愛未](https://janelin612.github.io/n46-crawler/ami.noujo/) - archived on 2018-12-25
+ [西野七瀬](https://janelin612.github.io/n46-crawler/nanase.nishino) - archived on 2018-12-30
+ [衛藤美彩](https://janelin612.github.io/n46-crawler/misa.eto) - archived on 2019-03-31
+ [伊藤かりん](https://janelin612.github.io/n46-crawler/karin.itou) - archived on 2019-06-10
+ [斉藤優里](https://janelin612.github.io/n46-crawler/yuuri.saito) - archived on 2019-05-25

# Get started #

## 1.clone project
Because the whole demo site is hosting on github pages,you will take long time to clone project.  
If you only need the source code,you can just clone the master branch.

	$ git clone https://github.com/janelin612/n46-crawler.git --single-branch

## 2.install dependencies

[node-crawler](https://github.com/bda-research/node-crawler)

	$ npm install crawler

[minimist](https://www.npmjs.com/package/minimist)

	$ npm install minimist

## 3.usage

	$ node n46.js

It will download all blog into `./viewer/result.json` **(Will take long time~)**  
And all images will be storaged into `./viewer/img/` as below:

```html
<!-- original  -->
<img src="http://img.nogizaka46.com/blog/XXXXX.jpeg">

<!-- new -->
<img src="img/blog/XXXXX.jpeg">
```

# Argument #

1. `-a "MEMBER_NAME"` : For example,if you only want to download all of Asuka's blog

	> http://blog.nogizaka46.com/asuka.saito/

	you can use this:

		$ node n46.js -a 'asuka.saito'

	+ **It is recommended to always using this argument to avoid downloading too much data.**
	+ you can get member's name by the next argument

2. `--list` : list all member's name like below

		秋元 真夏       manatsu.akimoto
		生田 絵梨花     erika.ikuta
		生駒 里奈       rina.ikoma
		伊藤 かりん     karin.itou
		伊藤 純奈       junna.itou
		伊藤 万理華     marika.ito
		...etc


# Sample Result #

Crawler will generate two json file

1. `result.json` : main file

```json
[{
	"datetime": "2017/08/19 20:42",
	"author": "３期生",
	"title": "何が好きかな〜。大園桃子",
	"url": "http://blog.nogizaka46.com/third/2017/08/040351.php",
	"content":"<div>...........</div>"
},
{
	"datetime": "2017/08/19 17:06",
	"author": "佐々木琴子",
	"title": "ツ",
	"url": "http://blog.nogizaka46.com/kotoko.sasaki/2017/08/040349.php",
	"content":"<div>...........</div>"
}]
```

2. `member.json` : member's introduction when you using `-a MEMBER_NAME` argument

```json
{
    "name": "伊藤 万理華",
    "name_hiragana": "いとう まりか ",
    "image": "img/www/member/img/itoumarika_prof.jpg",
    "intro": [
        {
            "key": "生年月日",
            "value": "1996年2月20日"
        },
        {
            "key": "血液型",
            "value": "O型"
        },
        {
            "key": "星座",
            "value": "うお座"
        },
        {
            "key": "身長",
            "value": "156cm"
        }
    ],
    "tag": [
        "1期生","選抜メンバー","十一福神"
    ]
}
```

# Viewer #
本來只想要有個簡單的畫面來讀JSON檔，結果越寫越複雜...

## Dependencies
只有要看的話不用裝東西，直接把`./viewer/index.html`打開就有了，但如果要自己改點東西的話....
+ Vue.js : 此部分直接把檔案放在`./viewer/script`底下了，並非透過npm安裝，想要擴充應該是有點難度，但原先就只是想做個小東西而已XD
+ Sass : 輸出已經包含.css檔，如果要自己改sass的話，該裝的編譯器還是要裝

		$ npm install -g node-sass less
	
	ps:沒有搭配gulp使用，要用的自己裝XD

## Known issues

+ Chrome : 載入的工作邏輯是對本地端的json檔打http get取得，結果這件事情被Chrome禁止(file-access-from-files)，所以目前本閱讀器不支援直接用Chrome開...
	 + 解法1 : 找個空間把整包掛上去
	 + 解法2 : 對Chrome下參數`--allow-file-access-from-files` 詳細說明:[連結](http://blog.twtnn.com/2015/03/ajaxcross-origin-requests-are-only.html)
	 + 解法3 : 改用Firefox吧