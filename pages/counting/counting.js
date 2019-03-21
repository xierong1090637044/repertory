// pages/delivery/delivery.js
const Bmob = require('../../utils/bmob.js');
const Bmob_new = require('../../utils/bmob_new.js');
var _ = require('../../utils/we-lodash.js');
var { $Message } = require('../../component/base/index');
var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods: [],
    isEmpty: false,
    url:"",
    is_input:null,
    url: "counting-history/counting-history"
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
      wx.showModal({
        title: '提示',
        content: '请确认将商品盘点数目？',
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

    tempGoods[idx].now_reserve = e.detail.detail.value;

    that.setData({
      goods: tempGoods
    })
  },

  //通过二维码获取商品
  getcode_product:function(id,type)
  {
    var code_product = [];

    if(type =="false")
    {
      const query = Bmob_new.Query('Goods');
      query.get(id).then(res => {
        res.now_reserve = res.now_reserve;
        res.goodsId = res.objectId;
        code_product.push(res);
        that.setData({
          goods: code_product,
        })
      }).catch(err => {

      })
    }else{
      const query = Bmob_new.Query("Goods");
      query.equalTo("productCode", "==", id);
      query.equalTo("userId", "==", wx.getStorageSync("userid"));
      query.find().then(res => {
        console.log(res);
        res[0].now_reserve = res[0].now_reserve;
        res[0].goodsId = res[0].objectId;
        code_product.push(res[0]);
        that.setData({
          goods: code_product,
        })
      });
    }
  },

  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    console.log(options)
    that = this;
    if (options.id != null) {
      that.getcode_product(options.id,options.type);
    } else {
      if (options.type == "friend") {
        that.setData({
          url: "../friends/delivery-history-fri/delivery-history-fri"
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

  /*** 生命周期函数--监听页面初次渲染完成*/
  onReady: function () {

  },

  /*** 生命周期函数--监听页面显示*/
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