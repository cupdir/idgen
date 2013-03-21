var http = require('http'),
	url = require('url'),
	querystring = require('querystring');
var user = {
	'zhangsan':{'age':20,'sex':'男'},
	'lisi':{'age':21,'sex':'女'},
	'nvnv':{'age':18,'sex':'renyao'}
}
var web = http.createServer(function(request,response){
	//得到浏览器访问地址串/后部分 http://127.0.0.1:9999/user
	response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8",});
	request.get = url.parse(request.url, true).query;
	if(request.method == 'GET' && request.get.name){
		response.end(JSON.stringify(user[request.get.name]));
	}else{
		response.end(JSON.stringify({}));
	}
});

web.listen(9999);