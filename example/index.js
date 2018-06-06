var Authing = require('../authing/authing.js');

Page({
  test: function() {

    var auth = new Authing({
      clientId: '5b1757e682f4ce00014fdd3e',
      secret: '15ed89a727443f9cf66d0c2abbfee82b'
    });

    auth.then(function(validAuth) {

        //验证成功后返回新的authing-js-sdk实例(validAuth)，可以将此实例挂在全局

        validAuth.login({
            email: 'test@testmail.com',
            password: 'testpassword'
        }).then(function(user) {
            console.log(user);    
        }).catch(function(error) {
            conosle.log(error);    
        });

        // validAuth.login({
        //     email: 'test@testmail.com',
        //     password: 'testpassword'
        // }).then(function(user) {
        //     console.log(user);    
        // }).catch(function(error) {
        //     conosle.log(error);    
        // });

    }).catch(function(error) {
        //验证失败
        console.log(error);
    });

  }
});
