App({
  onLaunch: function() {
    console.log('App Launch')

    // 最佳实践，初次 launch 的时候获取 code 并保存到 localStorage 中
    wx.checkSession({
      success(res) {
        console.log(res)
      },
      fail() {
        wx.login({
          success(res) {
            const code = res.code;
            wx.setStorageSync("code", code)
          }
        })
      }
    })
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  },
  globalData: {
    hasLogin: false
  }
});