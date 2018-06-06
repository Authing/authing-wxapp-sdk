var GraphQL = function(obj, retObj) {

  if (!obj.url) {
    throw "请提供GraphQL请求URL(.url)"
  }

  retObj = retObj || false;

  if(retObj) {
    return {
      query: function(queryObj) {
        return wx.request({
          url: obj.url,
          method: 'POST',
          data: JSON.stringify({
            query: queryObj.query,
            variables: queryObj.variables
          }),
          success: queryObj.success,
          fail: queryObj.fail,
          header: obj.header || queryObj.header,
          complete: queryObj.complete
        });
      },

      mutate: function(mutateObj) {
        return wx.request({
          url: obj.url,
          method: 'POST',
          data: JSON.stringify({
            mutation: mutateObj.mutate,
            variables: mutateObj.variables
          }),
          success: mutateObj.success,
          fail: mutateObj.fail,
          header: obj.header || mutateObj.header,
          complete: mutateObj.complete
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