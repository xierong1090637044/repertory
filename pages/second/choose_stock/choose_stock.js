const app = getApp();
const Bmob = require('../../../utils/bmob_new.js');
var that;
var friendId;
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    hidden: true,
    stocks: [],
    isEmpty: false
  },

  //得到客户列表
  getstock_list: function (id) {
    wx.showLoading({ title: '加载中...' })

    const query = Bmob.Query("stocks");
    query.equalTo("parent", "==", id);
    query.limit(1000)
    query.find().then(res => {
      //console.log(res);
      if (res.length == 0) {
        that.setData({
          isEmpty: true
        });
        wx.hideLoading();
      } else {
        that.setData({
          stocks: res,
          isEmpty: false
        });
        wx.hideLoading();
      }
    });
  },

  //搜索
  complete: function (e) {
    wx.showLoading({ title: '加载中...' });

    var name = e.detail.value;
    const query = Bmob.Query("stocks");
    (name == '') ? that.getstock_list() : query.equalTo("stock_name", "==", name);
    query.find().then(res => {
      if (res.length == 0) {
        that.setData({
          isEmpty: true
        });
        wx.hideLoading();
      } else {
        that.setData({
          stocks: res,
          isEmpty: false
        });
        wx.hideLoading();
      }
    });
  },

  //点击得到详情
  getdetail: function (e) {
    var id = e.currentTarget.dataset.id;
    const query = Bmob.Query('stocks');
    query.get(id).then(res => {
      wx.navigateBack();
      wx.setStorageSync("stock", res);
    }).catch(err => {
      console.log(err)
    })
  },

  onLoad(options) {
    that = this;

    friendId = options.friendId;
    if (friendId != null) {
      that.getstock_list(friendId);
    } else {
      var userid = wx.getStorageSync("userid");
      that.getstock_list(userid);
    }
  },

  onReady() {

  },

  onShow: function () {
    var is_add = wx.getStorageSync("is_add");
    if (is_add) {
      that.getstock_list();
      wx.removeStorageSync("is_add");
    }
  },

  goto_add: function () {
    wx.navigateTo({
      url: '../stocks/stocks_add/stocks_add',
    })
  },
});