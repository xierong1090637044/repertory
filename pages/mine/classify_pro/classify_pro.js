var Bmob = require('../../../utils/bmob_new.js');
var that;
Page({

  /*** 页面的初始数据*/
  data: {

  },

  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    that = this;
    that.getclassify();
  },

  /*** 生命周期函数--监听页面初次渲染完成*/
  onReady: function () {

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

  getclassify:function()
  {
    wx.showLoading({title: '加载中...',})
    var userid = wx.getStorageSync("userid");
    const query = Bmob.Query("classify_pro");
    query.equalTo("parent", "==", userid);
    query.find().then(res => {
      wx.hideLoading();
      that.setData({classify:res});
    });
  },

  delete_classify:function(e)
  {
    console.log(e);
    var id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '是否删除该分类',
      success(res) {
        if (res.confirm) {
          const query = Bmob.Query('classify_pro');
          query.destroy(id).then(res => {
            that.onLoad();
          })
        }
      }
    })
  },
})