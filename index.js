const express = require('express')
const app = express()
const port = 8080
const hostname = 'localhost'

app.use(express.static('../read-book/dist'))

// 设置跨域
app.all('*', function (req, res, next) {
	res.header('Access-Control-Allow-Origin', req.headers.origin)
	res.header('Access-Control-Allow-Credentials', true)
	res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild')
	res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
	// if (req.method == 'OPTIONS') {
	// 	res.send(200) // 让options请求快速返回
	// } else {
	// 	next()
	// }
	next()
})

var request = require('request');
var cheerio = require('cheerio');
var questions = [];
var option = {
		url: 'http://www.imooc.com/learn/857',
		proxy: 'http://10.9.26.13:8080',
		// headers: {
		// 		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		// 		'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.6',
		// 		'Host': 'www.dianping.com',
		// 		'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Mobile Safari/537.36',
		// 		'Cache-Control': 'max-age=0',
		// 		'Connection': 'keep-alive'
		// }
};
// var mysql      = require('mysql');
// var connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'me',
//   password : 'secret',
//   database : 'my_db'
// });

// connection.connect();

// connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//   if (error) throw error;
//   console.log('The solution is: ', results[0].solution);
// });

// connection.end();

// var mysql = require('mysql');

// // 创建数据库连接池
// var pool  = mysql.createPool({
//   host:           'localhost', // 数据库地址
//   user:           'root',      // 数据库用户
//   password:        '',         // 对应的密码
//   database:        'example',  // 数据库名称
//   connectionLimit: 10          // 最大连接数，默认为10
// });

// // 在使用 SQL 查询前，需要调用 pool.getConnection() 来取得一个连接
// pool.getConnection(function(err, connection) {
//   if (err) throw err;
//   // connection 即为当前一个可用的数据库连接
// });


function videocrawler(opt, callback) {
	//获取页面
	request(opt, function (err, res) {
		if (err) {
			callback(err);
		}
		var $ = cheerio.load(res.body.toString()); //利用cheerio对页面进行解析
		var videoList = [];
		$('.video li a').each(function () {
			var $title = $(this).parent().parent().parent().text().trim();
			var title = $title.split('\n');
			var text = $(this).text().trim();
			text = text.split('\n');
			//console.log(text);
			var time = text[1].match(/\((\d+\:\d+)\)/);
			var item = {
				title: title[0],
				url: 'http://www.imooc.com' + $(this).attr('href'),
				name: text[0],
				duration: time[1]
			};
			var s = item.url.match(/video\/(\d+)/);
			//console.log(s);
			if (Array.isArray(s)) {
				item.id = s[1];
				videoList.push(item);
			}
		});
		// req.end();
		callback(null, videoList);
	});
}

videocrawler(option, function (err, videoList) {
	if (err) {
		return console.log(err);
	}
	questions = videoList;
});
app.get('/getMsg', function (req, res) {
	res.status(200);
	res.json(questions)
});
app.listen(port, hostname, err => {
	if (!err) {
		console.log(`------ http://${hostname}:${port} ------`)
	}
})