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
var url1 = "https://book.qidian.com/info/53269#Catalog";
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

function getLists(url) {
	return new Promise((resolve, reject) => {
		// var url = "https://book.qidian.com/info/53269#Catalog"
		var option = {
			url: url,
			proxy: 'http://10.9.26.13:8080',
			// method: "POST",
			// json: true,
			// headers: {
			// 	"content-type": "application/json",
			// },
			// body: requestData
		}
		request(option, function(err, res) {
			if (err) {
				reject(err)
			} else {
				var $ = cheerio.load(res.body.toString()); //利用cheerio对页面进行解析
				var bookList = [];
				var lists = $('.volume').eq(1).find('li')
				$(lists).each(function() {
					var item = {
						title: $(this).children().text().trim(),
						url: 'http:' + $(this).children().attr('href'),
						msg: $(this).children().attr('title'),
						id: $(this).attr('data-rid')
					};
					bookList.push(item);
				});
				resolve(bookList)
			}
		});
	});
};
function getContent(url) {
	return new Promise((resolve, reject) => {
		var option = {
			url: url,
			proxy: 'http://10.9.26.13:8080',
		}
		request(option, function(err, res) {
			if (err) {
				reject(err)
			} else {
				var $ = cheerio.load(res.body.toString()); //利用cheerio对页面进行解析
				var bookContent = { paraList:[] };
				var title = $('.main-text-wrap .text-head h3').text().trim();
				var preUrl = 'http:' + $('#j_chapterPrev').attr('href');
				var nextUrl = 'http:' + $('#j_chapterNext').attr('href');
				var content = $('.main-text-wrap .read-content p');
				$(content).each(function(index) {
					var p = $(this).text().trim();
					if (p) {
						var item = {
							paragraph: p,
							id: index
						};
						bookContent.paraList.push(item);
					}
				});
				bookContent.title = title;
				bookContent.preUrl = preUrl;
				bookContent.nextUrl = nextUrl;
				resolve(bookContent)
			}
		});
	});
}

getLists(url1).then(result => {
	questions = result;
}).catch( err => {
	questions = err;
})

app.get('/getLists', function (req, res) {
	res.status(200);
	res.json(questions);
});
app.get('/getContent', function (req, res) {
	questions.forEach( item => {
		if(req.query.id * 1 === item.id * 1){
			getContent(item.url).then(result => {
				res.status(200);
				res.json(result);
			})
			return false;
		}
	})
});
app.listen(port, hostname, err => {
	if (!err) {
		console.log(`------ http://${hostname}:${port} ------`)
	}
})