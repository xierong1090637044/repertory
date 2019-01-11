// pages/delivery/delivery.js
const Bmob = require('../../utils/bmob.js')
var _ = require('../../utils/we-lodash.js');
var { $Message } = require('../../component/base/index');
var really_money;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods: [],
    isEmpty: false,
    url:"",
    is_input:null
  },
  handleDelivery: function () {
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
      if (that.data.goods[i].num == 0 || that.data.goods[i].num == null) {
        isAllZero = false
      }
    }
    if (isAllZero== false) {
      $Message({
        content: '出库量必须大于1',
        type: 'warning',
        duration: 5
      });
      return
    }else{
      wx.showModal({
        title: '提示',
        content: '确认将商品出库？',
        confirmText: '确认',
        success: function (res) {
          if (res.confirm) {
            wx.setStorageSync("operate_goods", that.data.goods);
            wx.navigateTo({
              url: that.data.url,
            })

          }
        }
      })
    }
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
    console.log(idx);
    var tempGoods = that.data.goods
    if (tempGoods[idx].reserve < e.detail.value) {
      wx.showToast({
        title: '库存不足',
        icon: 'warning'
      })
      tempGoods[idx].num = tempGoods[idx].reserve;
      if(that.data.is_input)
      {
        tempGoods[idx].modify_retailPrice = really_money;
      }else{
        tempGoods[idx].modify_retailPrice = tempGoods[idx].retailPrice;
      }
      tempGoods[idx].total_money = tempGoods[idx].num * tempGoods[idx].modify_retailPrice;
    } else {
      tempGoods[idx].num = e.detail.value;
      if (that.data.is_input) {
        tempGoods[idx].modify_retailPrice = really_money;
      } else {
        tempGoods[idx].modify_retailPrice = tempGoods[idx].retailPrice;
      }
      tempGoods[idx].total_money = tempGoods[idx].num * tempGoods[idx].modify_retailPrice;
    }
    that.setData({
      goods: tempGoods
    })
  },

  getrealprice:function(e)
  {
    var that = this;
    really_money = e.detail.value;
    var idx = e.target.dataset.idx;
    var tempGoods = that.data.goods;
    tempGoods[idx].modify_retailPrice = really_money;
    tempGoods[idx].total_money = tempGoods[idx].num * really_money;
    that.setData({
      goods: tempGoods,
      is_input:true
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var that = this;
    if (options.type == "friend") {
      that.setData({
        url: "delivery-history-fri/delivery-history-fri"
      });
    } else {
      that.setData({
        url: "delivery-history/delivery-history"
      });
    }
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