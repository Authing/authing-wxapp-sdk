var gql = require('../graphql/wxgql.js');
var GraphQL = gql.GraphQL;

Page({
  test: function() {

    let gql = GraphQL({
      url: 'https://users.authing.cn/graphql'
    });

    gql({
      body: {
        query: `query getAccessTokenByAppSecret($secret: String!, $clientId: String!){
    getAccessTokenByAppSecret(secret: $secret, clientId: $clientId)
}`,
        variables: {
          secret: '427e24d3b7e289ae9469ab6724dc7ff0',
          clientId: '5a9fa26cf8635a000185528c'
        }
      },
      success: function (res) {
        console.log(res);
      }      
    });

  }
});
