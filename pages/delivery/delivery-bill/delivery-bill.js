// pages/delivery/delivery-bill/delivery-bill.js
const Bmob = require('../../../utils/bmob.js')
var _ = require('../../../utils/we-lodash.js');
var { $Message } = require('../../../component/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods: [],
    isEmpty:false
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
      if (that.data.goods[i].num > 0) {
        isAllZero = false
      }
    }
    if (isAllZero) {
      $Message({
        content: '请选择出库量',
        type: 'warning',
        duration: 5
      });
      return
    }
    wx.showModal({
      title: '提示',
      content: '确认将商品出库？',
      confirmText: '确认',
      success: function (res) {
        if (res.confirm) {
          var Goods = Bmob.Object.extend("Goods");
          var Bills = Bmob.Object.extend("Bills");
          var objects = new Array();
          var billsObj = new Array();
          for (var i = 0; i < that.data.goods.length; i++) {
            if (that.data.goods[i].num > 0) {
              var num = that.data.goods[i].reserve - that.data.goods[i].num
              var tempGoods = new Goods();
              tempGoods.set('objectId', that.data.goods[i].goodsId)
              tempGoods.set('reserve', num)
              objects.push(tempGoods)
              //单据
              var tempBills = new Bills();
              var user = new Bmob.User();
              user.id = wx.getStorageSync('userid');
              tempBills.set('goodsId', tempGoods);
              tempBills.set('userId', user);
              tempBills.set('type', -1);
              tempBills.set('num', that.data.goods[i].num)
              billsObj.push(tempBills)
            }
          }
          Bmob.Object.saveAll(objects).then(function (objects) {
            // 批量更新成功
            console.log("批量更新成功", objects);
            //插入单据
            Bmob.Object.saveAll(billsObj).then(function (res) {
              console.log("批量新增单据成功", res);
              wx.showToast({
                title: '产品出库成功',
                icon: 'success',
                success: function () {
                  setTimeout(() => {
                    wx.reLaunch({
                      url: '/pages/index/index',
                    })
                  }, 1000)
                }
              })
            },
              function (error) {
                // 批量新增异常处理
                console.log("异常处理");
              });
          },
            function (error) {
              // 批量更新异常处理
              console.log("异常处理");
            });
        }
      }
    })
  },
  handleDel:function(e){
    var that = this
    var idx = e.currentTarget.dataset.idx
    var tempGoods = that.data.goods
    tempGoods.splice(idx, 1);
    if (tempGoods.length<1){
      that.setData({
        isEmpty:true
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
    if (tempGoods[idx].reserve < e.detail.value){
      wx.showToast({
        title: '库存不足',
        icon: 'warning'
      })
      tempGoods[idx].num = tempGoods[idx].reserve
    }else{
      tempGoods[idx].num = e.detail.value
    }
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