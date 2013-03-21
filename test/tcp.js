var net = require('net');
var exec = require('child_process').exec;
var server = net.createServer(function(socket) {
	socket.write('hello\r\n');
	socket.setEncoding('utf8');//发送字节编码
	socket.on('data',function(buffer){
		var line = buffer.trim();
		switch(line){
			case 'mac info':
				var mac  = exec('uname -a');
				mac.stdout.on('data', function (data) {
					var info = data.split(' ');
					console.log(info);
					socket.write(' 系统名称:'+info[0]+'\n 系统时间:'+info[1]+'\n CPU:'+info[14]);
				});
				mac.on('exit', function (code) {
				    console.log('子进程已关闭，代码：' + code);
				});
				
			break;
			case 'exit':
			case 'quit':
				socket.write('quit');
				socket.destroy();
			break;
		}
		
	})
});
server.listen(8888,function(){
	console.log('tcp server 已经启动');
});