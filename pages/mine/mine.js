// pages/mine/mine.js
const app = getApp()
var config = require('../../utils/config.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    spinShow: true,
    userInfo: {},
    modules: [
      { name: '我的消息', icon: 'message', url: '/pages/mine/message/message' },
      { name: '待我审批', icon: 'task', url: '/pages/order_history_fri/order_history_fri' },
      { name: '我的申请', icon: 'createtask', url: '/pages/mine/apply-delivery/apply-delivery' },
      // { name: '我的单据', icon: 'createtask', url: '/pages/mine/reserve/reserve' },
      { name: '升级日志', icon: 'activity', url: '/pages/mine/upgrade/upgrade' },
      { name: '优化建议', icon: 'interactive', url: '/pages/mine/propose/propose' },
      { name: '关于我们', icon: 'prompt', url: '/pages/mine/about-us/about-us' }
    ],
    actions: [{ icon:'close'}],
    visible:false,
    qrcode:''
  },
  handleQRCode:function(){
    this.setData({
      visible:true
    })
  },
  handleClickClose({ detail }) {
    var that = this
    const index = detail.index;
    if(index === 0){
      that.setData({
        visible: false
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      userInfo:{
        nickName: wx.getStorageSync("nickName"),
        sex: wx.getStorageSync("sex"),
        avatarUrl: wx.getStorageSync("avatarUrl"),
        address: wx.getStorageSync("country") + wx.getStorageSync("province") + wx.getStorageSync("city")
      },
      qrcode: config.api.fetchQRCode + wx.getStorageSync("userid")
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    setTimeout(function () {
      that.setData({
        spinShow: false
      });
    }, 1000);
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