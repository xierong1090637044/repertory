// pages/entering/entering.js
const Bmob = require('../../utils/bmob.js');
const Bmob_new = require('../../utils/bmob_new.js');
var _ = require('../../utils/we-lodash.js');
var { $Message } = require('../../component/base/index');
var that = this;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods: [],
    url:"",
    isEmpty: false,
    url: "enter-history/enter-history"
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
      console.log(that.data.goods[i].num);
      if (that.data.goods[i].num == 0 || that.data.goods[i].num == null) {
        isAllZero = false
      }
    }

    if (isAllZero == false) {
      $Message({
        content: '入库量必须大于1',
        type: 'warning',
        duration: 5
      });
      return
    }else
    {
      wx.showModal({
        title: '提示',
        content: '确认将商品入库？',
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
    var tempGoods = that.data.goods
    tempGoods[idx].num = e.detail.value
    tempGoods[idx].total_money = tempGoods[idx].num * tempGoods[idx].retailPrice;
    that.setData({
      goods: tempGoods
    })
  },

  //通过二维码获取商品
  getcode_product: function (id) {
    var code_product = [];
    const query = Bmob_new.Query('Goods');
    query.get(id).then(res => {
      console.log(res);
      res.total_money = res.retailPrice;
      res.modify_retailPrice = res.retailPrice;
      res.goodsId = res.objectId;
      code_product.push(res);
      that.setData({
        goods: code_product,
      })
    }).catch(err => {
      console.log(err)
    })

  },

  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    that = this;
    if (options.id != null) {
      that.getcode_product(options.id);
    } else {
      if (options.type == "friend") {
        that.setData({
          url: "../friends/enter-history-fri/enter-history-fri"
        });
      }
      wx.getStorage({
        key: 'currGoods',
        success: function (res) {
          that.setData({
            goods: res.data,
          })
        }
      })
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