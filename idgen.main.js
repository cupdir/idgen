var main = require('./lib/core.js'),
	config = require('./config/idgen.config.select');
//启动ID服务
main
	//分布式host_id
	.idgen(config);