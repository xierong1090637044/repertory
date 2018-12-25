// pages/mine/propose/propose.js
var { $Message } = require('../../../component/base/index');
const Bmob = require('../../../utils/bmob.js')
var username = ''
var userid = '';
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    content: ''
  },
  handleTitleInputChange: function (e) {
    this.setData({
      title: e.detail.detail.value
    })
  },

  handleContentInputChange: function (e) {
    this.setData({
      content: e.detail.detail.value
    })
  },

  //上传图片
  uploadPic: function () {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '上传图片需要消耗流量，是否继续？',
      confirmText: '继续',
      success: function (res) {
        if (res.confirm) {
          wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['compressed'], //压缩图
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
              // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
              var tempFilePaths = res.tempFilePaths
              that.setData({
                isSrc: true,
                src: tempFilePaths
              })
            }
          })
        }
      }
    });
  },

  //删除图片
  clearPic: function () {//删除图片
    var that = this
    that.setData({
      isSrc: false,
      src: ""
    })
  },

  //提交表单
  handleSubmit: function (e) {
    var that = this;
    var formId = e.detail.formId
    var title = this.data.title;
    var content = this.data.content;
    //先进行表单非空验证
    if (title == "") {
      $Message({
        content: '请输入优化建议标题',
        type: 'warning',
        duration: 5
      });
    } else if (content == "") {
      $Message({
        content: '请输入优化建议内容',
        type: 'warning',
        duration: 5
      });
    } else {
      wx.showModal({
        title: '提示',
        content: '是否确认提交优化建议',
        success: function (res) {
          if (res.confirm) {
            wx.getStorage({
              key: 'userid',
              success: function (ress) {
                var Propose = Bmob.Object.extend("Propose");
                var propose = new Propose();
                var user = new Bmob.User();
                user.id = ress.data;
                propose.set("userId", user);
                propose.set("title", title);
                propose.set("content", content);
                propose.set("userInfo", that.data.info);
                if (that.data.isSrc == true) {
                  var name = that.data.src; //上传图片的别名
                  var file = new Bmob.File(name, that.data.src);
                  file.save();
                  propose.set("proposePic", file);
                }
                propose.save(null, {
                  success: function (result) {
                    console.log("提交成功");
                    //添加成功，返回成功之后的objectId(注意，返回的属性名字是id,而不是objectId)
                    wx.showToast({
                      title: '提交成功',
                      icon: 'success',
                      success: function () {
                        that.setData({
                          title: "",
                          content: "",
                          src: "",
                          isSrc: false,
                        })
                      }
                    })
                    //保存formId
                    var FormIds = Bmob.Object.extend("FormIds");
                    var formIds = new FormIds();
                    var user = new Bmob.User();
                    user.id = userid;
                    //判断formId是否已存在
                    var query = new Bmob.Query(FormIds);
                    query.equalTo("userId", user);
                    query.find({
                      success: function (results) {
                        if (results.length > 0) {
                          results[0].set("formId", formId);
                          results[0].set("deadline", that.getDay(7));
                          results[0].save(null, {
                            success: function (result) {
                              console.log("修改formId成功");
                            },
                            error: function (result, error) {
                              console.log("修改formId失败:" + error);
                            }
                          })
                        } else {
                          formIds.set("userId", user);
                          formIds.set("formId", formId);
                          formIds.set("deadline", that.getDay(7));
                          formIds.save(null, {
                            success: function (result) {
                              console.log("新增formId成功");
                            },
                            error: function (result, error) {
                              console.log("新增formId失败:" + error);
                            }
                          })
                        }
                      },
                      error: function (result, error) {
                        console.log(result)
                        console.log("提交formId失败:");
                      }
                    })
                  },
                  error: function (result, error) {
                    console.log("提交失败:" + error);
                  }
                })
              }
            })
          }
        }
      })
    }
  },
  getDay: function (day) {
    var that = this;
    var today = new Date();
    var targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
    today.setTime(targetday_milliseconds);
    var tYear = today.getFullYear();
    var tMonth = today.getMonth();
    var tDate = today.getDate();
    tMonth = that.handleMonth(tMonth + 1);
    tDate = that.handleMonth(tDate);
    return tYear + "-" + tMonth + "-" + tDate;
  },
  handleMonth: function (month) {
    var m = month;
    if (month.toString().length == 1) {
      m = "0" + month;
    }
    return m;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    username = wx.getStorageSync("username");
    userid = wx.getStorageSync("userid");
    that.setData({//初始化数据
      src: "",
      isSrc: false,
      autoFocus: true,
    })

    //获取设备和用户信息
    wx.getSystemInfo({
      success: function (res) {
        var info = '**用户信息**\r\n';
        info += '用户名：' + username;
        info += '\r\n手机型号：' + res.model;
        info += '（' + res.platform + ' - ' + res.windowWidth + 'x' + res.windowHeight + '）';
        info += '\r\n微信版本号：' + res.version;
        info += '\r\n小程序版本号：' + app.version;
        that.setData({
          info: info
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})