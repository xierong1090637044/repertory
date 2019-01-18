// pages/index/index.js
var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    firstlyModules: [
      {
        name: '产品入库', icon: '../../images/index/entering.png',
        url: '/pages/common/goods-select/goods-select?type=entering'
      },
      {
        name: '产品出库', icon: '../../images/index/delivery.png',
        url: '/pages/common/goods-select/goods-select?type=delivery'
      },
      {
        name: '我的产品', icon: '../../images/index/goods.png',
        url: '/pages/goods/goods'
      },
      {
        name: '我的客户', icon: '../../images/index/customs.png',
        url: '/pages/second/custom/custom'
      },
     /* {
        name: '供货商', icon: '../../images/index/mine.png',
        url: '/pages/producer/producer',
      },*/
      {
        name: '财务报表', icon: '../../images/index/finance.png',
        url: '/pages/finance/finance'
      },
      {
        name: '操作记录', icon: '../../images/index/order_history.png',
        url: '/pages/order_history/order_history'
      },
    ],
    secondaryModules: [
      {
        name: '协同管理', icon: '../../images/index/mine.png',
        url: '/pages/friends/friends'
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

  //点击扫描产品条形码
  scan_code:function()
  {
    wx.showActionSheet({
          itemList: ['扫码出库', '扫码入库', '查看详情'],
          success(res) {
            console.log(res.tapIndex)
            that.scan(res.tapIndex);
          },
          fail(res) {
            console.log(res.errMsg)
          }
        })
  },

  scan:function(type)
  {
    wx.scanCode({
      onlyFromCamera: true,
      success(res) {
        console.log(res)
        var result = res.result;
        var array = result.split("-");

        if (type == 0) {
          wx.navigateTo({
            url: '../delivery/delivery?id=' + array[0],
          })
        } else if (type == 1) {
          wx.navigateTo({
            url: '../entering/entering?id=' + array[0],
          })
        } else if (type == 2) {
          wx.navigateTo({
            url: '../common/goods-dtl/goods-dtl?has_code=false&id=' + array[0],
          })
        }
      }
    })
  },

  /** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    that = this;
    var noticeShow = wx.getStorageSync('noticeShow');
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