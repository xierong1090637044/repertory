// pages/index/index.js
const Bmob = require('../../utils/bmob_new.js');
let that;
let userid;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    optionsLists: [{ name: '产品入库', icon: '../../images/index/entering.png', url: '/pages/common/goods-select/goods-select?type=entering' },
    { name: '产品出库', icon: '../../images/index/delivery.png', url: '/pages/common/goods-select/goods-select?type=delivery' },
    { name: '退货入库', icon: '../../images/index/return_goods.png', url: '/pages/common/goods-select/goods-select?type=returing' },
    { name: '库存盘点', icon: '../../images/index/stocking.png', url: '/pages/common/goods-select/goods-select?type=counting' },
    {name: '我的产品', icon: '../../images/index/goods.png',url: '/pages/goods/goods'},
    {name: '我的客户', icon: '../../images/index/customs.png',url: '/pages/second/custom/custom'},
    { name: '我的供货商', icon: '../../images/index/mine.png', url: '/pages/second/producer/producer'},
    {name: '我的协同', icon: '../../images/index/togeter.png', url: '/pages/friends/friends' },
    {name: '盈收记录', icon: '../../images/index/stock.png',url: '/pages/detail_finance/detail_finance'},
    {name: '操作记录', icon: '../../images/index/order_history.png',url: '/pages/order_history/order_history'},
    {name: '财务报表', icon: '../../images/index/finance.png',url: '/pages/finance/finance'},
    
    ],
  },

  //得到总库存数和总金额
  loadallGoods: function () {
    var total_reserve = 0;
    var total_money = 0;
    const query = Bmob.Query("Goods");
    query.equalTo("userId", "==", wx.getStorageSync("userid"));
    query.limit(500);
    query.find().then(res => {
      for (var i = 0; i < res.length; i++) {
        total_reserve = total_reserve + res[i].reserve;
        total_money = total_money + res[i].reserve * res[i].costPrice;
        if(i == (res.length - 1))
        {
          const query = Bmob.Query("Goods");
          query.equalTo("userId", "==", wx.getStorageSync("userid"));
          query.skip(500);
          query.limit(500);
          query.find().then(res => {
            for (var i = 0; i < res.length; i++) {
              total_reserve = total_reserve + res[i].reserve;
              total_money = total_money + res[i].reserve * res[i].costPrice;
            }
          })
          that.setData({ total_reserve: total_reserve, total_money: total_money, total_products: res.length });
        }
      }
      
    });
  },

  //点击扫描产品条形码
  scan_code: function () {
    wx.showActionSheet({
      itemList: ['扫码出库', '扫码入库', '扫码盘点', '扫码添加产品', '查看详情'],
      success(res) {
        that.scan(res.tapIndex);
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },

  //扫码操作
  scan: function (type) {
    wx.scanCode({
      success(res) {
        var result = res.result;
        var array = result.split("-");

        if (type == 0) {
          wx.navigateTo({
            url: '../delivery/delivery?id=' + array[0] + "&type=" + array[1],
          })
        } else if (type == 1) {
          wx.navigateTo({
            url: '../entering/entering?id=' + array[0] + "&type=" + array[1],
          })
        } else if (type == 2) {
          wx.navigateTo({
            url: '../counting/counting?id=' + array[0] + "&type=" + array[1],
          })
        } else if (type == 3) {
          wx.navigateTo({
            url: '../goods/goods-add/goods-add?id=' + array[0],
          })
        } else if (type == 4) {
          wx.navigateTo({
            url: '../common/goods-dtl/goods-dtl?id=' + array[0] + "&type=" + array[1],
          })
        }
      },
      fail(res) {
        wx.showToast({
          title: '未识别到条形码',
          icon: "none"
        })
      }
    })
  },

  /** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    that = this;
    userid = wx.getStorageSync("userid");
  },

  /*** 生命周期函数--监听页面初次渲染完成*/
  onReady: function () {
  },

  /*** 生命周期函数--监听页面显示*/
  onShow: function () {
    that.loadallGoods();
  },

  /*** 生命周期函数--监听页面隐藏*/
  onHide: function () {

  },

  /*** 生命周期函数--监听页面卸载*/
  onUnload: function () {

  },

  /*** 页面相关事件处理函数--监听用户下拉动作*/
  onPullDownRefresh: function () {

  },

  /*** 页面上拉触底事件的处理函数*/
  onReachBottom: function () {

  },

  /*** 用户点击右上角分享*/
  onShareAppMessage: function () {

  },

  skip: function () {
    wx.navigateTo({
      url: '../mine/upgrade/upgrade',
    })
  },
})