# authing-wxapp-sdk

> Authing的官方SDK for 微信小程序

相关接口和JavaScript版本相同：[https://github.com/Authing/authing-js-sdk](https://github.com/Authing/authing-js-sdk)

[![Watch the video](https://usercontents.authing.cn/20180528-184211@2x.png)](https://usercontents.authing.cn/wxapp-sdk-demo.mp4)

此repo可下载后直接用小程序开发工具打开.

#### 使用

1、引入文件

``` shell
git clone https://github.com/Authing/authing-wxapp-sdk
```

然后将authing文件夹移动到你的项目目录下，之后使用require引入

```javascript
var Authing = require('path/to/authing/authing.js')
```

2、调用

``` javascript
var Authing = require('authing-js-sdk');

// 对Client ID和Client Secret进行验证，获取Access Token
var auth = new Authing({
	clientId: 'your_client_id',
	secret: 'your_app_secret'
});

auth.then(function(validAuth) {

	//验证成功后返回新的authing-js-sdk实例(validAuth)，可以将此实例挂在全局

	validAuth.login({
		email: 'test@testmail.com',
		password: 'testpassword'
	}).then(function(user) {
		console.log(user);	
	}).catch(function(error) {
		console.log(error);	
	});
	
}).catch(function(error) {
	//验证失败
	console.log(error);
});

```

[怎样获取client ID ?](https://docs.authing.cn/#/quick_start/howto)。

若想试用async需要自行搭建小程序的ES6环境。

了解更多报错的详情，请查看[错误代码](https://docs.authing.cn/#/quick_start/error_code)。