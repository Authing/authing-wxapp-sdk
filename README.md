# authing-wxapp-sdk（Authing SDK for 小程序）

> 相关接口和 JavaScript 版本相同：[https://github.com/Authing/authing-js-sdk](https://github.com/Authing/authing-js-sdk)
> 更新时间： 2019-8-16
> 本次更新： 新增获取手机号的 getPhone 方法，升级 grantWxapp，authWxapp 方法。详见开发文档。


[![Watch the video](https://usercontents.authing.cn/20180528-184211@2x.png)](https://usercontents.authing.cn/wxapp-sdk-demo.mp4)

点击图片查看 demo 视频

Github 地址：[https://github.com/Authing/authing-wxapp-sdk](https://github.com/Authing/authing-wxapp-sdk)

相关示例可直接下载源代码用小程序开发工具运行

> **NOTE!** 在小程序中开发需要在小程序管理后台中配置域名，两个域名分别为：``https://users.authing.cn``和``https://oauth.authing.cn``

#### 下载代码

``` shell
git clone https://github.com/Authing/authing-wxapp-sdk
```

#### 引入文件

然后将 repo 内的 authing 文件夹移动到你的项目目录下，之后使用 require 引入

```javascript
var Authing = require('path/to/authing/authing.js')
```

#### 调用

注意，在使用小程序 SDK 时，可以不传入 email 和 password 参数，取而代之的是 unionid，就是从小程序获取的 openid 或 unionid。

``` javascript

var auth = new Authing({
	clientId: 'your_client_id',
	secret: 'your_app_secret'
});

auth.then(function(validAuth) {

	//验证成功后返回新的 authing-js-sdk 实例(validAuth)，可以将此实例挂在全局

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

[怎样获取 client ID ?](https://docs.authing.cn/#/quick_start/howto)。

若想试用 async 需要自行搭建小程序的 ES6 环境。

了解更多报错的详情，请查看[错误代码](https://docs.authing.cn/#/quick_start/error_code)。
