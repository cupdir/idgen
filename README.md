# node-idgen 
## Introduction

*id分配器， 可以提供使用者10位到20位的不重复ID。
*10000天的唯一数字，不出问题的情况下可以使用27年，如果故障频繁 一天两次。 那么就是 (365*27/2)/365 =13.5年
*算法： 一位 1-9的分布式机器号  + 四位自增天数，不足四位补零 min 0 max 9999 + 5-15位 自增数字.
*缺点：本算法是有寿命消耗的。就是说，重启服务器或者进程挂掉 都是要消耗产量的。 
*在获取10位数字的情况下。前五位被唯一标示所占用。单台最大支持(寿命*一天可生成的10W) = 10亿不重复的ID。 如果进程和机器挂掉，会自消耗一天。
*缺点：如果要加大数字的业务量，只能消耗硬件，这样的ID分配效率是惊人的高。所以单台跑9个分配器，那么 （10W * 9 = ） =90W。
*优点：进程启动后读取一次唯一寿命数字，所有的ID都是系统临时分配，不预先生成，减少网络I/O的次数。避开存储大数据量的读取算法操作。
*持久提供服务，直到寿命结束.
*自由获取 10个段位 到 20段位的不重复数字。
*所以说位数越高，ID就越用不完。 最大 20位。 
*段位少的，只能加大进程数，进程数越高，产生的ID就越多。
*最大1-9个进程， 就是按最小位数算 10W的9倍。
*获取段位，请业务需求，缓慢的增量或者有段位特殊需求，比如合约机，就需要一个10位的。因为合约机，一个月的销量是1W，所以10位的ID是满足的，日志系统的ID。使用
*段位小的就很糟糕了。 建议使用20位


## Install
node-idgen的所有计数器唯一标示是基于MYSQL存储的。所以我们首先要把表建好。

	-- ----------------------------
	-- Table structure for `counter`
	-- ----------------------------
	DROP TABLE IF EXISTS `counter`;
		CREATE TABLE `counter` (
	  	`id` smallint(5) NOT NULL AUTO_INCREMENT COMMENT 'ID',
	  	`token` varchar(50) DEFAULT NULL,
	  	`life` mediumint(5) DEFAULT '0',
	  	`bit` tinyint(3) DEFAULT '0',
	  	PRIMARY KEY (`id`)
	) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
插入测试数据

	-- ----------------------------
	-- Records of counter
	-- ----------------------------
	INSERT INTO `counter` VALUES ('1', 'wanghaiquan', '4', '6');
	INSERT INTO `counter` VALUES ('2', 'sunjianfei', '3', '16');

修改配置文件

（ID思路解析）
1，自增长方案
	*分布式：增加2位的标示 00
	*采用MYSQL保存ID生成策略，服务启动，载入内存。 
	*增加MYSQL支持
