var Authing = require('../authing/authing.js');

Page({
  test: function() {

    const email = Math.random().toString(36).substring(4) + "@test.com"
    const password = "123456!";
    const userPoolId = '5dca605aad9757834f1e6877';
    const phone = "17670416754"

    // 初始化
    let auth = new Authing({
      userPoolId: userPoolId,
      // clientId: userPoolId, // 旧版本依然可以使用 clientId，推荐使用 userPoolId
    });

    // 发送短信验证码
    // auth.getVerificationCode(phone).then(result => {
    //   console.log(result)
    // }).catch(err => {
    //   console.log(err)
    // })

    // auth.loginByPhoneCode({
    //   phone: phone,
    //   phoneCode: "5283"
    // }).then(result => {
    //   console.log(result)
    // }).catch(err => {
    //   console.log(err)
    // })



    // 注册登录逻辑
    // auth.register({
    //   email: email,
    //   password: password
    // }).then(function(user) {
    //   console.log('注册成功!')
    //   console.log(user);

    //   auth.login({
    //     email: email,
    //     password: password
    //   }).then(function(user) {
    //     console.log('登录成功!');
    //     console.log(user);

    //     auth.update({
    //         _id: user._id,
    //         nickname: "用户名" + Math.random().toString(36).substring(6),
    //       })
    //       .then(function(user) {
    //         console.log('修改资料成功!');
    //         console.log(user);

    //       }).catch(function(error) {
    //         console.log('修改资料失败!');
    //         console.log(error);
    //       });

    //   }).catch(function(error) {
    //     console.log('注册失败!')
    //     console.log(error);
    //   });
    // }).catch(function(error) {
    //   console.log('登录失败!')
    //   console.log(error);
    // });


  }
});