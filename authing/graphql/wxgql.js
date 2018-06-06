var GraphQL = function(obj, retObj) {

  if (!obj.url) {
    throw "请提供GraphQL请求URL(.url)"
  }

  retObj = retObj || false;

  if(retObj) {
    return {
      query: function(queryObj) {
        return new Promise(function(resolve, reject) {
          wx.request({
            url: obj.url,
            method: 'POST',
            data: JSON.stringify({
              query: queryObj.query,
              variables: queryObj.variables
            }),
            success: function(res) {
              resolve(res.data.data);
            },
            // fail: function(error) {
            //   reject(error);
            // },
            header: obj.header || queryObj.header,
            complete: function(res) {
              if(res.statusCode != 200) {
                // console.log(res.data.errors[0].message);
                reject(res.data.errors[0].message);
              }else {
                resolve(res.data.data);           
              }
            }
          });
        });
      },

      mutate: function(mutateObj) {
        return new Promise(function(resolve, reject) {
          wx.request({
            url: obj.url,
            method: 'POST',
            data: JSON.stringify({
              query: mutateObj.mutation,
              variables: mutateObj.variables
            }),
            success: function(res) {
              resolve(res)
            },
            fail: function(error) {
              reject(error)
            },            header: obj.header || mutateObj.header,
            complete: mutateObj.complete
          });          
        });      
      }
    }
  }else {
    return function (_obj) {

      if (!_obj.body) {
        throw "请提供GraphQL请求body"
      }

      return wx.request({
        url: obj.url,
        method: 'POST',
        data: JSON.stringify(_obj.body),
        success: _obj.success,
        fail: _obj.fail,
        header: obj.header || _obj.header,
        complete: _obj.complete
      });
    }
  }
}

module.exports = {
  GraphQL: GraphQL
}