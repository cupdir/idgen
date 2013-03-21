if(process.argv[2]){
	var store_type = process.argv[2];
	var store = require('./'+store_type+'.js');
	store_object = store[store_type]();
	var client = store_object.select();
	console.log(client);
}else{
	process.exit('参数错误');
}
