var client = require('mongodb'),
	events = require('events'),
	util   = require('util');

var params = {host:'10.237.39.154','port':27017, 'database':'mongotest','debug':true};
function mongo(){
	this.connect();
	events.EventEmitter.call(this);
};
util.inherits(mongo, events.EventEmitter);
//创建Mysql连接
mongo.prototype.connect = function(){
	var self = this;
	var server_options = new client.Server('10.237.39.154','27017',{auto_reconnect:true});
	var db_options = {native_parser:true,strict:false,safe:false};
	this.client = new client.Db(params.database,db_options)
	this.client.open(function(err,db){
		if(!err) self.emit('connected'); //发送连接成功
		self.emit('disconnected'); //发送失败事件
	});
};
//查询数据
mongo.prototype.select = function(){

};
mongo.prototype.insert = function(){
};
mongo.prototype.delete = function(){};
mongo.prototype.update = function(){};

exports.mongo = function(){
	return new mongo();
}