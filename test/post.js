var http = require('http'),querystring = require('querystring');
var web = http.createServer(function(request,response){
	var post_data = '';
	request.setEncoding('utf8'); //设置接收数据方式是UTF8
	response.writeHead(200, {"Content-Type": "application/json; charset=utf-8",});
	request.on('data',function(buffer){
		post_data += buffer;
		console.log('[Received]' + buffer.length);
	});
	request.on('end',function(){
		request.post = querystring.parse(post_data);
		response.end(JSON.stringify(request.post));
	})//接收完毕
	
});
web.listen(9999);