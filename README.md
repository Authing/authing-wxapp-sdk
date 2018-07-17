# authing-wxapp-sdk（Authing SDK for 小程序）

> 相关接口和JavaScript版本相同：[https://github.com/Authing/authing-js-sdk](https://github.com/Authing/authing-js-sdk)

[![Watch the video](https://usercontents.authing.cn/20180528-184211@2x.png)](https://usercontents.authing.cn/wxapp-sdk-demo.mp4)

点击图片查看demo视频

Github地址：[https://github.com/Authing/authing-wxapp-sdk](https://github.com/Authing/authing-wxapp-sdk)

相关示例可直接下载源代码用小程序开发工具运行

> **NOTE!**在小程序中开发需要在小程序管理后台中配置域名，两个域名分别为：``https://users.authing.cn``和``https://oauth.authing.cn``

#### 下载代码

``` shell
git clone https://github.com/Authing/authing-wxapp-sdk
```

#### 引入文件

然后将repo内的authing文件夹移动到你的项目目录下，之后使用require引入

```javascript
var Authing = require('path/to/authing/authing.js')
```

#### 调用

注意，在使用小程序SDK时，可以不传入email和password参数，取而代之的是unionid，就是从小程序获取的openid或unionid。

``` javascript

var auth = new Authing({
	clientId: 'your_client_id',
	secret: 'your_app_secret'
});

auth.then(function(validAuth) {

	//验证成功后返回新的authing-js-sdk实例(validAuth)，可以将此实例挂在全局

	validAuth.login({
		unionid: 'test@testmail.com',
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
