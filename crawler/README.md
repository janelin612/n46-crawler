# crawler

# Get started

## 1. Install dependencies

```
$ npm install --production
```

## 2. Usage

### (1) Show members list

```
$ node n46
```

It will print members list on console like below

```
7639    秋元 真夏
36749   伊藤 理々杏
36750   岩本 蓮加
36751   梅澤 美波
16454   北野 日奈子
36753   久保 史緒里
264     齋藤 飛鳥
```

### (2) Download blog content

Use argument `-a` to choose the member you want to download.  
For example,if you only want to download all of Asuka's blog

> https://www.nogizaka46.com/s/n46/diary/MEMBER/list?ct=264

You can use this:

```
$ node n46 -a 264
```

It will download all blog into `./viewer/result.json`  
And all images will be storaged into `./viewer/img/` as below:

```html
<!-- original  -->
<img src="http://img.nogizaka46.com/blog/2019/XXXXX.jpeg" />

<!-- new -->
<img src="img/blog/2019/XXXXX.jpeg" />
```

# Sample Result

Crawler will generate two json file，and storage them at `./viewer/`

1. `result.json` : main file

```json
[
  {
    "datetime": "2017/08/19 20:42",
    "title": "何が好きかな〜。大園桃子",
    "url": "http://blog.nogizaka46.com/third/2017/08/040351.php",
    "content": "<div>...........</div>"
  },
  {
    "datetime": "2017/08/19 17:06",
    "title": "ツ",
    "url": "http://blog.nogizaka46.com/kotoko.sasaki/2017/08/040349.php",
    "content": "<div>...........</div>"
  }
]
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
  "tag": ["1期生", "選抜メンバー", "十一福神"]
}
```

# Sakamichi Series

Crawler now also support Keyakizaka46(欅坂 46) & Sakurazaka46(櫻坂 46) 🎉

## 1. Keyakizaka46

Simply change `n46.js` to `k46.js` :

```
$ node k46 		//list all member
$ node k46 -a 22	//長濱 ねる
```

## 2. Sakurazaka46

Same as Keyakizaka, change to `s46.js` :

```
$ node s46 		//list all member
$ node s46 -a 14	//土生 瑞穂
```

### Sakurazaka only

By default, when you select a member in Sakurazaka46, the crawler will automatically download this member's all blogs from both Sakurazaka and Keyakizaka.  
If you only need the part of Sakurazaka , you can use `--only` .

```
$ node s46 -a 14 --only
```

# Viewer

於子資料夾`./viewer`內有簡易的閱讀器，可以用來顯示下載好的 json 檔案。

## Usage

目前主流瀏覽器預設是禁止在 html 內讀取本地端檔案 (file-access-from-files)，也就是說直接打開 `./viewer/index.html` 是看不到東西的，因此你需要架一個簡單的 http server，這裡推薦使用[npm http-server](https://www.npmjs.com/package/http-server)，當然你可以用你自己熟悉的伺服器。

```shell
$ npm install http-server -g
$ http-server ./viewer
```

沒意外的話你可以在 `http://127.0.0.1:8080/index.html` 看到畫面
