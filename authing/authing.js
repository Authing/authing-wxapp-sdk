var gql = require('./graphql/wxgql.js');
var GraphQL = gql.GraphQL;
var configs = require('./configs.js');
var RSA = require('./utils/wxapp_rsa.js');

var _encryption = function(paw) {
  var encrypt_rsa = new RSA.RSAKey();
  encrypt_rsa = RSA.KEYUTIL.getKey(configs.openSSLSecret);
  var encStr = encrypt_rsa.encrypt(paw);
  encStr = RSA.hex2b64(encStr);
  return encStr.toString();
};

var errorHandler = function(resolve, reject, res) {
  var retData = res.data ? res.data : {
    code: 200
  };
  console.log(res.statusCode == 200 && retData.code == 200);
  if (res.statusCode == 200 && retData.code == 200) {
    resolve(res.data.data || res.data);
  } else {
    reject(res.data.data || res.data);
  }
}

var Authing = function(opts) {

  if (!opts.pureUsing) {

    if (!opts.clientId && !opts.userPoolId) {
      throw 'clientId/userPoolId is not provided';
    }
  }

  if (opts.host) {
    configs.services.user.host = opts.host.user || configs.services.user.host;
    configs.services.oauth.host = opts.host.oauth || configs.services.oauth.host;
  }

  this.opts = opts;
  this.userPoolId = opts.userPoolId || opts.clientId

  this.userAuth = {
    authed: false,
    authSuccess: false,
    token: null
  }

  this.initUserClient();
  this.initOAuthClient();

  if (opts.pureUsing) {
    self.ownerAuth.authed = true;
    self.ownerAuth.authSuccess = false;
  }

  return this;

}

Authing.prototype = {

  constructor: Authing,

  _initClient: function(token) {
    if (token) {
      return new GraphQL({
        url: configs.services.user.host,
        header: {
          authorization: 'Bearer ' + token,
        }
      }, true);
    } else {
      return new GraphQL({
        url: configs.services.user.host
      }, true);
    }
  },

  initUserClient: function(token) {
    if (token) {
      this.userAuth = {
        authed: true,
        authSuccess: true,
        token: token
      };
      if (configs.inBrowser) {
        wx.setStorageSync('_authing_token', token);
      }
    }
    this.UserClient = this._initClient(token);
  },


  initOAuthClient: function() {
    this.OAuthClient = new GraphQL({
      url: configs.services.oauth.host
    }, true);
  },

  _auth: function() {

    if (!this._AuthService) {
      this._AuthService = new GraphQL({
        url: configs.services.user.host
      }, true);
    }

    let options = {
      secret: this.opts.secret,
      userPoolId: this.userPoolId,
    }

    var self = this;

    return this._AuthService.query({
        query: `
        query {
          getAccessTokenByAppSecret(secret: "${options.secret}", clientId:  "${options.userPoolId}")
        }
      `,
      })
      .then(function(data) {
        self._AuthService = new GraphQL({
          url: configs.services.user.host,
          header: {
            authorization: 'Bearer ' + data.getAccessTokenByAppSecret,
          }
        }, true);

        return data.data.getAccessTokenByAppSecret;
      });
  },

  _loginFromLocalStorage: function() {
    var self = this;
    if (configs.inBrowser) {
      var _authing_token = wx.getStorageSync('_authing_token');
      if (_authing_token) {
        self.initUserClient(_authing_token);
      }
    }
  },

  checkLoginStatus: function() {
    var self = this;
    if (!self.userAuth.authSuccess) {
      return Promise.resolve({
        code: 2020,
        status: false,
        message: '未登录'
      });
    }
    return this.UserClient.query({
      query: `query checkLoginStatus {
        checkLoginStatus {
          status
          code
          message
        }
      }`
    }).then(function(res) {
      return res.data.checkLoginStatus;
    }).catch(function(error) {
      throw error;
    });
  },

  _login: function(options) {
    const self = this;
    if (!options) {
      throw 'options is not provided.';
    }

    options['registerInClient'] = this.userPoolId;

    if (options.password) {
      options.password = _encryption(options.password);
    }

    return this.UserClient.mutate({
      mutation: `
        mutation login($unionid: String, $email: String, $password: String, $lastIP: String, $registerInClient: String!, $verifyCode: String) {
            login(unionid: $unionid, email: $email, password: $password, lastIP: $lastIP, registerInClient: $registerInClient, verifyCode: $verifyCode) {
              _id
              email
              emailVerified
              username
              nickname
              company
              photo
              browser
              token
              tokenExpiredAt
              loginsCount
              lastLogin
              lastIP
              signedUp
              blocked
              isDeleted
            }
        }
      `,
      variables: options
    }).then(function(res) {
      self.initUserClient(res.data.login.token)
      return res.data.login;
    });
  },

  login: function(options) {
    let self = this;
    return this._login(options).then(function(user) {
      if (user) {
        self.initUserClient(user.token);
      }
      return user;
    }).catch(function(error) {
      throw error;
    });
  },

  register: function(options) {
    const self = this;
    if (!options) {
      throw 'options is not provided';
    }

    options.registerInClient = this.userPoolId;

    if (options.password) {
      options.password = _encryption(options.password);
    }

    return this.UserClient.mutate({
        mutation: `
        mutation register(
          $unionid: String,
            $email: String, 
            $password: String, 
            $lastIP: String, 
            $forceLogin: Boolean,
            $registerInClient: String!,
            $oauth: String,
            $username: String,
            $nickname: String,
            $registerMethod: String,
            $photo: String
        ) {
            register(userInfo: {
              unionid: $unionid,
                email: $email,
                password: $password,
                lastIP: $lastIP,
                forceLogin: $forceLogin,
                registerInClient: $registerInClient,
                oauth: $oauth,
                registerMethod: $registerMethod,
                photo: $photo,
                username: $username,
                nickname: $nickname
            }) {
                _id,
                email,
                emailVerified,
                username,
                nickname,
                company,
                photo,
                browser,
                password,
                token,
                group {
                    name
                },
                blocked
            }
        }
      `,
        variables: options
      })
      .then(function(res) {
        return res.data.register;
      }).catch(function(error) {
        throw error;
      });
  },

  logout: function(_id) {

    if (!_id) {
      throw '_id is not provided';
    }

    var self = this;

    this.userAuth = {
      authed: false,
      authSuccess: false,
      token: null
    };
    if (configs.inBrowser) {
      wx.removeStorageSync("_authing_token")
    }

    return this.update({
      _id: _id,
      tokenExpiredAt: '0'
    }).catch(function(error) {
      throw error;
    });

  },

  user: function(options) {
    if (!options) {
      throw 'options is not provided';
    }
    if (!options.id) {
      throw 'id in options is not provided';
    }
    options.registerInClient = this.userPoolId;

    return this.UserClient.query({
      query: `query user($id: String!, $registerInClient: String!){
        user(id: $id, registerInClient: $registerInClient) {
          _id
          email
          emailVerified
          username
          nickname
          company
          photo
          phone
          browser
          registerInClient
          registerMethod
          oauth
          token
          tokenExpiredAt
          loginsCount
          lastLogin
          lastIP
          signedUp
          blocked
          isDeleted
        }
        
      }
      `,
      variables: options
    }).then(function(res) {
      return res.data.user;
    }).catch(function(error) {
      throw error;
    });
  },

  _uploadAvatar: function(options) {
    return this.UserClient.query({
      query: `query qiNiuUploadToken {
        qiNiuUploadToken
      }`
    }).then(function(data) {
      return data.data.qiNiuUploadToken;
    }).then(function(token) {
      if (!token) {
        throw {
          graphQLErrors: [{
            message: {
              message: '获取文件上传token失败'
            }
          }]
        }
      }

      var formData = new FormData();
      formData.append('file', options.photo);
      formData.append('token', token);
      return fetch('https://upload.qiniup.com/" enctype="multipart/form-data', {
        method: 'post',
        body: formData
      });
    }).then(function(data) {
      return data.json();
    }).then(function(data) {
      if (data.key) {
        options.photo = 'https://usercontents.authing.cn/' + data.key
      }
      return options;
    }).catch(function(e) {
      if (e.graphQLErrors) {
        throw e;
      }
      throw {
        graphQLErrors: [{
          message: {
            message: e
          }
        }]
      };
    })
  },

  update: function(options) {

    var self = this;

    if (!options) {
      throw 'options is not provided';
    }

    if (!options._id) {
      throw '_id in options is not provided';
    }

    if (options.password) {
      if (!options.oldPassword) {
        throw 'oldPasswordin options is not provided'
      }
      options.password = _encryption(options.password);
      options.oldPassword = _encryption(options.oldPassword);
    }

    options['registerInClient'] = self.userPoolId;

    var
      keyTypeList = {
        _id: 'String!',
        email: 'String',
        emailVerified: 'Boolean',
        username: 'String',
        nickname: 'String',
        company: 'String',
        photo: 'String',
        phone: 'String',
        browser: 'String',
        password: 'String',
        oldPassword: 'String',
        registerInClient: 'String!',
        token: 'String',
        tokenExpiredAt: 'String',
        loginsCount: 'Int',
        lastLogin: 'String',
        lastIP: 'String',
        signedUp: 'String',
        blocked: 'Boolean',
        isDeleted: 'Boolean'
      },
      returnFields = `_id
        email
        emailVerified
        username
        nickname
        company
        photo
        phone
        browser
        registerInClient
        registerMethod
        oauth
        token
        tokenExpiredAt
        loginsCount
        lastLogin
        lastIP
        signedUp
        blocked
        isDeleted`;

    function generateArgs(options) {
      var _args = [],
        _argsFiller = [],
        _argsString = '';
      for (var key in options) {
        if (keyTypeList[key]) {
          _args.push('$' + key + ': ' + keyTypeList[key]);
          _argsFiller.push(key + ': $' + key);
        }
      }
      _argsString = _args.join(', ');
      return {
        _args: _args,
        _argsString: _argsString,
        _argsFiller: _argsFiller
      }
    }

    if (options.photo) {
      var photo = options.photo;
      if (typeof photo !== 'string') {
        return this._uploadAvatar(options).then(function(options) {
          var _arg = generateArgs(options);
          return client.mutate({
            mutation: `
              mutation UpdateUser(${_arg._argsString}){
                updateUser(options: {
                  ${_arg._argsFiller.join(', ')}
                }) {
                ${returnFields}
                }
              }
            `,
            variables: options
          })
        }).then(function(res) {
          return res.data.updateUser;
        }).catch(function(error) {
          throw error;
        });
      }
    }
    var _arg = generateArgs(options);
    return this.UserClient.mutate({
      mutation: `
        mutation UpdateUser(${_arg._argsString}){
          updateUser(options: {
            ${_arg._argsFiller.join(', ')}
          }) {
            ${returnFields}
          }
        }
      `,
      variables: options
    }).then(function(res) {
      return res.data.updateUser;
    }).catch(function(error) {
      throw error;
    });
  },

  sendResetPasswordEmail: function(options) {
    if (!options) {
      throw 'options is not provided';
    }
    if (!options.email) {
      throw 'email in options is not provided';
    }

    options.client = this.userPoolId;
    return this.UserClient.mutate({
      mutation: `
        mutation sendResetPasswordEmail(
          $email: String!,
          $client: String!
        ){
          sendResetPasswordEmail(
            email: $email,
            client: $client
          ) {
              message
              code
          }
        }
      `,
      variables: options
    }).then(function(res) {
      return res.data.sendResetPasswordEmail;
    }).catch(function(error) {
      throw error;
    });

  },

  verifyResetPasswordVerifyCode: function(options) {

    if (!options) {
      throw 'options is not provided';
    }
    if (!options.email) {
      throw 'email in options is not provided';
    }
    if (!options.verifyCode) {
      throw 'verifyCode in options is not provided';
    }
    options.client = this.userPoolId;
    return this.UserClient.mutate({
      mutation: `
        mutation verifyResetPasswordVerifyCode(
          $email: String!,
          $client: String!,
          $verifyCode: String!
        ) {
          verifyResetPasswordVerifyCode(
            email: $email,
            client: $client,
            verifyCode: $verifyCode
          ) {
              message
              code
          }
        }
      `,
      variables: options
    }).then(function(res) {
      return res.data.verifyResetPasswordVerifyCode;
    }).catch(function(error) {
      throw error;
    });

  },

  changePassword: function(options) {
    if (!options) {
      throw 'options is not provided';
    }
    if (!options.email) {
      throw 'email in options is not provided';
    }
    if (!options.client) {
      throw 'client in options is not provided';
    }
    if (!options.password) {
      throw 'password in options is not provided';
    }
    if (!options.verifyCode) {
      throw 'verifyCode in options is not provided';
    }
    options.client = this.userPoolId;
    options.password = _encryption(options.password)
    return this.UserClient.mutate({
      mutation: `
        mutation changePassword(
          $email: String!,
          $client: String!,
          $password: String!,
          $verifyCode: String!
        ){
          changePassword(
            email: $email,
            client: $client,
            password: $password,
            verifyCode: $verifyCode
          ) {
            _id
            email
            emailVerified
            username
            nickname
            company
            photo
            browser
            registerInClient
            registerMethod
            oauth
            token
            tokenExpiredAt
            loginsCount
            lastLogin
            lastIP
            signedUp
            blocked
            isDeleted
          }
        }
      `,
      variables: options
    }).then(function(res) {
      return res.data.changePassword;
    }).catch(function(error) {
      throw error;
    });
  },

  sendVerifyEmail: function(options) {
    if (!options.email) {
      throw 'email in options is not provided';
    }

    options.client = this.userPoolId;

    return this._AuthService.mutate({
      mutation: `
        mutation sendVerifyEmail(
          $email: String!,
          $client: String!
        ){
          sendVerifyEmail(
            email: $email,
            client: $client
          ) {
            message,
            code,
            status
          }
        }
      `,
      variables: options
    }).then(function(res) {
      return res.data.sendVerifyEmail;
    }).catch(function(error) {
      throw error;
    });
  },

  grantWxapp: function(code, random) {
    var self = this;
    return new Promise(function(resolve, reject) {
      wx.request({
        url: `https://oauth.authing.cn/oauth/wxapp/grant/?alias=wxapp&code=${code}&random=${random}&enableFetchPhone=true&useSelfWxapp=true`,
        //&useSelfWxapp=false
        method: 'get',
        // header: obj.header || mutateObj.header,
        complete: function(res) {
          errorHandler(resolve, reject, res);
        }
      });
    });
  },

  authWxapp: function(random, data) {
    var self = this;
    return new Promise(function(resolve, reject) {
      wx.request({
        url: `https://oauth.authing.cn/oauth/wxapp/redirect?random=${random}`,
        method: 'post',
        data: data,
        complete: function(res) {
          errorHandler(resolve, reject, res);
        }
      });
    });
  },

  getPhone: function(userPoolId, data) {
    var self = this;
    return new Promise(function(resolve, reject) {
      wx.request({
        url: `https://oauth.authing.cn/oauth/wxapp/phone/${self.userPoolId}?useSelfWxapp=true`,
        method: 'post',
        data: data,
        complete: function(res) {
          errorHandler(resolve, reject, res);
        }
      });
    });
  },

  getVerificationCode: function(phone) {
    if (!phone) {
      throw "phone is not provided";
    }

    const url = `${configs.services.user.host.replace(
      "/graphql",
      ""
    )}/send_smscode/${phone}/${this.userPoolId}`;
    console.log(url)
    return new Promise(function(resolve, reject) {
      wx.request({
        url: url,
        method: "GET",
        complete: function(res) {
          errorHandler(resolve, reject, res)
        }
      })
    })

  },

  loginByPhoneCode: function(options) {
    const self = this;
    if (!options) {
      throw Error("options is not provided.");
    }
    const variables = {
      registerInClient: this.userPoolId,
      phone: options.phone,
      phoneCode: parseInt(options.phoneCode, 10)
    };

    return this.UserClient.mutate({
      operationName: "login",
      mutation: `mutation login($phone: String, $phoneCode: Int, $registerInClient: String!, $browser: String) {
        login(phone: $phone, phoneCode: $phoneCode, registerInClient: $registerInClient, browser: $browser) {
          _id
          email
          unionid
          openid
          emailVerified
          username
          nickname
          phone
          company
          photo
          browser
          token
          tokenExpiredAt
          loginsCount
          lastLogin
          lastIP
          signedUp
          blocked
          isDeleted
        }
    }`,
      variables
    }).then(res => {
      // 登录成功记录 token
      if (res && res.data) {
        const token = res.data.login.token
        self.initUserClient(token)
        if (configs.inBrowser)
          wx.setStorageSync('_authing_token', token);
      }
      return res.data.login;
    }).catch(err => {
      throw err
    });
  },

  loginByLDAP: function(options) {
    if (!options) {
      throw Error("options is not provided.");
    }

    options.clientId = this.userPoolId;

    if (!options.password) {
      throw Error("options.password is not provided.");
    }

    if (!options.username) {
      throw Error("options.username is not provided.");
    }

    return this.OAuthClient.mutate({
      operationName: "LoginByLDAP",
      mutation: `mutation LoginByLDAP($username: String!, $password: String!, $clientId: String!, $browser: String) {
    LoginByLDAP(username: $username, clientId: $clientId, password: $password, browser: $browser) {
        _id
        email
        emailVerified
        unionid
        openid
        oauth
        registerMethod
        username
        nickname
        company
        photo
        browser
        token
        tokenExpiredAt
        loginsCount
        lastLogin
        lastIP
        signedUp
        blocked
      }
    }`,
      variables: options
    }).then(res => {
      // 登录成功记录 token
      if (res && res.data) {
        const token = res.data.LoginByLDAP.token
        self.initUserClient(token)
        if (configs.inBrowser)
          localStorage.setItem('_authing_token', oken)
      }
      return res.data.LoginByLDAP;
    });
  },

  unbindEmail: function(options) {
    if (!options.user) {
      throw Error("user is not provided.");
    }

    if (!options.client) {
      throw Error("options.client is not provided.");
    }

    return this.UserClient.query({
      operationName: "unbindEmail",
      query: `mutation unbindEmail(
      $user: String,
      $client: String,
    ){
      unbindEmail(
        user: $user,
        client: $client,
      ) {
        _id
        email
        emailVerified
        username
        nickname
        company
        photo
        browser
        registerInClient
        registerMethod
        oauth
        token
        tokenExpiredAt
        loginsCount
        lastLogin
        lastIP
        signedUp
        blocked
        isDeleted
      }
    }`,
      options
    }).then(res => {
      return res.data.unbindEmail
    }).catch(err => {
      throw err
    })
  },

  getAuthedAppList: function(options) {
    if (!options) {
      throw Error("options is not provided.");
    }

    if (!options.userId) {
      throw Error("options.userId is not provided.");
    }

    const variables = {
      clientId: this.userPoolId,
      userId: options.userId,
      page: options.page,
      count: options.count
    };

    return this.OAuthServiceGql.request({
      operationName: "GetUserAuthorizedApps",
      query: `
    query GetUserAuthorizedApps($clientId: String, $userId: String, $page: Int, $count: Int) {
      GetUserAuthorizedApps(clientId: $clientId, userId: $userId, page: $page, count: $count) {
          OAuthApps {
              _id
              name
              domain
              clientId
              description
              isDeleted
              grants
              redirectUris
              when
          }
          OIDCApps {
              _id
              name
              client_id
              domain
              description
              authorization_code_expire
              when
              isDeleted
              id_token_signed_response_alg
              response_types
              grant_types
              token_endpoint_auth_method
              redirect_uris
              image
              access_token_expire
              id_token_expire
              cas_expire
          }
          totalCount
      }
  }`,
      variables
    }).then(res => {
      return res.data.GetUserAuthorizedApps
    }).catch(err => {
      throw err
    })
  },

  revokeAuthedApp: function(options) {
    if (!options) {
      throw Error("options is not provided.");
    }

    if (!options.userId) {
      throw Error("options.userId is not provided.");
    }

    if (!options.appId) {
      throw Error("options.appId is not provided.");
    }

    const variables = {
      userPoolId: this.userPoolId,
      userId: options.userId,
      appId: options.appId
    };

    return this.UserClient.mutate({
      operationName: "RevokeUserAuthorizedApp",
      mutation: `
    mutation RevokeUserAuthorizedApp($userPoolId: String, $userId: String, $appId: String) {
      RevokeUserAuthorizedApp(userPoolId: $userPoolId, userId: $userId, appId: $appId) {
          isRevoked
          _id
          scope
          appId
          userId
          type
          when
      }
    }`,
      variables
    }).then(res => {
      return res.data.revokeAuthedApp
    }).catcah(err => {
      throw err
    })
  }
}

module.exports = Authing