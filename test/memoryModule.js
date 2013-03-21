var events = require('events'),
	util =  require('util'),
	io = require('socket.io').listen(8080),
	map = {};
//定义一个内存类
function memory(){
	this.http();
	this.counter = [];
	events.EventEmitter.call(this);//改变上下文指针
}
util.inherits(memory, events.EventEmitter); //继承EventEmitter
memory.prototype.http = function(){
	var self = this;
	io.sockets.on('connection', function (socket) {
		console.log('连接成功');
		socket.on('count',function(count){
			self.init(count,function(){
				setInterval(function(){
					self.set(count,socket);
				},150)
			});

		});
	});
};
memory.prototype.init = function(counter,callback){//初始化计数器
	for(i=0;i<counter;i++){
		this.counter[i] = 0+i*1;
	}
	callback();
};
memory.prototype.set = function(count,socket){
	var self = this;
		for(i=0;i<this.counter.length;i++){
			self.counter[i] ++ ;
		}
		//发送一个滚动数字
		socket.emit('document_flush',self.counter);
};
/**
* 读取数据
*/
memory.prototype.read = function(key){
	return map[key];
}
/**
* 写入数据
*/
memory.prototype.write = function(key,value){
	this.emit('write-ok',key+":"+value);
	map[key] = value;
}

/*
* 读取所有
*/
memory.prototype.readAll  = function(){
	return map;
}
exports.mem  = function(){
	return new memory();
}
