//id分配器， 可以提供使用者10位到20位的不重复ID。
// 10000天的唯一数字，不出问题的情况下可以使用27年，如果故障频繁 一天两次。 那么就是 (365*27/2)/365 =13.5年
//算法： 一位 1-9的分布式机器号  + 四位自增天数，不足四位补零 min 0 max 9999 + 5-15位 自增数字.
//缺点：本算法是有寿命消耗的。就是说，重启服务器或者进程挂掉 都是要消耗产量的。 
//在获取10位数字的情况下。前五位被唯一标示所占用。单台最大支持(寿命*一天可生成的10W) = 10亿不重复的ID。 如果进程和机器挂掉，会自消耗一天。
//缺点：如果要加大数字的业务量，只能消耗硬件，这样的ID分配效率是惊人的高。所以单台跑9个分配器，那么 （10W * 9 = ） =90W。
//优点：进程启动后读取一次唯一寿命数字，所有的ID都是系统临时分配，不预先生成，减少网络I/O的次数。避开存储大数据量的读取算法操作。
//持久提供服务，直到寿命结束.
//自由获取 10个段位 到 20段位的不重复数字。
//所以说位数越高，ID就越用不完。 最大 20位。 
//段位少的，只能加大进程数，进程数越高，产生的ID就越多。
// 最大1-9个进程， 就是按最小位数算 10W的9倍。
//获取段位，请业务需求，缓慢的增量或者有段位特殊需求，比如合约机，就需要一个10位的。因为合约机，一个月的销量是1W，所以10位的ID是满足的，日志系统的ID。使用
//段位小的就很糟糕了。 建议使用20位
//参考文献 LINUX PID位图算法
var util 	= 	require('./util').util,	
	events	=	require('events'),
	http 	=	require('http'),
	querystring = require('querystring'),
	counter 	= 0; //全局计数器
	life_bit  = 4; //生成寿命 0-9999 / 365  没启动一次，消耗一次寿命
	day 	=	null;
	redis 	= 	require('redis');
function _id(options){
	var self = this;
	this.host_id =  options.host_id.toString().checkHostId();
	this.hash_key = 'contract_day_hash';
	this.client 	 = 	redis.createClient(6379,'10.237.39.154',{connect_timeout:1500});
	this.client.on('error',function(e){
		console.log('读取寿命失败');
		process.exit(1);
	});
	//当redis连接成功后才能提供服务
	this.client.on('connect',function(){
			console.log('(1)Redis初始化成功');
			self.start();//生成一个启动批次
			self.http();//创建交互请求
	});
	events.EventEmitter.call(this);
}
//扩展方法 检查HOST_ID是否被使用.
String.prototype.checkHostId = function(){
	return this;
};
util.inherit(_id, events.EventEmitter); //继承EventEmitter
_id.prototype.http = function(){
	var self  = this ,tmp_object = {};
	var proxy = http.createServer(function (req, res){
		var post='';
		req.setEncoding('utf8');
		req.addListener('data',function(data){
			post += data; //解析post数据
			console.log('[Received]' + data.length);
			//post
		});
		req.addListener('end',function(){
			//output
			//检查当前位数是否够用
			req.post = querystring.parse(post);
			if( req.method.toLowerCase() == 'post' && req.post.bit >= 10 && req.post.bit <= 20 ){
				tmp_object.id = self.host_id+self.day.create(self,req.post.bit-5).verify(req.post.bit-5,self);
				res.writeHead(200, {'Content-Type': 'application/json'});
				res.end(JSON.stringify(tmp_object));
			}else{
				//405 Method Not Allowed
				res.writeHead(405, {'Content-Type': 'text/plain'});
				res.end();				
			}
		});
		req.addListener('close',function(){});

	});
	proxy.listen(9009,function(){
		//console.log('server is listening on 9009'); 
	});
};
String.prototype.verify = function(check_bit,self){
	var check=0;
	for(var i = this.length;i>=(check_bit-1);i--){
		if(this[i] == 9){
			check++;
		}
	}
	//防止数字溢出
	if(check == check_bit ){
		self.start();//从新换一个批次
		counter = 0; //从新开始
	}
	return this;
}
//减少一天
_id.prototype.start = function(){
	console.log('(2)检查寿命');
	var self = this ;
	var result = function(day_id){
		self.day = day_id;
	};
	this.client.incr(this.hash_key,function(err,day){
		console.log('(3)当前寿命'+parseInt(9999-day)+'天');
		console.log('(4)合计'+parseInt((9999-day)/365)+'年');
		if(day > 9999)process.exit(1);//id寿命结束,可双向扩展
		result(self.index(day-1,life_bit));
	});//启动增加天数
};
_id.prototype.index = function(bit,max){
	if( max_median !== 0)var max_median = max - bit.toString().length;		
			var zero='';
	for(var i=0;i<max_median;i++){
		zero +='0';
	}
	return zero+bit;	
};
//位图分配
String.prototype.create = function(self,index_bit){
		var wans = this[0]+this[1]+this[2]+this[3]; //计算高位
		counter ++;
		return wans+self.index(counter,index_bit);
}
//namespace id
exports.id  =  function(options) {
  return new _id(options);
};