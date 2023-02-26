# This repository no longer maintained, please move to [authing-js-sdk](https://github.com/authing/authing-js-sdk)

<div align=center>
  <img width="250" src="https://files.authing.co/authing-console/authing-logo-new-20210924.svg" />
</div>

<div align="center">
  <a href="https://badge.fury.io/js/authing-wxapp-sdk"><img src="https://badge.fury.io/js/authing-wxapp-sdk.svg" alt="npm version" height="18"></a>
  <a href="https://npmcharts.com/compare/authing-wxapp-sdk" target="_blank"><img src="https://img.shields.io/npm/dm/authing-wxapp-sdk" alt="download"></a>
  <a href="https://standardjs.com" target="_blank"><img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="standardjs"></a>
  <a href="https://github.com/authing-wxapp-sdk" target="_blank"><img src="https://img.shields.io/npm/l/vue.svg" alt="License"></a>
  <a href="javascript:;" target="_blank"><img src="https://img.shields.io/badge/node-%3E=12-green.svg" alt="Node"></a>
</div>

<br/>

English | [简体中文](./README-zh_CN.md)

Authing Miniapp SDK(`authing-wxapp-sdk`) is suitable for use in wechat Miniapp environmen，baseed [authing-js-sdk](https://github.com/authing/authing.js)，adapted wechat Miniapp environment。You can use `authing-js-sdk` [AuthenticationClient](https://docs.authing.cn/v2/reference/sdk-for-node/authentication/AuthenticationClient.html) all methods，such as obtaining and modifying user data, adding user-defined fields, etc。For example:  **Obtain the user's mobile phone number through wechat authorization**、 **Log in with wechat authorization**、**Log in with the mobile number authorized by wechat**, etc。

##  Configuring Miniapp login in Authing

To use the authoring Miniapp SDK in Miniapp，you need to apply for a small program on the[Weixin Official Accounts Platform](https://mp.weixin.qq.com/?lang=en_US&token=)，and at the same time [Authing Console](https://console.authing.cn/console/userpool) fill in the configuration of the Miniapp.

<details>

<summary><strong>Configure Miniapp login</strong></summary>

1. Go to [Weixin Official Accounts Platform](https://mp.weixin.qq.com/?lang=en_US&token=) first, register a wechat Miniapp development account.

- **If you need to obtain the user's mobile phone number, you need to pass wechat authentication.**

- Add `core.authing Cn` to **request legal domain name**:

![](https://cdn.authing.cn/blog/20201112142753.png)

2. Go to [Authing 控制台](https://console.authing.cn/console/userpool) open wechat Miniapp social login.

- Get `appId` and `appSecret` of wechat Miniapp

![](https://cdn.authing.cn/blog/20201112143117.png)

- Go to [Authing 控制台](https://console.authing.cn/console/userpool) **Connect identity source** - **Social login** - **Login in Miniapp**:

![](https://cdn.authing.cn/blog/20201112143302.png)

- Fill in the Miniapp `appId` and `appSecret`, and click save.

![](https://cdn.authing.cn/blog/20201112143351.png)

</details>

## Install

Starting from the basic library version 2.2.1 or above and the developer tool 1.02.1808300 or above, the applet supports the installation of third-party packages using NPM. For details, please refer to: [npm support](https://developers.weixin.qq.com/miniprogram/en/dev/devtools/npm.html).

### Install NPM package

Use NPM:

```
npm install authing-wxapp-sdk
```

Use Yarn:

```
yarn add authing-wxapp-sdk
```

### Building NPM in Miniapp developer tools

Click the menu bar in the developer tool：Tool --> building npm:

<img src="https://cdn.authing.cn/blog/20201112141931.png" height="400px"></img>

Check the **use NPM module** Option:

![](https://cdn.authing.cn/blog/20201112142118.png)

## Initialize

Init `AuthenticationClient` need passing `AppId`:

> You can view your application list in **applications** on the console.

```js
const { AuthenticationClient } = require("authing-wxapp-sdk");

const authing = new AuthenticationClient({
  appId: "YOUR_APP_ID",
});
```

The complete parameter list is as follows:

- `appId`: Authing APP ID（required）；
- `accessToken`: Initialize the SDK through the user's token (optional, you can cache the user's token in the front-end localstorage to realize the purpose of remembering login).
- `timeout`: Request timeout, unit: ms, default: 10000 (10 seconds).
- `onError`: Error handling function, you can use it to catch all exceptions requested by the authoring client globally. The function is defined as:

```js
(code: number, message: string, data: any) => void
```

> Refer to for complete error codes [doc](https://docs.authing.cn/v2/reference/error-code.html)。

- `host`: Authing server。If you are using the public cloud version, please ignore the parameter. This parameter is required if you are using the version of privatized deployment. The format is as follows:: `https://authing-api.mydomain.com`，finally, without `/`.

## Usage

After the user logs in, the SDK will write the user's `token` into the storage of wechat, and subsequent requests will automatically carry the `token` for access.

![](https://cdn.authing.cn/blog/20201112165637.png)

```js
const { code } = await wx.login();
// No user authorization required
const user = await authing.loginByCode(code); // 成功登录，将 token 写入微信 Storage

// You can do this after logging in
await authing.updateProfile((nickname: "Bob"));
```

Subsequently, the user opens the applet again. If the token of the user is saved in the storage of the applet, the request to access authing will automatically carry the token.

```javascript
// The request can succeed because the user is logged in.
await authing.updateProfile((nickname: "Mick"));
```

## API Reference

> You can use `authing-js-sdk` [AuthenticationClient](https://docs.authing.cn/v2/reference/sdk-for-node/) all methods，the calling method is completely consistent with `Authing JS SDK`.

### loginByCode

> Log in with wechat authorization。

- If the user logs in the applet for the first time, and the user has not logged in using the wechat application bound to the same subject as the applet, a new account will be created.
- If the user logs in the applet for the first time, but the user has logged in using the wechat application of the same subject bound to the applet, the corresponding wechat account will be returned.

#### Parameter

- `code`: Call [wx.login()](https://developers.weixin.qq.com/miniprogram/dev/api/open-api/login/wx.login.html) get the `code`，no user authorization is required. Required。
- `options`: Optional。
- `options.iv`: `open-type` is `getUserInfo` [Weixin Button Component](https://developers.weixin.qq.com/miniprogram/en/dev/component/button.html) returned `iv`。`iv` and `encryptedData` are required，The Authing server will attempt to encrypt user data from 'iv' and 'encrypteddata'. Manual authorization is required for the first time. Optional.
- `options.encryptedData`: `open-type` is `getUserInfo` [Weixin Button Component](https://developers.weixin.qq.com/miniprogram/en/dev/component/button.html) returned `encryptedData`。`iv` and `encryptedData` are required. The server will attempt to encrypt user data from 'iv' and 'encrypted data'. Manual authorization is required for the first time. Optional.
- `options.rawData`: `open-type` is `getUserInfo` [Weixin Button Component](https://developers.weixin.qq.com/miniprogram/en/dev/component/button.html) returned `rawData`. Choose between 'iv' + 'encrypteddata'. If 'rawdata' is passed, the authing server will directly use the data as the user's profile. Manual authorization is required for the first time. Optional.

#### Example

1. Silent authorization

The nickname and avatar in the profile of the first registered user will be empty because the user's Avatar and nickname are not obtained.

```javascript
const { code } = await wx.login();
const data = await authing.loginByCode(code);
```

2. User manually authorized to obtain nickname Avatar

> Authorization is only required for the first time. Users can use ` Wx GetUserInfo ` get the nickname of the avatar directly

- Request user manual authorization for the first time

```html
<button open-type="getUserInfo" bindgetuserinfo="getUserInfo">
  Get avatar nickname
</button>
```

```javascript
getUserInfo: async function (e) {
  const { code } = await wx.login()
  const { rawData } = e.detail
  const user = await authing.loginByCode(code, { rawData })

  // or passing iv encryptedData
  // const { iv, encryptedData } = e.detail
  // const user = await authing.loginByCode(code, { iv, encryptedData })

  console.log(user)
}
```

- After that, you can use the `wx.getUserInfo` auto get

```javascript
const { rawData } = await wx.getUserInfo();
const user = await authing.loginByCode(code, { rawData });
// 或者传 iv encryptedData
// const { iv, encryptedData } = e.detail
// const user = await authing.loginByCode(code, { iv, encryptedData })
```

### loginByPhone

> Log in through wechat mobile number authorization. Each call requires manual authorization by the user.

- If the mobile phone number is registered for the first time, it will bind the mobile phone number with the wechat account (it will be created if it does not exist).
- If the mobile phone number has been registered before, the account corresponding to the mobile phone number will be returned, and the mobile phone number will be bound with the current wechat account.

#### Parameter

- `code`: Call [wx.login()](https://developers.weixin.qq.com/miniprogram/dev/api/open-api/login/wx.login.html) get `code`，no user authorization is required. Required.
- `iv`: `open-type` is `getPhoneNumber` [Weixin Button Component](https://developers.weixin.qq.com/miniprogram/en/dev/component/button.html) returned `iv`. Required.
- `encryptedData`: `open-type` is `getPhoneNumber` [Weixin Button Component](https://developers.weixin.qq.com/miniprogram/en/dev/component/button.html) return `encryptedData`. Required.

#### Example

```html
<button open-type="getPhoneNumber" bindgetphonenumber="getPhone">
  get phone code
</button>
```

```javascript
getPhone: async function(e) {
  const { code } = await wx.login()
  const { iv, encryptedData } = e.detail
  const data = await authing.loginByPhone(code, iv, encryptedData)
  console.log(data)
}
```

### getPhone

> Get the mobile phone number of the current user (you will not use this mobile phone number to register or bind an account).

#### Parameter

- `code`: Call [wx.login()](https://developers.weixin.qq.com/miniprogram/dev/api/open-api/login/wx.login.html) get `code`，no user authorization is required. Required
- `iv`: `open-type` is `getPhoneNumber` [Weixin Button Component](https://developers.weixin.qq.com/miniprogram/en/dev/component/button.html) return `iv`. Required.
- `encryptedData`: `open-type` is `getPhoneNumber` [Weixin Button Component](https://developers.weixin.qq.com/miniprogram/en/dev/component/button.html) return `encryptedData`. Required.

#### Example

```html
<button open-type="getPhoneNumber" bindgetphonenumber="getPhone">
  获取手机号
</button>
```

```javascript
getPhone: async function(e) {
  const { code } = await wx.login()
  const { iv, encryptedData } = e.detail
  const data = await authing.getPhone(code, iv, encryptedData)
  console.log(data)
}
```

Example of returned data:

```json
{
  "countryCode": "86",
  "phoneNumber": "176xxxx6754",
  "purePhoneNumber": "176xxxx6754",
  "openid": "o1p9H4wAgb9uTqpxG5Z1g0pIr3FE",
  "unionid": "o0pqE6Fbr5M-exSu_PeL_sjwN44U"
}
```

### updateAvatar

> Update user avatar, this method will automatically call `wx.chooseimage` to get the image and upload it to the CDN of authoring, only one line of code is required.

#### Example

```javascript
const { photo } = await authing.updateAvatar();
console.log(photo);
```

## Best practices

We recommend that when the user uses the applet for the first time, use 'loginbycode' to obtain the authing account corresponding to the applet account. If the account has been bound with a mobile phone number before, there is no need to request the user to authorize the mobile phone number again. If the account is not bound with a mobile phone number, call the 'loginbyphone' method to request the user to authorize a mobile phone number.

After the user logs in, `authing wxApp SDK` will write the `token` to the `storage` of the applet. You can call `authing.checkloginstatus()` judge whether the user's token is valid, and log in again when the token is invalid.

## Error handling

You can use `try catch` to handle errors:

```js
try {
  const user = await authing.loginByEmail("test@example.com", "passw0rd");
} catch (error) {
  console.log(error.code); // 2004
  console.log(error.message); // User does not exist
}
```

> See for complete error codes: [doc](https://docs.authing.cn/v2/reference/error-code.html)。

You can also specify `onerror` to catch all authing request exceptions, such as using `wx.showmodal` and other wechat components display error prompts.

```js
const authing = new AuthenticationClient({
  userPoolId,
  onError: (code, message) => {
    wx.showModal({
      content: message,
      showCancel: false,
    });
  },
});
```

## Contribution
- Fork it
- Create your feature branch (git checkout -b my-new-feature)
- Commit your changes (git commit -am 'Add some feature')
- Push to the branch (git push origin my-new-feature)
- Create new Pull Request
