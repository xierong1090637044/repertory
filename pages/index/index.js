// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    firstlyModules: [
      { name: '产品入库', icon: '../../images/index/entering.png',
        url: '/pages/common/goods-select/goods-select?type=entering'
      }, 
      { name: '产品出库', icon: '../../images/index/delivery.png', 
        url: '/pages/common/goods-select/goods-select?type=delivery'
      },
      {
        name: '我的产品', icon: '../../images/index/goods.png',
        url: '/pages/goods/goods'
      }, 
    ],
    secondaryModules: [
      { name: '财务报表', icon: '../../images/index/finance.png', 
        url: '/pages/finance/finance'
      }, 
      { name: '我的好友', icon: '../../images/index/mine.png', 
        url: '/pages/mine/friends/friends'
      },
      {
        name: '操作记录', icon: '../../images/index/order_history.png',
        url: '/pages/order_history/order_history'
      },
    ],
    spinShow: true,
    noticeShow:true
  },

  handleClose:function(){
    wx.setStorageSync('noticeShow',false)
  },
  handleInstruction:function(){
    wx.navigateTo({
      url: '/pages/instruction/instruction'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var noticeShow = wx.getStorageSync('noticeShow')
    this.setData({
      noticeShow: noticeShow === ''?true : false
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
  
  },

  skip:function()
  {
    wx.navigateTo({
      url: '../mine/upgrade/upgrade',
    })
  }
})