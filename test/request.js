var http = require('http');
function request(options){

};
request.prototype.get = function(api,parmas,callback){}
request.prototype.post = function(){}


exports.httpRequest = function(options){
	return new request(options)
}
