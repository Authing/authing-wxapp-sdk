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
  if(res.statusCode == 200 && retData.code == 200) {
    resolve(res.data.data || res.data);                
  }else {
    reject(res.data.data || res.data);
  }
}

var Authing = function(opts) {
  var self = this;
  if(!opts.clientId) {
    throw 'clientId is not provided';
  }

  if(!opts.secret) {
    throw 'app secret is not provided';
  }

  if(opts.host) {
    configs.services.user.host = opts.host.user || configs.services.user.host;
    configs.services.oauth.host = opts.host.oauth || configs.services.oauth.host;
  }

  this.opts = opts;

  this.ownerAuth = {
    authed: false,
    authSuccess: false,
    token: null
  }
  this.userAuth = {
    authed: false,
    authSuccess: false,
    token: null
  }

  this.initUserClient();
  this.initOwnerClient();
  this.initOAuthClient();

  return this._auth().then(function(token) {
    if(token) {
      self.initOwnerClient(token);
      self._loginFromLocalStorage();
    }else {
      self.ownerAuth.authed = true;
      self.ownerAuth.authSuccess = false;
      throw 'auth failed, please check your secret and client ID.';
    }
    return self;
  }).catch(function(error) {
    self.ownerAuth.authed = true;
    self.ownerAuth.authSuccess = false;
    throw 'auth failed: ' + error.message;
  });
}

Authing.prototype = {

  constructor: Authing,

  _initClient: function(token) {
    if(token) {
      return new GraphQL({
        url: configs.services.user.host,
        header: {
          authorization: 'Bearer ' + token,
        }
      }, true);
    }else {
      return new GraphQL({
        url: configs.services.user.host
      }, true); 
    }
  },

  initUserClient: function(token) {
    if(token) {
      this.userAuth = {
        authed: true,
        authSuccess: true,
        token: token
      };
      if(configs.inBrowser) {
        wx.setStorageSync('_authing_token', token);
      }
    }
    this.UserClient = this._initClient(token);
  },

  initOwnerClient: function(token) {
    if(token) {
      this.ownerAuth = {
        authed: true,
        authSuccess: true,
        token: token
      };
    }
    this.ownerClient = this._initClient(token);
  },

  initOAuthClient: function() {
    this.OAuthClient = new GraphQL({
      url: configs.services.oauth.host
    }, true);    
  },

  _auth: function() {

    if(!this._AuthService) {
      this._AuthService = new GraphQL({
        url: configs.services.user.host
      }, true);
    }

    let options = {
      secret: this.opts.secret,
      clientId: this.opts.clientId,
    }

    var self = this;

    return this._AuthService.query({
      query: `
        query {
          getAccessTokenByAppSecret(secret: "${options.secret}", clientId:  "${options.clientId}")
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
    if(configs.inBrowser) {
      var _authing_token = wx.getStorageSync('_authing_token');
      if(_authing_token) {
        self.initUserClient(_authing_token);
      }
    }
  },

  checkLoginStatus: function(token) {
    var self = this;
    return this.UserClient.query({
      query: `
        query checkLoginStatus($token: String) {
        	checkLoginStatus(token: $token) {
        		status
        		code
	          message
        	}
        }
      `,
      variables: {
        token: token
      }
    }).then(function(res) {
      return res.data.checkLoginStatus;
    }).catch(function(error) {
      throw error;
    });
  },

  _readOAuthList: function() {

    var self = this;

    this.haveAccess();

    if(!this._OAuthService) {
      self._OAuthService = new GraphQL({
        url: configs.services.oauth.host,
        header: {
          authorization: 'Bearer ' + self.ownerAuth.token,
        }
      }, true);      
    }

    var self = this;

    return this._OAuthService.query({
      query: `
        query getOAuthList($clientId: String!) {
          ReadOauthList(clientId: $clientId) {
              _id
              name
              image
              description
              enabled
              client
              user
              url
          }
        }
      `,
      variables: {
        clientId: self.opts.clientId        
      }
    })
    .then(function(res) {
      return res.data.ReadOauthList;
    }).catch(function(error) {
      throw error;
    });
  },

  haveAccess: function() {
    if(!this.ownerAuth.authSuccess) {
      throw 'have no access, please check your secret and client ID.';
    }
  },

  _chooseClient: function() {
    if(this.userAuth.authSuccess) {
      return this.UserClient;
    }
    return this.ownerClient;
  },

  _login: function(options) {

    if(!options) {
      throw 'options is not provided.';
    }

    options['registerInClient'] = this.opts.clientId;

    if(options.password) {
      options.password = _encryption(options.password);
    }

    this.haveAccess();

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
      return res.data.login;
    });

  },

  login: function(options) {
    let self = this;
    return this._login(options).then(function(user) {
      if(user) {
        self.initUserClient(user.token);        
      }
      return user;
    }).catch(function(error) {
      throw error;
    });
  },

  register: function(options) {

    this.haveAccess();

    if(!options) {
      throw 'options is not provided';
    }

    options.registerInClient = this.opts.clientId;

    if(options.password) {
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

    this.haveAccess();

    if(!_id) {
      throw '_id is not provided';
    }

    var self = this;

    this.userAuth = {
      authed: false,
      authSuccess: false,
      token: null
    };
    if(configs.inBrowser) {
      localStorage.removeItem('_authing_token');
    }

    return this.update({
      _id: _id,
      tokenExpiredAt: 0
    }).catch(function(error) {
      throw error;
    });

  },

  user: function(options) {
    this.haveAccess();
    if(!options) {
      throw 'options is not provided';
    }
    if(!options.id) {
      throw 'id in options is not provided';
    }
    options.registerInClient = this.opts.clientId;
    
    var client = this._chooseClient();
    
    return client.query({
      query: `query user($id: String!, $registerInClient: String!){
        user(id: $id, registerInClient: $registerInClient) {
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
      return res.data.user;
    }).catch(function(error) {
      throw error;
    });
  },

  list: function(page, count) {

    this.haveAccess();

    page = page || 1;
    count = count || 10;

    var options = {
      registerInClient: this.opts.clientId,
      page: page,
      count: count
    }

    return this.ownerClient.query({
      query: `query users($registerInClient: String, $page: Int, $count: Int){
          users(registerInClient: $registerInClient, page: $page, count: $count) {
            totalCount
            list {
              _id
              email
              emailVerified
              username
              nickname
              company
              photo
              browser
              password
              registerInClient
              token
              tokenExpiredAt
              loginsCount
              lastLogin
              lastIP
              signedUp
              blocked
              isDeleted
              group {
                _id
                name
                descriptions
                createdAt
              }
              clientType {
                _id
                name
                description
                image
                example
              }
              userLocation {
                _id
                when
                where
              }
              userLoginHistory {
                totalCount
                list{
                  _id
                  when
                  success
                  ip
                  result
                }
              }
              systemApplicationType {
                _id
                name
                descriptions
                price
              }
            }
          }
        }
      `,
      variables: options
    }).then(function(res) {
      return res.data.users;
    }).catch(function(error) {
      throw error;
    });
  },

  remove: function(_id, operator) {

    var self = this;

    this.haveAccess();

    if(!_id) {
      throw '_id is not provided';
    }

    return this.ownerClient.mutate({
      mutation: `
        mutation removeUsers($ids: [String], $registerInClient: String, $operator: String){
          removeUsers(ids: $ids, registerInClient: $registerInClient, operator: $operator) {
            _id
          }
        }
      `,
      variables: {
        ids: [_id],
        registerInClient: self.opts.clientId,
        operator
      }
    }).then(function(res) {
      return res.data.removeUsers;
    }).catch(function(error) {
      throw error;
    }); 

  },

  _uploadAvatar: function(options) {
    var client = this._chooseClient();
    return client.query({
      query: `query qiNiuUploadToken {
        qiNiuUploadToken
      }`
    }).then(function(data) {
      return data.data.qiNiuUploadToken;
    }).then(function(token) {
      if(!token) {
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
    }).then(function(data){
      return data.json();
    }).then(function(data) {
      if(data.key) {
        options.photo = 'https://usercontents.authing.cn/' + data.key
      }
      return options;
    }).catch(function(e) {
      if(e.graphQLErrors) {
        throw e;
      }
      throw {
        graphQLErrors:[{
          message: {
            message: e
          }
        }]
      };
    })
  },

  update: function(options) {

    var self = this;

    this.haveAccess();

    if(!options) {
      throw 'options is not provided';
    }

    if(!options._id) {
      throw '_id in options is not provided';
    }

    if(options.password) {
      if(!options.oldPassword) {
        throw 'oldPasswordin options is not provided'
      }
      options.password = _encryption(options.password);
      options.oldPassword = _encryption(options.oldPassword);
    }

    options['registerInClient'] = self.opts.clientId;

    var 
      keyTypeList = {
        _id: 'String!',
        email: 'String',
        emailVerified: 'Boolean',
        username: 'String',
        nickname: 'String',
        company: 'String',
        photo: 'String',
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
      for(var key in options) {
        if(keyTypeList[key]) {
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

    var client = this._chooseClient();

    if(options.photo) {
      var photo = options.photo;
      if(typeof photo !== 'string') {
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
    }).then(function(res) {
      return res.data.updateUser;
    }).catch(function(error) {
      throw error;
    }); 
  },

  readOAuthList: function() {
    var self = this;
    return this._readOAuthList()
    .then(function(list) {
      if(list) {
        return list.filter(function(item) {
          return item.enabled;
        });
      }else {
        throw {
          message: '获取OAuth列表失败，原因未知'
        }
      }
    });
  },
  
  sendResetPasswordEmail: function(options) {
    if(!options) {
      throw 'options is not provided';
    }
    if(!options.email) {
      throw 'email in options is not provided';
    }
  
    options.client = this.opts.clientId;
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
    
    if(!options) {
      throw 'options is not provided';
    }
    if(!options.email) {
      throw 'email in options is not provided';
    }
    if(!options.verifyCode) {
      throw 'verifyCode in options is not provided';
    }
    options.client = this.opts.clientId;
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
    if(!options) {
      throw 'options is not provided';
    }
    if(!options.email) {
      throw 'email in options is not provided';
    }
    if(!options.password) {
      throw 'password in options is not provided';
    }
    if(!options.verifyCode) {
      throw 'verifyCode in options is not provided';
    }
    options.client = this.opts.clientId;
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
    if(!options.email) {
      throw 'email in options is not provided';
    }

    options.client = this.opts.clientId;

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

  grantWxapp: function(code) {
    var self = this;
    return new Promise(function(resolve, reject) {
      wx.request({
        url: `https://oauth.authing.cn/oauth/wxapp/grant/${self.opts.clientId}?alias=wxapp&code=${code}`,
        method: 'get',
        // header: obj.header || mutateObj.header,
        complete: function(res) {
          errorHandler(resolve, reject, res);
        }            
      });
    });
  }  
}

module.exports = Authing
