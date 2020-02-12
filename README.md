n46-crawler
===========

將乃木坂46[官方部落格](https://blog.nogizaka46.com/)的文章整理成`json`格式的檔案，同時下載所有圖片檔，供備份即將畢業的成員部落格使用。  
本專案包含:

1. 爬蟲程式碼
2. 一個簡單的Html檢視器，用來閱讀爬好的json檔 

## [Site-乃木坂46卒業メンバーのブログ](https://janelin612.github.io/n46-crawler/)
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
+ [斉藤優里](https://janelin612.github.io/n46-crawler/yuuri.saito) - archived on 2019-07-01
+ [桜井玲香](https://janelin612.github.io/n46-crawler/reika.sakurai) - archived on 2019-09-04
+ [井上小百合](https://janelin612.github.io/n46-crawler/sayuri.inoue) - archived on 2020-01-21

# Get started #

## 1. Clone project
Because the whole demo site is hosting on github pages,you will take long time to clone project.  
If you only need the source code,you can just clone the master branch.

	$ git clone https://github.com/janelin612/n46-crawler.git --single-branch

## 2. Install dependencies

	$ npm install -–production 

## 3. Usage

### (1) Show members list

```
$ node n46
```

It will print members list on console like below

```
秋元 真夏       manatsu.akimoto
生田 絵梨花     erika.ikuta
伊藤 純奈       junna.itou
伊藤 理々杏     riria.itou
井上 小百合     sayuri.inoue
岩本 蓮加       renka.iwamoto
```

### (2) Download blog content

Use argument `-a` to choose the member you want to download.  
For example,if you only want to download all of Asuka's blog

> https://blog.nogizaka46.com/asuka.saito/

You can use this:

```
$ node n46 -a "asuka.saito"
```

It will download all blog into `./viewer/result.json`  
And all images will be storaged into `./viewer/img/` as below:

```html
<!-- original  -->
<img src="http://img.nogizaka46.com/blog/2019/XXXXX.jpeg">

<!-- new -->
<img src="img/blog/2019/XXXXX.jpeg">
```

# Sample Result #
Crawler will generate two json file，and storage them at `./viewer/`

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

2. `member.json` : member's introduction

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
    "1期生", "選抜メンバー", "十一福神"
  ]
}
```

# Keyakizaka46
Crawler now support Keyakizaka46(欅坂46) 🎉

Simply change `n46.js` to `k46.js` : 

```cmd
$ node k46.js 			//list all member
$ node k46.js -a 22		//長濱 ねる
```
> argument `-a` accept a number called "ct". It's different from nogizaka because they using another CMS website.

# Viewer
於子資料夾`./viewer`內有簡易的閱讀器，可以用來顯示下載好的json檔案。

## Usage 
目前主流瀏覽器預設是禁止在html內讀取本地端檔案 (file-access-from-files)，也就是說直接打開 `./viewer/index.html` 是看不到東西的，因此你需要架一個簡單的http server，這裡推薦使用[npm http-server](https://www.npmjs.com/package/http-server)，當然你可以用你自己熟悉的伺服器。 

```shell
$ npm install http-server -g
$ http-server ./viewer
```
沒意外的話你可以在 `http://127.0.0.1:8080/index.html` 看到畫面