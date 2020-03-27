var Authing = require('../authing/authing.js');

// Authing 用户池 ID
const userPoolId = '5e4cdd055df3df65dc58b97d';
const authing = new Authing({
  userPoolId,
  host: {
    user: "http://localhost:5510/graphql",
    oauth: "http://localhost:5510/graphql"
  }
})

const dontLoginMd = `
\`\`\`
暂无，请先登录！
\`\`\`
    `

Page({

  onLoad: function () {
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

  data: {

    // bind form data
    emailRegisterFormData: {
      email: Math.random().toString(36).substring(3) + "@test.com",
      password: "123456!"
    },
    emailLoginFormData: {
      email: "",
      password: ""
    },
    phoneLoginFormData: {
      phone: "",
      phoneCode: ""
    },

    defaultAvatar: "https://usercontents.authing.cn/wxapp/default-avatar.png",
    newNickname: null,
    userinfo: null,
    userinfoMd: dontLoginMd,

    // 反馈组件
    showDialog: false,
    dialogTitle: "",
    dialogMsg: "",
    oneButton: [{
      text: '确定'
    }],

    // 控制几个模块的显示与否：
    displayUserinfo: "default",
    displayEmailRegister: "none",
    displayEmailLogin: "none",
    displayPhoneLogin: "none",

    showNicknameInput: false,

    phone: {
      countryCode: null,
      phoneNumber: null,
      purePhoneNumber: null,
      watermark: null
    }
  },

  geneUserInfoMd: function (userinfo) {
    return `
\`\`\`
${JSON.stringify(userinfo, null, 4)}
\`\`\`
`
  },

  formInputChange: function (e) {
    const id = e.currentTarget.id
    const value = e.detail.value
    if (id === "email") {
      this.setData({
        emailRegisterFormData: Object.assign(this.data.emailRegisterFormData, {
          email: value
        })
      })
    } else if (id === "password") {
      this.setData({
        emailRegisterFormData: Object.assign(this.data.emailRegisterFormData, {
          password: value
        })
      })
    } else if (id === "emailLogin") {
      this.setData({
        emailLoginFormData: Object.assign(this.data.emailLoginFormData, {
          email: value
        })
      })
    } else if (id === "passwordLogin") {
      this.setData({
        emailLoginFormData: Object.assign(this.data.emailLoginFormData, {
          password: value
        })
      })
    } else if (id === "phone") {
      this.setData({
        phoneLoginFormData: Object.assign(this.data.phoneLoginFormData, {
          phone: value
        })
      })
    } else if (id === "phoneCode") {
      this.setData({
        phoneLoginFormData: Object.assign(this.data.phoneLoginFormData, {
          phoneCode: value
        })
      })
    } else if (id === "nickname") {
      this.setData({
        newNickname: value
      })
    }
  },

  showDialog: function (title, msg) {
    this.setData({
      showDialog: true,
      dialogTitle: title,
      dialogMsg: msg
    })
  },

  closeDialog: function () {
    this.setData({
      showDialog: false,
      dialogMsg: "",
      dialogTitle: ""
    })
  },

  onToggleClick: function (e) {
    const self = this;
    const id = e.currentTarget.id;
    const mo = id.replace('toggle-', '')
    const handlers = {
      "emailRegister": function () {
        self.setData({
          displayEmailRegister: self.data.displayEmailRegister === "none" ? "default" : "none"
        })
      },
      "emailLogin": function () {
        self.setData({
          displayEmailLogin: self.data.displayEmailLogin === "none" ? "default" : "none"
        })
      },
      "userinfo": function () {
        self.setData({
          displayUserinfo: self.data.displayUserinfo === "none" ? "default" : "none"
        })
      },
      "phoneLogin": function () {
        self.setData({
          displayPhoneLogin: self.data.displayPhoneLogin === "none" ? "default" : "none"
        })
      }
    }
    handlers[mo]()
  },

  submitEmailRegisterForm: function (e) {
    const self = this
    const email = this.data.emailRegisterFormData.email;
    const password = this.data.emailRegisterFormData.password;
    authing.register({
      email: email,
      password: password
    }).then(user => {
      // 注册成功
      self.setData({
        emailLoginFormData: Object.assign(self.data.emailLoginFormData, {
          email: email,
          password: password
        })
      })
      wx.showToast({
        title: '注册成功！',
      })
    }).catch(err => {
      this.showDialog("注册失败！", err.message)
    })
  },

  submitEmailLoginForm: function (e) {
    const self = this;
    const email = this.data.emailLoginFormData.email;
    const password = this.data.emailLoginFormData.password;
    authing.login({
      email: email,
      password: password
    }).then(userinfo => {
      wx.showToast({
        title: '登录成功！',
      })
      this.setData({
        userinfo: userinfo,
        userinfoMd: self.geneUserInfoMd(userinfo)
      })
    }).catch(err => {
      this.showDialog("登录失败！", err.message)
    })
  },

  sendPhoneCode: function () {
    const self = this;
    const phone = this.data.phoneLoginFormData.phone
    if (!/^1[3456789]\d{9}$/.test(phone)) {
      this.showDialog("发送验证码失败", "请检查手机号格式！")
      return
    }

    authing.getVerificationCode(phone).then(result => {
      wx.showToast({
        title: '发送成功！',
      })
    }).catch(err => {
      self.showDialog("发送验证码失败", err.message)
    })
  },

  loginByPhoneCode: function () {
    const self = this;
    const phone = this.data.phoneLoginFormData.phone
    const phoneCode = this.data.phoneLoginFormData.phoneCode
    if (!/^1[3456789]\d{9}$/.test(phone)) {
      this.showDialog("手机号登录失败", "请检查手机号格式！")
      return
    }
    if (!phoneCode) {
      this.showDialog("手机号登录失败", "请填写验证码！")
      return
    }
    authing.loginByPhoneCode({
      phone: phone,
      phoneCode: phoneCode
    }).then(userinfo => {
      wx.showToast({
        title: '登录成功！',
      })
      this.setData({
        userinfo: userinfo,
        userinfoMd: self.geneUserInfoMd(userinfo)
      })
    }).catch(err => {
      self.showDialog("手机号登录失败", err.message)
    })
  },

  showNicknameInput: function (e) {
    this.setData({
      showNicknameInput: true
    })
  },

  updateNickname: function () {
    const self = this;
    const userId = this.data.userinfo._id;
    const nickname = this.data.newNickname;
    if (!userId) {
      this.showDialog("修改昵称失败", "请先登录！")
      return
    }
    if (!nickname) {
      this.showDialog("修改昵称失败", "请输入昵称！")
      return
    }
    authing.update({
      _id: userId,
      nickname: nickname
    }).then(userinfo => {
      this.setData({
        userinfo: userinfo,
        userinfoMd: self.geneUserInfoMd(userinfo),
        showNicknameInput: false
      })
      wx.showToast({
        title: '修改成功！',
      })
    })
  },

  changeAvatar: function () {
    if (!this.data.userinfo) {
      return
    }

    const self = this;
    const userId = this.data.userinfo._id
    authing.changeAvatar(userId).then(function (userinfo) {
      console.log(userinfo)
      self.setData({
        userinfo: userinfo,
        userinfoMd: self.geneUserInfoMd(userinfo)
      })
    }).catch(function (err) {
      console.log(err)
    })
  },

  onGotUserInfo: function (e) {
    const self = this;

    // 微信 wx.login 返回的 code, 为了提高灵活性，开发者需要自己维护。
    // 调用 authing.loginWithWxapp()、authing.bindPhone() 的时候请确保 code 是可用的。
    const code = wx.getStorageSync("code")
    const phone = this.data.phone.phoneNumber
    authing.loginWithWxapp({
      code,
      phone,
      detail: e.detail,
      overideProfile: true
    }).then(userinfo => {
      console.log(userinfo)
      self.setData({
        userinfo: userinfo,
        userinfoMd: self.geneUserInfoMd(userinfo)
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

  bindPhone: function (e) {
    const self = this
    console.log(e)
    // 请确保这个 code 是最新可用的
    const code = wx.getStorageSync("code")
    authing.bindPhone({ code, detail: e.detail }).then(function (userinfo) {
      console.log(userinfo)
      self.setData({
        userinfo: userinfo,
        userinfoMd: self.geneUserInfoMd(userinfo)
      })
      wx.login({
        success(res) {
          const code = res.code;
          wx.setStorageSync("code", code)
        }
      })
    }).catch(function (err) {
      self.showDialog("操作失败", err.message)
    })
  },

  getPhone: function (e) {
    const code = wx.getStorageSync("code")
    authing.getPhone({ code, detail: e.detail }).then(phone => {
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

  logout: function () {
    if (!this.data.userinfo) {
      this.showDialog("退出登录失败", "请先登录")
      return
    }
    const userId = this.data.userinfo._id;
    authing.logout(userId).then(res => {
      this.setData({
        userinfo: null,
        userinfoMd: dontLoginMd
      })
      wx.showToast({
        title: '退出登录成功',
      })
    })
  },
});