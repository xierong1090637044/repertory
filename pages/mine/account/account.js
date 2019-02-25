// pages/mine/account/account.js
var Bmob = require('../../../utils/bmob_new.js');
var that;
var edit_password;
Page({

  /*** 页面的初始数据*/
  data: {
    web_address: "https://hello.ysld.me/stockpro/test/index.php"
  },

  //修改密码点击
  set_visible:function()
  {
    that.setData({ visible:true})
  },

  handleClose: function () {
    that.setData({ visible: false});
  },

  //输入新密码事件
  getpassword_text: function (e) {
    edit_password = e.detail.detail.value;
  },

  //modal点击确定事件
  getpassword_text_confrim: function () {
    if (edit_password == null || edit_password.length == '') {
      wx.showToast({
        icon: "none",
        title: '新密码长度应大于6位',
      })
    } else {
      wx.showLoading({ title: '修改中...' });
      const query = Bmob.Query('_User');
      query.get(wx.getStorageSync("userid")).then(res => {
        res.set('password', edit_password);
        res.save();

        wx.hideLoading();
        that.setData({ password: edit_password, visible: false});
        wx.setStorageSync("openid", edit_password)
      }).catch(err => {
      })
    }

  },

  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    that = this;

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