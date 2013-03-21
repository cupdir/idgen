var http = require('http'),
	url = require('url'),
	querystring = require('querystring');
//将所有的模块一次性加载到内存
var module  = {//存储命名结构

	index:{
		index:function(){
			return 'jalskdjlkajsd'; 
		}
	},
	user:{
		index:function(){
			return '用户模块index';
		}
	}
};

var route = function(){
	this.action = 'index';
	this.module = 'index';
} //定义路由分发
route.prototype.init = function(http_get_params,client,callback){
	if(typeof callback == 'function'){
		try{
			callback(module[this.module][this.action]()); //查找模块
		}catch(err){
			client.end(err.toString());//错误
		}			
	}
};
//http 服务端
var web = http.createServer(function(request,response){
	var url_path = url.parse(request.url, true).pathname;
	var _route   = new route();
	request.get = url.parse(request.url, true).query; //处理GET请求
	if(request.url.match(/^\/([a-z]+)\/([a-z?]+)/,url_path)){
		var queryexplode = url_path.substr(1).split('/');
		_route.action = queryexplode[1];
		_route.module = queryexplode[0];
	}
	if(typeof queryexplode == 'undefined'){
		response.writeHead(404, {"Content-Type": "text/plain; charset=utf-8",});
		response.end('error');
	}else{
		_route.init(request.get,response,function(data){
			response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8",});
			response.end(data);			
		});
	}
});
web.on('connection',function(client){});
web.listen(9999);