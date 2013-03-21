var util 	= 	require('./util').util,	//工具包
	events	=	require('events'),//让本类继承event
	http 	=	require('http'),
	url 	= require('url'),
	querystring = require('querystring'), //解析POST数据
	counter 	= []; //全局计数器
	client 	= 	require('./mysql'); //计数器 mysql连接定制类
function _id(options){
	var self = this;
	//版本号
	this.version = '0.0.1';
	//配置选项
	this.options = options;
	//分布式ID
	this.host_id =  options.host_id;
	//当mysql连接成功后才能提供服务
	this.store= client.createConnedestroyction(options.store);
	this.store.init(function(rows){
		console.log('(4)服务启动成功');
		self.start(rows);
	});
	events.EventEmitter.call(this);
};
util.inherit(_id, events.EventEmitter); //继承EventEmitter
//对外提供一个ID获取的HTTP服务接口
_id.prototype.http = function(){//高效率的穿透给使用者 TCP? HTTP?
	var self  = this ,tmp_object = {};
	var proxy = http.createServer(function (req, res){
		var post='';
		req.setEncoding('utf8');
		req.addListener('data',function(data){
			post += data; //解析post数据
			console.log('[Received]' + data.length);
			//console.log(counter)
			//post
		});
		req.addListener('end',function(){
			//output
			//检查当前位数是否够用
			req.post = querystring.parse(post);
			
			if( req.method.toLowerCase() == 'post' ){
				var pathname = url.parse(req.url).pathname.match(/^\/([a-z]+)\.([json|xml]+)$/g);
				if( pathname == null){
					res.writeHead(403, {'Content-Type': 'text/plain'});
					res.end();	
				}else{
					var request = pathname[0].split('.');
					request['token'] = request[0].substr(1).toLowerCase();
					request['output'] = request[1].toLowerCase();
					request.shift();
					request.shift();	
					var counter_object = counter.getToken(request['token']); //高效的ID生成器	
					if(typeof counter_object == 'undefined'){
						res.writeHead(404, {'Content-Type': 'text/plain'});
						res.end();	
					}else{
						//res  200
						tmp_object.id = self.idgen(request['token']); //根据请求者的位数生成不重复ID
						self.output(tmp_object,res,request['output'],counter_object);	
					}			
				}
			}else{
				//405 Method Not Allowed
				res.writeHead(405, {'Content-Type': 'text/plain'});
				res.end();				
			}
		});
		req.addListener('close',function(){});

	});
	proxy.on('error',function(err){
		console.log('(6)端口'+self.options.http_port+'开启失败');
		process.exit(1);

	})
	proxy.listen(this.options.http_port,function(){
		console.log('(6)端口'+self.options.http_port+'开启成功.'); 
	});
};

//按位生成ID
_id.prototype.idgen = function(token){
	var counter_object = counter.getToken(token);
	var number = this.getHostId()+this.createLife(counter_object)+this.createAutoIncrement(counter_object);
	return this.check(number,counter_object);
};
//http 输出方式
_id.prototype.output = function(obj,res,output,counter_object){
	//text/xml
	var output = (typeof output != null)?output:'json';
	switch(output){
		case 'json':
			res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
			res.end(JSON.stringify(obj));
		break;
		case 'xml':
			var xml = '<?xml version="1.0" encoding="ISO-8859-1"?><root><id>'+obj.id+'</id></root>';
			res.writeHead(200, {'Content-Type': 'text/xml; charset=ISO-8859-1'});
			res.end(xml);
		break;
		default:
		res.writeHead(404,{'Content-Type': 'text/plain'});
		res.end();

	}
};
//递增位补零
_id.prototype.createAutoIncrement = function(counter_object){
	return util.zero(counter_object.count++,counter_object.bit-5);
};
//分布式ID
_id.prototype.getHostId = function(){
	return this.host_id;
};
//游标补零
_id.prototype.createLife = function(counter_object){
	return util.zero(counter_object.life,4);
};
//String 扩展方法，近位检查。
_id.prototype.check = function(number,counter_object){
	//TODO
	var check =0,counter_length = 5, bit = counter_object.bit,self = this;//保留位数
	var counter = function(day){//重置当前记录器
		if(counter_object.life >= self.options.store.max_life ){
				console.log('[error] 计数器名称'+counter_object.token+'最大化');
				destroy(); //删除这个计数器
		}
		counter_object.life = counter_object.life+1;
		counter_object.count = 0;
	}
	var reset = function(){//这个标记一下 ,等想通了再处理
		self.store.reset(counter_object.token,function(result){});
	}
	//销毁计数器
	var destroy  = function(){
		counter_object.remove();//如果计数器超过9999 删除当前计数器
	}

	for(var i = counter_length; i < number.length;i++){
			if(number[i] == 9){
				check ++;//检测最低位是否最大
			}
	}
	if(check == (bit - counter_length)){
		reset();
		counter();
		

	}
	return number;
}
/*
* 数组扩展方法，查找计数器
*/
Array.prototype.getToken = function(token){
	for(key in this){
		if(this[key]['token'] == token){
			return this[key];
		}
	}
}
//开启服务，对外提供一个HTTP接口
_id.prototype.start = function(rows){
	console.log('(5)正常提供服务');
	counter = rows;
	this.http();//创建交互请求
};
/**
从一个列表里删除一个对象
扩展方法::移除计数器对象

**/
Object.prototype.remove = function(){
	for(key in counter){
		if(counter[key]['token'] == this.token){
			counter.splice(key);
		}
	}
}
//namespace id
exports.idgen  =  function(options) {
  return new _id(options);
};