const app = getApp();
const Bmob = require('../../../utils/bmob_new.js');
var that;
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    hidden: true,
    customs:[],
    isEmpty:false
  },

  //得到客户列表
  getcustom_list:function()
  {
    wx.showLoading({title: '加载中...'})
    var userid = wx.getStorageSync("userid");
    const query = Bmob.Query("customs");
    query.equalTo("parent", "==", userid);
    query.find().then(res => {
      console.log(res);
      if(res.length == 0)
      {
        that.setData({
          isEmpty: true
        });
        wx.hideLoading();
      }else{
        that.setData({
          customs: res,
          isEmpty: false
        });
        wx.hideLoading();
      }
    });
  },

  //搜索
  complete:function(e)
  {
    wx.showLoading({title: '加载中...'});

    var name = e.detail.value;
    const query = Bmob.Query("customs");
    (name == '')?that.getcustom_list():query.equalTo("custom_name", "==", name);
    query.find().then(res => {
      if(res.length == 0)
      {
        that.setData({
          isEmpty: true
        });
        wx.hideLoading();
      }else{
        that.setData({
          customs: res,
          isEmpty: false
        });
        wx.hideLoading();
      }
    });
  },

  //点击查看详情
  getdetail:function(e)
  {
    console.log(e);
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: 'custom_add/custom_add?id='+id,
    })
  },

  onLoad() {
    that = this;
    that.getcustom_list();
  },

  onReady() {
    
  },

  onShow:function()
  {
    var is_add = wx.getStorageSync("is_add");
    if(is_add)
    {
      that.getcustom_list();
      wx.removeStorageSync("is_add");
    }
  },

  goto_add:function()
  {
    wx.navigateTo({
      url: 'custom_add/custom_add',
    })
  },
});