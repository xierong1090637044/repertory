// pages/entering/entering.js
const Bmob = require('../../utils/bmob.js')
var _ = require('../../utils/we-lodash.js');
var { $Message } = require('../../component/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods: [],
    isEmpty: false
  },
  
  handleEntering: function () {
    var that = this;
    var isAllZero = true
    if (that.data.goods.length < 1) {
      $Message({
        content: '未选择产品，请确认',
        type: 'warning',
        duration: 5
      });
      return
    }
    for (var i = 0; i < that.data.goods.length; i++) {
      if (that.data.goods[i].num > 0) {
        isAllZero = false
      }
    }
    if (isAllZero) {
      $Message({
        content: '请选择进货量',
        type: 'warning',
        duration: 5
      });
      return
    }
    wx.showModal({
      title: '提示',
      content: '确认将商品入库？',
      confirmText: '确认',
      success: function (res) {
        if (res.confirm) {
          wx.setStorageSync("operate_goods", that.data.goods);
          wx.navigateTo({
            url: 'enter-history/enter-history',
          })
        }
      }
    })
  },
  handleDel: function (e) {
    var that = this
    var idx = e.currentTarget.dataset.idx
    var tempGoods = that.data.goods
    tempGoods.splice(idx, 1);
    if (tempGoods.length < 1) {
      that.setData({
        isEmpty: true
      })
    }
    that.setData({
      goods: tempGoods
    })
  },
  handleNumChange: function (e) {
    var that = this
    var idx = e.currentTarget.dataset.idx
    var tempGoods = that.data.goods
    tempGoods[idx].num = e.detail.value
    tempGoods[idx].total_money = tempGoods[idx].num * tempGoods[idx].retailPrice;
    that.setData({
      goods: tempGoods
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    var that = this
    wx.getStorage({
      key: 'currGoods',
      success: function (res) {
        that.setData({
          goods: res.data
        })
      }
    })
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