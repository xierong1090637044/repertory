const app = getApp();
const Bmob = require('../../../utils/bmob_new.js');
var that;
var friendId;
var userId;
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    hidden: true,
    producers: [],
    isEmpty: false
  },

  //得到客户列表
  getproducer_list: function (id) {
    wx.showLoading({ title: '加载中...' })

    const query = Bmob.Query("producers");
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
          producers: res,
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
    const query = Bmob.Query("producers");
    query.equalTo("parent", "==", userId);
    (name == '') ?null:query.equalTo("producer_name", "==", name);
    query.find().then(res => {
      if (res.length == 0) {
        that.setData({
          isEmpty: true
        });
        wx.hideLoading();
      } else {
        that.setData({
          producers: res,
          isEmpty: false
        });
        wx.hideLoading();
      }
    });
  },

  //点击得到详情
  getdetail: function (e) {
    var id = e.currentTarget.dataset.id;
    const query = Bmob.Query('producers');
    query.get(id).then(res => {
      wx.navigateBack();
      wx.setStorageSync("producer", res);
    }).catch(err => {
      console.log(err)
    })
  },

  onLoad(options) {
    that = this;

    friendId = options.friendId;
    userId = wx.getStorageSync("userid");
    if (friendId != null) {
      that.getproducer_list(friendId);
    } else {
      var userid = wx.getStorageSync("userid");
      that.getproducer_list(userid);
    }
  },

  onReady() {

  },

  onShow: function () {
    var is_add = wx.getStorageSync("is_add");
    if (is_add) {
      that.getproducer_list(userId);
      wx.removeStorageSync("is_add");
    }
  },

  goto_add: function () {
    wx.navigateTo({
      url: '../producer/producer_add/producer_add',
    })
  },
});