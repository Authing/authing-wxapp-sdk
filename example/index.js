var Authing = require('../authing/authing.js');

Page({
  test: function() {

    const email = Math.random().toString(36).substring(4) + "@test.com"
    const password = "123456!";
    const clientId = '5b1757e682f4ce00014fdd3e';

    let auth = new Authing({
      clientId: clientId,
    });

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