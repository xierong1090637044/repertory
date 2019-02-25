// pages/mine/my_setting/my_setting.js
const Bmob = require('../../../utils/bmob_new.js');
var that;
var userid;
Page({

  /*** 页面的初始数据*/
  data: {

  },

  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    that = this;
    userid = wx.getStorageSync("userid");

    that.getnum_from_bmob();
  },

  /*** 生命周期函数--监听页面初次渲染完成*/
  onReady: function () {

  },

  /*** 生命周期函数--监听页面显示*/
  onShow: function () {

  },

  set_num_enough:function(e)
  {
    var num_enough = Number(e.detail.detail.value);
    var setting = wx.getStorageSync("setting");
    setting.num_enough = num_enough;
    wx.setStorageSync("setting", setting);

    that.setnum_in_bmob(num_enough,"num_enough");
  },

  set_num_insufficient:function(e)
  {
    var num_insufficient = Number(e.detail.detail.value);
    var setting = wx.getStorageSync("setting");
    setting.num_insufficient = num_insufficient;
    wx.setStorageSync("setting", setting);

    that.setnum_in_bmob(num_insufficient, "num_insufficient");
  },

  set_num_warning:function(e)
  {
    var num_warning = Number(e.detail.detail.value);
    var setting = wx.getStorageSync("setting");
    setting.num_warning = num_warning;
    wx.setStorageSync("setting", setting);

    that.setnum_in_bmob(num_warning, "num_warning");
  },

  //得到数据从Bmob
  getnum_from_bmob:function()
  {
    const query = Bmob.Query("setting");
    query.equalTo("parent", "==", userid);
    query.find().then(res => {
      if(res.length == 1)
      {
        that.setData({
          value: res[0],
        })
      }
    });
  },

  //失去焦点设置库存充足和不足
  setnum_in_bmob:function(data,type)
  {
    wx.showLoading({title: '加载中...'})
    const query = Bmob.Query("setting");
    query.equalTo("parent", "==", userid);
    query.find().then(res => {
      console.log(res)
      if(res.length == 0)
      {
        const pointer = Bmob.Pointer('_User');
        const poiID = pointer.set(userid);

        const query = Bmob.Query('setting');
        query.set(type,data);
        query.set("parent",poiID);
        query.save().then(res => {
          console.log(res)
          wx.hideLoading();
          }).catch(err => {
            console.log(err)
        })
      }else{
        const query = Bmob.Query('setting');
        query.set('id', res[0].objectId) //需要修改的objectId
        query.set(type, data)
        query.save().then(res => {
          wx.hideLoading();
          console.log(res)
        }).catch(err => {
          console.log(err)
        })
      }
    });
  }

})