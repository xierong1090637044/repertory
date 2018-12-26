//index.js
//获取应用实例
const app = getApp()
const Bmob = require('../../utils/bmob.js')
Page({
  data: {
    remind: '加载中',
    angle: 0,
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  linkToIndex:function(){
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  onReady:function(){
    var that = this;
    setTimeout(function () {
      that.setData({
        remind: ''
      });
    }, 1000);
    wx.onAccelerometerChange(function (res) {
      var angle = -(res.x * 30).toFixed(1);
      if (angle > 14) { angle = 14; }
      else if (angle < -14) { angle = -14; }
      if (that.data.angle !== angle) {
        that.setData({
          angle: angle
        });
      }
    });
  },
  onLoad: function () {
    var that = this
    var value = wx.getStorageSync('openid')
    if (value) {
      that.setData({
        userInfo: { avatarUrl: wx.getStorageSync('avatarUrl')},
        hasUserInfo: true
      })
    }
  },
  getUserInfo: function(e) {
    var that = this
    if (e.detail.errMsg == 'getUserInfo:fail auth deny'){
      wx.showToast({
        title: '您取消了授权',
        icon:'none'
      })
    }else{
      try {
        var value = wx.getStorageSync('openid')
        if (value) {
          console.log("已登录")
          wx.showToast({
            title: '已登录',
            icon: 'none'
          })
          that.setData({
            hasUserInfo: true
          })
        } else {
          wx.login({
            success: function (res) {
              if (res.code) {
                Bmob.User.requestOpenId(res.code, {
                  success: function (userData) {
                    wx.getUserInfo({
                      success: function (result) {
                        var userInfo = result.userInfo
                        var nickName = userInfo.nickName
                        var avatarUrl = userInfo.avatarUrl
                        var sex = userInfo.gender
                        Bmob.User.logIn(nickName, userData.openid, {
                          success: function (user) {
                            try {
                              console.log("登录成功");
                              wx.showToast({
                                title: '授权成功',
                                icon: 'none'
                              })
                              that.setData({
                                userInfo: user,
                                hasUserInfo:true
                              })
                              wx.setStorageSync('openid', user.get('userData').openid)
                              wx.setStorageSync('userid', user.id)
                              wx.setStorageSync('nickName', user.get("nickName"))
                              wx.setStorageSync('username', user.get("username"))
                              wx.setStorageSync('sex', user.get("sex"))
                              wx.setStorageSync('avatarUrl', user.get("avatarUrl"))
                              wx.setStorageSync('country', userInfo.country)
                              wx.setStorageSync('province', userInfo.province)
                              wx.setStorageSync('city', userInfo.city)
                            } catch (e) {
                              console.log("登录失败")
                              wx.showToast({
                                title: '授权失败',
                                icon: 'none'
                              })
                            }
                          },
                          error: function (user, error) {
                            if (error.code == '101') {
                              var User = Bmob.Object.extend("_User");
                              var query = new Bmob.Query(User);
                              query.equalTo("openid", userData.openid);
                              query.first({
                                success: function (object) {
                                  if (object == null){
                                    var user = new Bmob.User();//开始注册用户
                                    user.set('username', nickName);
                                    user.set('password', userData.openid);
                                    user.set('openid', userData.openid);
                                    user.set("nickName", nickName);
                                    user.set("avatarUrl", avatarUrl);
                                    user.set("userData", userData);
                                    user.set('sex', sex);
                                    user.signUp(null, {
                                      success: function (result) {
                                        try {//将返回的3rd_session存储到缓存中
                                          console.log('注册成功');
                                          wx.showToast({
                                            title: '授权成功',
                                            icon: 'none'
                                          })
                                          that.setData({
                                            userInfo: user,
                                            hasUserInfo: true
                                          })
                                          wx.setStorageSync('openid', user.get('userData').openid)
                                          wx.setStorageSync('userid', user.id)
                                          wx.setStorageSync('nickName', user.get("nickName"))
                                          wx.setStorageSync('username', user.get("username"))
                                          wx.setStorageSync('sex', user.get("sex"))
                                          wx.setStorageSync('avatarUrl', user.get("avatarUrl"))
                                          wx.setStorageSync('country', userInfo.country)
                                          wx.setStorageSync('province', userInfo.province)
                                          wx.setStorageSync('city', userInfo.city)
                                        } catch (e) {
                                          console.log("注册失败")
                                          wx.showToast({
                                            title: '授权失败',
                                            icon: 'none'
                                          })
                                        }
                                      },
                                      error: function (userData, error) {
                                        if(error.code == '202'){
                                          wx.getUserInfo({
                                            success: res => {
                                              console.log("已登录")
                                              wx.showToast({
                                                title: '已登录',
                                                icon: 'none'
                                              })
                                              var query = new Bmob.Query(Bmob.User);
                                              console.log(userData)
                                              query.equalTo('password', userData.get('userData').openid);
                                              query.find({
                                                success: function (user) {
                                                  console.log(user)
                                                }
                                              });
                                              wx.setStorageSync('openid', userData.get('userData').openid)
                                              wx.setStorageSync('userid', userData.id)
                                              wx.setStorageSync('nickName', userData.get("nickName"))
                                              wx.setStorageSync('username', userData.get("username"))
                                              wx.setStorageSync('sex', userData.get("sex"))
                                              wx.setStorageSync('avatarUrl', userData.get("avatarUrl"))
                                              wx.setStorageSync('country', res.userInfo.country)
                                              wx.setStorageSync('province', res.userInfo.province)
                                              wx.setStorageSync('city', res.userInfo.city)
                                              that.setData({
                                                userInfo: res.userInfo,
                                                hasUserInfo: true
                                              })
                                            }
                                          })
                                        }

                                      }
                                    });
                                  }else{
                                    var user = Bmob.User.logIn(object.get("username"),userData.openid, {
                                      success: function (user) {
                                        user.set("username", nickName);
                                        user.set("nickName", nickName);
                                        user.save(null, {
                                          success: function (user) {
                                            var query = new Bmob.Query(Bmob.User);
                                            query.get(user.objectId, {
                                              success: function (userAgain) {
                                                userAgain.set("username", nickName);
                                                userAgain.save(null, {
                                                  error: function (userAgain, error) {
                                                    that.setData({
                                                      userInfo: user,
                                                      hasUserInfo: true
                                                    })
                                                    wx.setStorageSync('openid', user.get('userData').openid)
                                                    wx.setStorageSync('userid', user.id)
                                                    wx.setStorageSync('nickName', user.get("nickName"))
                                                    wx.setStorageSync('username', user.get("username"))
                                                    wx.setStorageSync('sex', user.get("sex"))
                                                    wx.setStorageSync('avatarUrl', user.get("avatarUrl"))
                                                    wx.setStorageSync('country', userInfo.country)
                                                    wx.setStorageSync('province', userInfo.province)
                                                    wx.setStorageSync('city', userInfo.city)
                                                  }
                                                });
                                              }
                                            });
                                          }
                                        });
                                      }
                                    });
                                  }
                                },
                                error: function (error) {
                                  console.log("查询失败: " + error.code + " " + error.message);
                                }
                              });
                            }
                          }
                        });
                      }
                    })
                  },
                  error: function (error) {
                    console.log("Error: " + error.code + " " + error.message);
                  }
                });
              } else {
                console.log('获取用户登录态失败！' + res.errMsg)
              }
            }
          });
        }
      } catch (e) {
        console.log("登录失败")
      }
    }
  }
})
