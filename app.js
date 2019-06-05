//app.js
var config = require('utils/config.js')
var Bmob = require('utils/bmob.js');
var Bmob_new = require('utils/bmob_new.js');
Bmob.initialize(config.appId, config.apiKey,"47f76baf4ee4d90630d7b2bc17f7505c");
Bmob_new.initialize(config.appId, config.apiKey,"47f76baf4ee4d90630d7b2bc17f7505c");
App({
  version: 'v1.1.9', //版本号
  onLaunch: function () {
    var that = this;
    //判断是否用于已登录
    var value = wx.getStorageSync('openid')
    if (!value) {
      wx.redirectTo({
        url: '/pages/authorize/authorize',
      })
    }else{
      wx.redirectTo({
        url: '/pages/index/index',
      })
    }
    //调用系统API获取设备的信息
    wx.getSystemInfo({
      success: function (res) {
        //console.log(res)
        var kScreenW = res.windowWidth / 375
        var kScreenH = res.windowHeight / 603
        wx.setStorageSync('kScreenW', kScreenW)
        wx.setStorageSync('kScreenH', kScreenH)
        wx.setStorageSync('language', res.language)
      }
    })

    //管理小程序更新
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
            })
          })
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  globalData: {
    userInfo: null
  }
})