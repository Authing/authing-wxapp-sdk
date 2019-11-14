var Authing = require('../authing/authing.js');
const userPoolId = '5dca605aad9757834f1e6877';
const authing = new Authing({
  userPoolId: userPoolId
})

Page({

  data: {

    // Authing 用户池 ID
    userClientId: "",

    // bind form data
    emailRegisterFormData: {
      email: "1066983132@qq.com",
      password: "123456!"
    },
    emailLoginFormData: {
      email: "",
      password: ""
    },

    defaultAvatar: "https://usercontents.authing.cn/wxapp/default-avatar.png",
    userinfo: null,
    userinfoMd: `
\`\`\`
暂无，请先登录！
\`\`\`
    `,

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
  },

  geneUserInfoMd: function(userinfo) {
    return `
\`\`\`
${JSON.stringify(userinfo, null, 4)}
\`\`\`
`
  },

  formInputChange: function(e) {
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
    }
  },

  submitEmailRegisterForm: function(e) {
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

  submitEmailLoginForm: function(e) {
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

  showDialog: function(title, msg) {
    this.setData({
      showDialog: true,
      dialogTitle: title,
      dialogMsg: msg
    })
  },

  closeDialog: function() {
    this.setData({
      showDialog: false,
      dialogMsg: "",
      dialogTitle: ""
    })
  },

  onToggleClick: function(e) {
    const self = this;
    console.log(e)
    const id = e.currentTarget.id;
    const mo = id.replace('toggle-', '')
    const handlers = {
      "emailRegister": function() {
        self.setData({
          displayEmailRegister: self.data.displayEmailRegister === "none" ? "default" : "none"
        })
      },
      "emailLogin": function() {
        self.setData({
          displayEmailLogin: self.data.displayEmailLogin === "none" ? "default" : "none"
        })
      },
      "userinfo": function() {
        self.setData({
          displayUserinfo: self.data.displayUserinfo === "none" ? "default" : "none"
        })
      }
    }
    handlers[mo]()
  },

  test: function() {

    const phone = "17670416754"

    // 初始化
    let auth = new Authing({
      userPoolId: userPoolId,
      // clientId: userPoolId, // 旧版本依然可以使用 clientId，推荐使用 userPoolId
    });

    // 发送短信验证码
    auth.getVerificationCode(phone).then(result => {
      console.log(result)
    }).catch(err => {
      console.log(err)
    })

    auth.loginByPhoneCode({
      phone: phone,
      phoneCode: "5283"
    }).then(result => {
      console.log(result)
    }).catch(err => {
      console.log(err)
    })

    // 注册登录逻辑
    auth.register({
      email: email,
      password: password
    }).then(function(user) {
      console.log('注册成功!')
      console.log(user);

      auth.login({
        email: email,
        password: password
      }).then(function(user) {
        console.log('登录成功!');
        console.log(user);

        auth.update({
            _id: user._id,
            nickname: "用户名" + Math.random().toString(36).substring(6),
          })
          .then(function(user) {
            console.log('修改资料成功!');
            console.log(user);

          }).catch(function(error) {
            console.log('修改资料失败!');
            console.log(error);
          });

      }).catch(function(error) {
        console.log('注册失败!')
        console.log(error);
      });
    }).catch(function(error) {
      console.log('登录失败!')
      console.log(error);
    });


  }
});