const express=require('express');
const expressStatic=require('express-static');
const bodyParser=require('body-parser');
const session=require('express-session');
const cookieParser=require('cookie-parser');
const mysql=require('mysql');

// const router = require('../router/user.js')

//MySQL数据库连接
var connection=mysql.createConnection({
	host:'127.0.0.1',
	user:'root',
	password:'w1273405152',
	port:'3306',
	database:'test'
})
connection.connect(function(err){
	if(err){
		console.log('连接失败');
		console.log(err);
	}else{
		console.log('连接成功');
	}
})
//查询
function select(name){
	// console.log("11")
	//异步
	var p=new Promise(function(resolve,reject){
        var sql='SELECT test_name,test_pass FROM websites WHERE test_name=?';
		var f=[];
		f.push(name);
		connection.query(sql,f,function(err,result){
			if(err){
				console.log('[SELECT ERROR]-',err.message);
			}else{
				var dataString=JSON.stringify(result);
				var data=JSON.parse(dataString);
				console.log('data[0]为: ',data[0]);
				resolve(data[0]);
			}
		})
	})
	return p;
}
//插入
function insert(arr){
	// console.log("22")
	var addsql='INSERT INTO websites(test_name,test_pass) VALUES(?,?)';
	var addsqlStr=arr;
	// arr=['name','pass'];
	connection.query(addsql,addsqlStr,function(err,result){
		if(err){
			console.log('[INSERT ERROR]-',err.message);
		}else{
			console.log('INSERT is success');
		}
	})
}
//关于注册---->post
//在这里初始的users我们把它当成{name:'222',pass:'333'};
var server=express();
server.use(bodyParser.urlencoded({extended: false}));
//解决跨域问题
server.use('*',function(req,res,next){
	    console.log('调用了1')
	    //支持cookie跨域 2
		res.header("Access-Control-Allow-Origin",req.headers.origin);
	    res.header("Access-Control-Allow-Headers","Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild");
	    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	    //支持cookie跨域 1
		res.header("Access-Control-Allow-Credentials",true);
		next();
})
server.use('/reg',function(req,res){
	console.log('调用了2')
	var POST=req.body;
	var arr=[];
	var test=select(POST.name);
	var users;
	test.then(function(data){
		users=data;
		console.log('注册用户信息为:',users);
		//检查用户名是否存在
		if(users==undefined){
			arr.push(POST.name);
			arr.push(POST.pass);
			insert(arr);
			//arr=['333','444'];
			res.send({ok:true,msg:"注册成功"});
		}else{
			res.send({ok:false,msg:"用户名已经存在"});
		}
	})
})
//关于登录----->GET
server.use('/login',function(req,res){
	var name=req.query['name'];
	var pass=req.query['pass'];
	var check=req.query['check'];
	var check1=req.query['check1'];
	//1.检查用户名不存在
	//2.判断用户密码是否正确
	var test=select(name);
	var users;
	test.then(function(data){
		users=data;
		//我们希望它返回的值users={name:"222",pass:"333",check:0}
		console.log('登陆用户信息为: ',users);
		if(users==undefined){
			res.send({ok:false,msg:"该用户不存在"});
		}else if(users["test_pass"]!=pass){
			res.send({ok:false,msg:"用户或者密码错误"});
		}else{
			if(check=='true'||check1=='true'){
				res.cookie('username',name,{path:'/',maxAge:1000*3600*24});
				res.cookie('password',pass,{path:'/',maxAge:1000*3600*24});
			}else if(check=='false'&&check1=='false'){
				res.cookie('username',name,{path:'/',maxAge:-1});
				res.cookie('password',pass,{path:'/',maxAge:-1});
			}
			res.cookie('name',"true",{path:'/',maxAge:1000*3600*24*30});
			res.cookie('remMe',check,{path:'/',maxAge:1000*3600*24});
			res.cookie('auto',check1,{path:'/',maxAge:1000*3600*24});
			res.send({ok:true,msg:"登录成功"});
		}
	})
})
//退出------>GET
server.use('/quit',function(req,res){
    res.clearCookie('name');
    res.send('登出成功。');
})
server.use('/favicon.ico',function(req,res){
	res.send('404');
})
server.use(expressStatic('./Load'));
server.listen(5500);