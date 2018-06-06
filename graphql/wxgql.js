var GraphQL = function(obj) {

  if (!obj.url) {
    throw "请提供GraphQL请求URL(.url)"
  }

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
      header: _obj.header,
      complete: _obj.complete
    })
  }
}

module.exports = {
  GraphQL: GraphQL
}