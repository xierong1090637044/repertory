// pages/mine/account/account.js
var Bmob = require('../../../utils/bmob_new.js');
Page({

  /*** 页面的初始数据*/
  data: {

  },

  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    var id = wx.getStorageSync("userid");
    var password = wx.getStorageSync("openid");

    this.setData({id:id,password:password});

    const query = Bmob.Query('_User');
    query.get(id).then(res => {
      if (res.is_computer)
      {
        this.setData({ id: id, password: password, is_computer:"已开通"});
      }else{
        this.setData({ id: id, password: password, is_computer: "未开通" });
      }
      
    })
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

  },

  copy:function(e)
  {
    console.log(e)
    var content = e.currentTarget.dataset.id;
    wx.setClipboardData({
      data: content,
    })
  },
})