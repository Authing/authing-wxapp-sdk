# Authing-wxapp-sdk（Authing SDK for 小程序）

## 目录

- [准备工作](#%e5%87%86%e5%a4%87%e5%b7%a5%e4%bd%9c) - [注册微信小程序开发账号](#%e6%b3%a8%e5%86%8c%e5%be%ae%e4%bf%a1%e5%b0%8f%e7%a8%8b%e5%ba%8f%e5%bc%80%e5%8f%91%e8%b4%a6%e5%8f%b7) - [在 Authing 控制台开启微信小程序社会化登录](#%e5%9c%a8-authing-%e6%8e%a7%e5%88%b6%e5%8f%b0%e5%bc%80%e5%90%af%e5%be%ae%e4%bf%a1%e5%b0%8f%e7%a8%8b%e5%ba%8f%e7%a4%be%e4%bc%9a%e5%8c%96%e7%99%bb%e5%bd%95) - [开启小程序 async/await 支持（可选）](#%e5%bc%80%e5%90%af%e5%b0%8f%e7%a8%8b%e5%ba%8f-asyncawait-%e6%94%af%e6%8c%81%e5%8f%af%e9%80%89)
- [下载代码](#%e4%b8%8b%e8%bd%bd%e4%bb%a3%e7%a0%81)
- [引入文件](#%e5%bc%95%e5%85%a5%e6%96%87%e4%bb%b6)
- [使用 SDK](#%e4%bd%bf%e7%94%a8-sdk) - [初始化](#%e5%88%9d%e5%a7%8b%e5%8c%96) - [获取小程序的 Code](#%e8%8e%b7%e5%8f%96%e5%b0%8f%e7%a8%8b%e5%ba%8f%e7%9a%84-code) - [使用微信授权登录](#%e4%bd%bf%e7%94%a8%e5%be%ae%e4%bf%a1%e6%8e%88%e6%9d%83%e7%99%bb%e5%bd%95) - [获取手机号](#%e8%8e%b7%e5%8f%96%e6%89%8b%e6%9c%ba%e5%8f%b7) - [绑定手机号](#%e7%bb%91%e5%ae%9a%e6%89%8b%e6%9c%ba%e5%8f%b7) - [修改头像](#%e4%bf%ae%e6%94%b9%e5%a4%b4%e5%83%8f) - [用户自定义字段](#%e7%94%a8%e6%88%b7%e8%87%aa%e5%ae%9a%e4%b9%89%e5%ad%97%e6%ae%b5) - [解密微信接口数据](#%e8%a7%a3%e5%af%86%e5%be%ae%e4%bf%a1%e6%8e%a5%e5%8f%a3%e6%95%b0%e6%8d%ae) - [其他接口](#%e5%85%b6%e4%bb%96%e6%8e%a5%e5%8f%a3)
- [Contributors ✨](#contributors-%e2%9c%a8)
- [Get Help](#get-help)

![](https://usercontents.authing.cn/doc/assets/wechatapp_demo.png)

Github 地址：[https://github.com/Authing/authing-wxapp-sdk](https://github.com/Authing/authing-wxapp-sdk)

相关示例可直接下载源代码用小程序开发工具运行

> **NOTE!** 在小程序中开发需要在小程序管理后台中配置域名，两个域名分别为：`https://users.authing.cn`和`https://oauth.authing.cn`

## 准备工作

### 注册微信小程序开发账号

- [微信开放平台](https://mp.weixin.qq.com/)
- 如果需要获取用户手机号，需通过微信认证。
- 将 `oauth.authing,cn` 和 `users.authing.cn` 加入微信的服务器列表

![](https://usercontents.authing.cn/2019-11-16-104739.png)

### 在 Authing 控制台开启微信小程序社会化登录

- 获取微信小程序 AppId 和 AppSecret

![](https://usercontents.authing.cn/website/assets/wechatapp_appid.png)

- 前往 Authing 控制台 **第三方登录** -> **社会化登录** -> **第三方 OAuth**
- 填入微信小程序的 AppId 和 AppSecret

![](https://usercontents.authing.cn/Xnip2019-11-16_17-34-34.png)

### 开启小程序 async/await 支持（可选）

打开「详情」，将 「ES6 转 ES5」 和「增强编译」勾选上。

![](https://cdn.authing.cn/blog/20200409113007.png)

## 下载代码

```shell
git clone https://github.com/Authing/authing-wxapp-sdk
```

## 引入文件

然后将 repo 内的 authing 文件夹移动到你的项目目录下，之后使用 require 引入

```javascript
var Authing = require('path/to/authing/authing.js')
```

## 使用 SDK

### 初始化

如果你对 Authing 用户池这个概念不是很了解，可以查阅 Authing 官方文档：

- [基础概念](https://learn.authing.cn/authing/quickstart/basic)
- [如何获取用户池 ID?](https://learn.authing.cn/authing/others/faq)

```javascript
const authing = new Authing({
  userPoolId: 'YOUR_USERPOOLID',
})
```

之后就可以调用其他的方法了，比如：

```
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

### 获取小程序的 Code

Code 用来在小程序中执行微信登录，获取用户信息。`wx.login` 方法用于获取 `code`，此方法不需要经过用于授权。

下面推荐一种如何处理 Code 的最佳实践：

- app 初次启动的时候判断登录态，如未登录，调用 `wx.login()` 获取 `code` 并存入 `storage`。

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

- 每次页面 `onLoad` 时判断登录态，如果登录失效，重新登录获取 `code` 并替换原来存在 `storage` 中的 `code`：

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

- 之后调用 Authing SDK 微信相关接口的时候，使用下面的方法获取 `token`，这样就能确保此 `token` 是最新的。

```javascript
const code = wx.getStorageSync('code')
```

### 使用微信授权登录

> 注：当前小程序版本，第一次获取用户信息需要用户主动点击开放组件。授权通过之后，后续可以直接调用接口。

Authing 对微信授权协议进行了封装，使得开发者可以用几行代码实现使用微信身份登录。开发者只需要引导用户点击微信开放 button 组件，获取到点击事件 `e` 之后，将 `e.detail` 传给 `authing.loginWithWxapp` 方法即可。

**同时，你也可以传入手机号（获取方法见下文），这样如果用户之前使用手机号注册过，登录获取到的将会是同一个用户。**

参数：

- options
  - code: 微信 code，必填。
  - detail: 用户头像授权事件 e.detail，必填。
  - phone: 手机号，可选。
  - overideProfile: 如果用户之前使用手机号注册过，是否替换调用户的头像和昵称，默认为 false。

```html
<!-- example.wxml -->
<button open-type="getUserInfo" lang="zh_CN" bindgetuserinfo="onGotUserInfo">
  获取微信头像
</button>
```

```javascript
// example.js
onGotUserInfo: function(e) {
	const self = this;

	// 微信 wx.login 返回的 code, 为了提高灵活性，开发者需要自己维护。
	// 调用 authing.loginWithWxapp()、authing.bindPhone() 的时候请确保 code 是可用的。
	const code = wx.getStorageSync("code")

	// 获取到的用户手机号，获取方法见下文
	const phone = this.data.phone.phoneNumber

	authing.loginWithWxapp({
		code,
		detail: e.detail,
		phone,
		overideProfile: true,
	}).then(userinfo => {
		console.log(userinfo)
		self.setData({
			userinfo: userinfo,
		})
		wx.login({
			success(res) {
				const code = res.code;
				wx.setStorageSync("code", code)
			}
    })
	}).catch(err => {
		self.showDialog("操作失败", err)
	})
},
```

若用户之前同意过授权，不需要点击 `button` 就能直接获取，示例：

```javascript
const self = this
// 查看是否授权
wx.getSetting({
  success(res) {
    if (res.authSetting['scope.userInfo']) {
      // 已经授权，可以直接调用 getUserInfo 获取头像昵称
      wx.getUserInfo({
        success: function(res) {
          authing
            .loginWithWxapp({
              code,
              detail: res,
            })
            .then(userinfo => {
              console.log(userinfo)
              self.setData({
                userinfo: userinfo,
              })
            })
            .catch(err => {
              self.showDialog('操作失败', err)
            })
        },
      })
    }
  },
})
```

> 注 ⚠️：在获取用户信息之后，code 将会失效，所以这里调用了 `wx.login` 刷新 `code` 并保持至 `localStorage` 。

### 获取手机号

> 此接口需小程序通过 **微信认证**。

> 注：获取手机号需要使用微信开放组件，不能直接调用微信开放接口。示例如下：

```html
<button open-type="getPhoneNumber" bindgetphonenumber="getPhone">
  获取手机号
</button>
```

Authing 对微信授权协议进行了封装，使得开发者可以用几行代码实现获取用户手机号。开发者只需要引导用户点击微信开放 button 组件，获取到点击事件 `e` 之后，将 `e.detail` 传给 `authing.getPhone` 方法即可。

参数：

- options
  - code: 微信 code，必填。
  - detail: 手机号授权事件 e.detail，必填。

```javascript
getPhone: function(e) {
	const code = wx.getStorageSync("code")
	authing.getPhone({code, detail: e.detail}).then(phone => {
		console.log(phone)
		this.setData({
			phone
		})
		wx.login({
			success(res) {
				const code = res.code;
				wx.setStorageSync("code", code)
			}
		})
	})
},
```

回调参数 phone 示例如下：

```javascript
{
	"phoneNumber": "1767xxxx6754",
	"purePhoneNumber": "176xxxx6754",
	"countryCode": "86"
}
```

> 注 ⚠️：在获取手机号之后，code 将会失效，所以这里调用了 `wx.login` 刷新 `code` 并保持至 `localStorage` 。

### 绑定手机号

> 此接口需小程序通过 **微信认证**。

开发者可以使用此接口让用户**绑定手机号**，但是不能用于通过手机号登录或注册新用户，如果想通过手机验证码登录，需要调用 [loginByPhoneCode](https://learn.authing.cn/authing/sdk/sdk-for-javascript#shi-yong-shou-ji-yan-zheng-ma-deng-lu) 方法。

每次获取微信用户的手机号必须用户主动点击开放组件 button，且无主动调用 API。

Authing 对换取用户手机号的协议进行了封装，开发者只需要引导用户点击微信开放 button 组件，获取到点击事件 e 之后，将 e.detail 传给 authing.bindPhone 方法即可。示例：

参数：

- options
  - code: 微信 code，必填。
  - detail: 手机号授权事件 e.detail，必填。

```html
<button open-type="getPhoneNumber" bindgetphonenumber="bindPhone">
  绑定手机号
</button>
```

```javascript
// example.js
bindPhone: function(e) {
	const self = this
	console.log(e)
	// 请确保这个 code 是最新可用的
	const code = wx.getStorageSync("code")
	authing.bindPhone({code, detail: e.detail}).then(function(userinfo) {
		console.log(userinfo)
		self.setData({
			userinfo: userinfo,
		})
		wx.login({
			success(res) {
				const code = res.code;
				wx.setStorageSync("code", code)
			}
    })
	}).catch(function(err) {
		self.showDialog("操作失败", err.message)
	})
},
```

> 注 ⚠️：在获取用户手机号之后，code 将会失效，所以这里调用了 `wx.login` 刷新 `code` 并保持至 `localStorage` 。

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

### 用户自定义字段

用户自定义 Metadata 是除了 Authing 基础用户字段之外，开发者可以给用户添加的额外字段，属于 Authing 扩展能力的一部分。

Metadata 是一组 key-value 值，开发者可以通过设置自定义字段，存储**少量**业务相关的数据。

详细的接口请见： [用户自定义字段](https://docs.authing.cn/authing/sdk/sdk-for-node/user-metadata) 。

调用示例：

```javascript
const userId = this.data.userinfo._id
authing.metadata(userId).then(async metadata => {
  console.log('初始用户自定义字段为空：', metadata)

  await authing.setMetadata({
    _id: userId,
    key: 'KEY',
    value: 'VALUE',
  })

  metadata = await authing.metadata(userId)
  console.log('setMetadata 之后的用户自定义字段：', metadata)

  await authing.removeMetadata({
    _id: userId,
    key: 'KEY',
  })

  metadata = await authing.metadata(userId)
  console.log('removeMetadata 之后的用户自定义字段：', metadata)
})
```

### 解密微信接口数据

我们提供给开发者解密微信加密数据的接口（[相关微信官方文档在此](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/signatrue.html)），出于安全性考虑，我们不会将 session_key 下发。

![](https://cdn.authing.cn/blog/20200413120357.png)

开发者需要将以下三个参数传入 `authing.decrypt` 函数：

- code
- iv
- encryptedData

下面这个例子用于解密 `getUserInfo` 开放事件的原始数据：

```html
 <button open-type="getUserInfo" lang="zh_CN" bindgetuserinfo="testDecryptData"">测试解密数据</button>
```

```javascript
testDecryptData: async function(e) {
    console.log(e)
    const {
      encryptedData,
      iv,
    } = e.detail
    wx.login({
      success(res) {
        const code = res.code;
        wx.setStorageSync("code", code)
        authing.decrypt({
          code,
          encryptedData,
          iv
        }).then(res => {
          console.log(res)
        }).catch(error => {
          console.error(error)
        })
      }
    })
  }
```

获取到的解密过后的原始数据如下：

```javascript
{
	avatarUrl: "https://wx.qlogo.cn/mmopen/vi_32/8INxh2bxDMiaU05jLqvWBszALu2u8Qw4iaxV58v4fERaDWV8yunE7icNiahJdxkOCNfG57zPNRyADo0VWfibiamTMVvQ/132",
	city: "海淀",
	country: "中国"
	gender: 1,
	language: "zh_CN",
	nickName: "xxxx",
	openId: "xxxxxxxxx",
	province: "北京",
	unionId: "xxxxxxxxxx",
	watermark:{
		appid: "xxxxxxxxxx",
		timestamp: 1586750416
	}
}
```

### 其他接口

其他和 JavaScript 版本相同：[https://github.com/Authing/authing-js-sdk](https://github.com/Authing/authing-js-sdk)，若存在问题，可以发 issue 指出。

了解更多报错的详情，请查看[错误代码](https://docs.authing.cn/authing/advanced/error-code)。

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/liaochangjiang"><img src="https://avatars2.githubusercontent.com/u/35447896?s=460&u=6ac1fa7c0cb47d61bdb79f8393128dd61cf11fac&v=4" width="100px;" alt=""/><br /><sub><b>liaochangjiang</b></sub></a><br /></td>
    <td align="center"><a href="https://github.com/leinue"><img src="https://avatars2.githubusercontent.com/u/2469688?s=460&u=d8552f7013594a3758863be7da96ab23983b5eaf&v=4" width="100px;" alt=""/><br /><sub><b>leinue</b></sub></a><br /></td>
    <td align="center"><a href="https://github.com/Meeken1998"><img src="https://avatars2.githubusercontent.com/u/42825670?s=460&u=5a2102caec919d08407a3a2d412cd17e7c61171c&v=4" width="100px;" alt=""/><br /><sub><b>Meeken1998</b></sub></a><br /></td>
		<td align="center"><a href="https://github.com/vincentCheng"><img src="https://avatars2.githubusercontent.com/u/6327228" width="100px;" alt=""/><br /><sub><b>vincentCheng</b></sub></a><br /></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## Get Help

Join us on Gitter: [#authing-chat](https://gitter.im/authing-chat/community)
