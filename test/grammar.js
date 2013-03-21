//定义函数
function a(){
	alert('1111111111');
}  //具名函数

var a = function(){
	alert('111111111');
} ; //匿名函数

(function(string){
	console.log(string) //这个是可背执行的
})('11111');

function b(){
	function c(){
		console.log('c');
		function n(){
			console.log('n')
		}
		n();
	}
	c();
	function d(){}
}
b()