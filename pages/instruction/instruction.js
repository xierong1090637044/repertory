var app = getApp();
const Bmob = require('../../utils/bmob_new.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    version: '',
    year: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({title: '加载中...'});
    this.setData({
      version: app.version,
      year: new Date().getFullYear()
    });

    const query = Bmob.Query("sources");
    query.find().then(res => {
      console.log(res);
      wx.hideLoading();
      this.setData({ res:res});
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