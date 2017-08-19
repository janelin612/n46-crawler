n46-crawler 
===========

將官方部落格的所有文章網址整理成`json`格式的檔案  
目前暫無將所有內文全部爬下來的打算

# Get started #
## 1.install dependencies ##

[https://github.com/bda-research/node-crawler](https://github.com/bda-research/node-crawler "https://github.com/bda-research/node-crawler")

	$ npm install crawler

## 2.usage ##

	$ node main.js
it will download all blog url into `result.json` (**it will take long time**)

# Argument #

1. `MEMBER_NAME` : For example,if you only want to download all of Asuka's blog

		http://blog.nogizaka46.com/asuka.saito/
you should set `MEMBER_NAME=asuka.saito'`


# Sample Result #
The Json File will look like this:
	
	[{
		"datetime": "2017/08/19 20:42",
		"author": "３期生",
		"title": "何が好きかな〜。大園桃子",
		"url": "http://blog.nogizaka46.com/third/2017/08/040351.php"
	},
	{
		"datetime": "2017/08/19 17:06",
		"author": "佐々木琴子",
		"title": "ツ",
		"url": "http://blog.nogizaka46.com/kotoko.sasaki/2017/08/040349.php"
	},
	{
		"datetime": "2017/08/19 16:00",
		"author": "伊藤かりん",
		"title": "第277話 ご飯会の報告。大阪編",
		"url": "http://blog.nogizaka46.com/karin.itou/2017/08/040348.php"
	}]