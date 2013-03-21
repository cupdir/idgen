
var client      = require('mysql'),
	events = require('events'),
	util   = require('util');

var params = {host:'10.237.39.154','port':3306, 'user':'root','password':'haiquan','database':'xm_idgen','debug':true};
function mysql(){
	this.connect();
	events.EventEmitter.call(this);
};
util.inherits(mysql, events.EventEmitter);
//创建Mysql连接
mysql.prototype.connect = function(){
	var self = this;
	this.client = client.createConnection(params);
	this.client.connect(function(err,result){
		if(!err) self.emit('connected'); //发送连接成功
		self.emit('disconnected'); //发送失败事件
	});
};
//查询数据
mysql.prototype.select = function(table,fn){
	this.client.query('SELECT * FROM '+table+' LIMIT 10',function(err,rows){
		if(err) throw new Error('查询错误');
		fn(rows);
	});
};
mysql.prototype.insert = function(){
	return this.connection;
};
mysql.prototype.delete = function(){};
mysql.prototype.update = function(){};

exports.mysql = new mysql();