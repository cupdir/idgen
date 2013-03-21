var object = new Object();
object.name = '11111';
//
var object_01 = {
	sex:'11111',
	age:function(){}
}
object_01.name='111111';
///
var object_02 = function(){
	this.name='1111';
};
object_02.prototype.getName = function(){
	return this.name;
};
object_02 = new object_02();

console.log(object_02.getName());

//

function object_03(){
	this.name='11111';
};


