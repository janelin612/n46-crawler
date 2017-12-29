n46-crawler
===========

將官方部落格的所有文章網址整理成`json`格式的檔案  
目前暫無將所有內文全部爬下來的打算

# Get started #
## 1.install dependencies ##

[node-crawler](https://github.com/bda-research/node-crawler "https://github.com/bda-research/node-crawler")

	$ npm install crawler

[minimist](https://www.npmjs.com/package/minimist)

	$ npm install minimist

## 2.usage ##

	$ node blog.js
it will download all blog url into `./viewer/result.json`  (**Will take long time!!**)

# Argument #

1. `-a MEMBER_NAME` : For example,if you only want to download all of Asuka's blog

	> http://blog.nogizaka46.com/asuka.saito/

	you can use this:

		$ node blog.js -a 'asuka.saito'

2. `--list` : list all member name like below

		秋元 真夏       manatsu.akimoto
		生田 絵梨花     erika.ikuta
		生駒 里奈       rina.ikoma
		伊藤 かりん     karin.itou
		伊藤 純奈       junna.itou
		伊藤 万理華     marika.ito
		...etc

3. `--no_image` : Get blog without image resource，all image will keep their original address.   
(If the blog is closed,you would lose all image )
		

# Sample Result #
The Json File will look like this:

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
