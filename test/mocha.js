var store = require('./mysql.js');
describe('数据库连接测试', function(){
	it('mysql-select-test',function(done){
		var store_object = store['mysql']();
		store_object.on('disconnected',function(){})
		store_object.on('connected',function(){
			store_object.select('counter',function(result){
				console.log(result);
				done();
			});
		});
	});
	it('mysql-insert-test',function(done){
		
	});
});