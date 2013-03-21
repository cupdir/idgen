//mongodb client by cupdir
var client      = require('mysql'),
	events = require('events'),
	util   = require('./util').util;
	

function mysql(options){
	this.options = options;
	this.connection = client.createConnection(options);
	this.connection.connect(function(err,result){
		console.log('(0)正在连接计数器.');
		if(err){
			console.log('[error]连接计数器失败.');
			process.exit(1);
		}
		console.log('(1)计数器连接成功.');
	});
 	events.EventEmitter.call(this);
}
util.inherit(mysql, events.EventEmitter);
mysql.prototype.init = function(callback){
	var self = this,counter =[];
	this.connection.query('UPDATE counter SET life = life+1',function(err,result){
		self.connection.query('SELECT * FROM counter',function(err,rows){
				if(err)process.exit(1);
				for(var i=0;i<rows.length;i++){
					if(rows[i].life > self.options.max_life){
						console.log('[error] 计数器名称'+rows[i].token+'最大化');
					}else{
						rows[i]['count'] = 0;
						counter.push(rows[i]);
					}
				}
				if(!counter.length){
					console.log('[error]所有计数器最大化异常');
					process.exit(1);
				}
				console.log('(2)初始化计数器');
				if(err)process.exit(1);
				console.log('(3)初始化成功，影响计数器('+result.changedRows+')个')
				callback(counter);
			})
	})
};
mysql.prototype.reset = function(token,fn){
	var self  = this;
	this.connection.query('UPDATE counter SET life = life+1 WHERE token=?',token,function(err,result){
		if(err){
			console.log('[error]初始化名称为'+token+'的计数器失败');
			process.exit(1);
		}
		self.connection.query('SELECT * FROM counter WHERE token=?',token,function(err,rows){
			if(fn) fn(rows[0]);
		});
	});
};
mysql.prototype.close = function(){
	if(this.connection) this.connection.destroy();
};
exports.createConnedestroyction = function(options){
	//放在这里是有道理的
 	return new mysql(options);
}