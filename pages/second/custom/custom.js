const app = getApp();
const Bmob = require('../../../utils/bmob_new.js');
var that;
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    hidden: true,
    customs:[],
    isEmpty:false,
    spinShow:true
  },

  //得到客户列表
  getcustom_list:function()
  {
    var userid = wx.getStorageSync("userid");
    const query = Bmob.Query("customs");
    query.order("custom_type");
    query.equalTo("parent", "==", userid);
    query.find().then(res => {
      console.log(res);
      if(res.length == 0)
      {
        that.setData({
          isEmpty: true,
          spinShow:false
        });
      }else{
        that.setData({
          customs: res,
          isEmpty: false,
          spinShow: false
        });
      }
    });
  },

  //搜索
  complete:function(e)
  {
    var name = e.detail.value;
    if(name == '')
    {
      that.getcustom_list();
    }else{
      const query = Bmob.Query("customs");
      query.equalTo("custom_name", "==", name);
      query.order("custom_type");
      query.find().then(res => {
        if (res.length == 0) {
          that.setData({
            isEmpty: true,
            spinShow: false
          });
        } else {
          that.setData({
            customs: res,
            isEmpty: false,
            spinShow: false
          });
        }
      });
    }
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