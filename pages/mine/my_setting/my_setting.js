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

  //设置库存跟金额精度
  set_show_float:function(e)
  {
    var show_float = Number(e.detail.detail.value) > 2 ? 2 : Number(e.detail.detail.value);
    that.setData({ show_float: show_float});
    that.setnum_in_bmob(show_float, "show_float");
  },

  set_USER:function(e)
  {
    var USER = e.detail.detail.value;
    that.setnum_in_bmob(USER,"USER");
  },

  set_UKEY:function(e)
  {
    var UKEY = e.detail.detail.value;
    that.setnum_in_bmob(UKEY, "UKEY");
  },

  set_number:function(e)
  {
    var number =e.detail.detail.value;
    that.setnum_in_bmob(number, "number");
  },

  //得到数据从Bmob
  getnum_from_bmob:function()
  {
    const query = Bmob.Query("setting");
    query.equalTo("parent", "==", userid);
    query.find().then(res => {
      if(res.length == 1)
      {
        wx.setStorageSync("print_setting", res[0])
        that.setData({
          value: res[0],
        })
      }
    });
  },

  //失去焦点设置
  setnum_in_bmob:function(data,type)
  {
    wx.showLoading({title: '加载中...'})
    const query = Bmob.Query("setting");
    query.equalTo("parent", "==", userid);
    query.find().then(res => {
      //console.log(res)
      if(res.length == 0)
      {
        const pointer = Bmob.Pointer('_User');
        const poiID = pointer.set(userid);

        const query = Bmob.Query('setting');
        query.set(type,data);
        query.set("parent",poiID);
        query.save().then(res => {
          //console.log(res)
          that.getnum_from_bmob();
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
          that.getnum_from_bmob();
          wx.showToast({
            title: '设置成功',
          })
          //console.log(res)
        }).catch(err => {
          console.log(err)
        })
      }
    });
  },

})