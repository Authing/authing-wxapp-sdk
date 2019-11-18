# authing-wxapp-sdk（Authing SDK for 小程序）

> 更新时间： 2019-11-16
> 本次更新： 支持在微信小程序中，使用微信授权注册、登录 Authing，获取并绑定用户手机号

![](https://usercontents.authing.cn/doc/assets/wechatapp_demo.png)

Github 地址：[https://github.com/Authing/authing-wxapp-sdk](https://github.com/Authing/authing-wxapp-sdk)

相关示例可直接下载源代码用小程序开发工具运行

> **NOTE!** 在小程序中开发需要在小程序管理后台中配置域名，两个域名分别为：``https://users.authing.cn``和``https://oauth.authing.cn``

## 准备使用 Authing 接入微信小程序登录

### 注册微信小程序开发账号

- [微信开放平台](https://mp.weixin.qq.com/)
- 如果需要获取用户手机号，需通过微信认证。
- 将 `oauth.authing,cn` 和 `users.authing.cn` 加入微信的服务器列表

![](https://usercontents.authing.cn/2019-11-16-104739.png)

### 在 Authing 控制台开启微信小程序社会化登录
- 获取微信小程序 AppId 和 AppSecret

![](https://usercontents.authing.cn/website/assets/wechatapp_appid.png)

- 前往 Authing 控制台 **第三方登录** -> **社会化登录** -> **第三方OAuth**
- 填入微信小程序的 AppId 和 AppSecret

![](https://usercontents.authing.cn/Xnip2019-11-16_17-34-34.png)

## 下载代码

``` shell
git clone https://github.com/Authing/authing-wxapp-sdk
```

## 引入文件

然后将 repo 内的 authing 文件夹移动到你的项目目录下，之后使用 require 引入

```javascript
var Authing = require('path/to/authing/authing.js')
```

## 使用

### 初始化

> [如何获取用户池 ID（userPoolId）？](https://learn.authing.cn/authing/quickstart/basic#yong-hu-chi)

``` javascript

const authing = new Authing({
	userPoolId: 'YOUR_USERPOOLID'
});
authing.login({
	email: "USER_EMAIL",
	password: "USER_PASSWORD"
}).then(userinfo => {
	this.setData({
		userinfo: userinfo,
	})
}).catch(err => {
	this.showDialog("登录失败！", err.message)
})
```

### 调用微信相关 SDK 方法需要传入 code

`wx.login` 方法用于获取 `code`，此方法不需要经过用于授权。

出于安全性和非侵入性的考虑，Authing 不会主动调用任何牵涉到用户信息的 API，所以**需要开发者自己确保传给 Authing 的 `code` 永远是最新的**。

在这里推荐一种处理 wx.login 的最佳实践：

app 初次启动的时候判断登录态，如未登录，调用 `wx.login()` 获取 `code` 并存入 `stroage`。
```javascript
// app.js
onLaunch: function() {
	console.log('App Launch')

	// 最佳实践，初次 launch 的时候获取 code 并保存到 localStorage 中
	wx.checkSession({
		success(res) {
			console.log(res)
		},
		fail() {
			wx.login({
				success(res) {
					const code = res.code;
					wx.setStorageSync("code", code)
				}
			})
		}
	})
},
```

每次页面 `onLoad` 时判断登录态，如果登录失效，重新登录获取 `code` 并替换原来存在 `stroage` 中的 `code`：
```JavaScript
onLoad: function() {
	const self = this
	wx.checkSession({
		// 若丢失了登录态，通过 wx.login 重新获取
		fail() {
			wx.login({
				succes(res) {
					const code = res.code;
					wx.setStorageSync("code", code)
				}
			})
		}
	})
},
```

之后调用 Authing SDK 微信相关接口的时候，使用下面的方法获取 `token`，这样就能确保此 `token` 是最新的。
```javascript
const code = wx.getStorageSync("code")
```

### 使用微信授权登录

Authing 对微信授权协议进行了封装，使得开发者可以用几行代码实现使用微信身份登录。开发者只需要引导用户点击微信开放 button 组件，获取到点击事件 `e` 之后，将 `e.detail` 传给 `authing.loginWithWxapp` 方法即可。

```html
<!-- example.wxml -->
<button open-type="getUserInfo" lang="zh_CN" bindgetuserinfo="onGotUserInfo">获取微信头像</button>
```

``` javascript
// example.js
onGotUserInfo: function(e) {
	const self = this;

	// 微信 wx.login 返回的 code, 为了提高灵活性，开发者需要自己维护。
	// 调用 authing.loginWithWxapp()、authing.bindPhone() 的时候请确保 code 是可用的。
	const code = wx.getStorageSync("code")

	authing.loginWithWxapp(code, e.detail).then(userinfo => {
		console.log(userinfo)
		self.setData({
			userinfo: userinfo,
		})
	}).catch(err => {
		self.showDialog("操作失败", err)
	})
},
```

若用户之前同意过授权，不需要点击 `button` 就能直接获取，示例：

``` javascript
const self = this;
// 查看是否授权
wx.getSetting({
	success(res) {
		if (res.authSetting['scope.userInfo']) {
			// 已经授权，可以直接调用 getUserInfo 获取头像昵称
			wx.getUserInfo({
				success: function(res) {
					authing.loginWithWxapp(code, res).then(userinfo => {
						console.log(userinfo)
						self.setData({
							userinfo: userinfo,
						})
					}).catch(err => {
						self.showDialog("操作失败", err)
					})
				}
			})
		}
	}
})
```

### 获取并绑定手机号

> 此接口需小程序通过 **微信认证**。

每次获取微信用户的手机号都需要用户授权，且必须用户主动点击开放组件 button。示例：
```html
<button open-type="getPhoneNumber" bindgetphonenumber="bindPhone">绑定手机号</button>
```
```javascript
// example.js
bindPhone: function(e) {
	const self = this
	console.log(e)
	// 请确保这个 code 是最新可用的
	const code = wx.getStorageSync("code")
	authing.bindPhone(code, e.detail).then(function(userinfo) {
		console.log(userinfo)
		self.setData({
			userinfo: userinfo,
		})
	}).catch(function(err) {
		self.showDialog("操作失败", err.message)
	})
},
```

### 修改头像

Authing 会自动处理打开相册、上传图片的逻辑，开发者只需要传入唯一的参数：`userId` 即可，成功的回调函数会返回最新的用户信息。

```javascript
// 需在登录状态下调用
changeAvatar: function() {
  const self = this;
  const userId = this.data.userinfo._id
  authing.changeAvatar(userId).then(function(userinfo) {
    console.log(userinfo)
    self.setData({
      userinfo: userinfo,
    })
  }).catch(function(err) {
    console.log(err)
  })
},
```

### 其他接口

其他和 JavaScript 版本相同：[https://github.com/Authing/authing-js-sdk](https://github.com/Authing/authing-js-sdk)，若存在问题，可以发 issue 指出。

 
若想试用 async 需要自行搭建小程序的 ES6 环境。

了解更多报错的详情，请查看[错误代码](https://docs.authing.cn/#/quick_start/error_code)。
