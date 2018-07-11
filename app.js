//app.js

var api = require('/common/api.js');

App({
  
  onLaunch: function () {

    // 没有accessToken再发起登录
    if (!this.globalData.accessToken) {
      this.login();
    }

    // 获取用户授权信息
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userInfo']) {
          // 如果已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              // console.log(res.userInfo)

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }

        if (!res.authSetting['scope.userLocation']) {
          wx.getLocation({
            success: res => {
              console.log("获取用户地理位置授权成功")
            }
          })
        }

        // console.log(res)
      }
    })
  },

  login: function() {
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        // console.log(res);
        wx.request({
          url: api.loginApi,
          data: {
            code: res.code
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            let respData = res.data;
            // console.log(respData)
            if (api.apiSuccess(respData) == true) {
              getApp().globalData.accessToken = respData.data.accessToken
              console.log('登录成功')
            }
          }
        })
      }
    })
  },

  globalData: {
    userInfo: null,
    accessToken: null,
  },

})