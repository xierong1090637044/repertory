var Bmob = require('../../utils/bmob_new.js');
var that;
Page({

  /*** 页面的初始数据*/
  data: {
    
  },

  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    that = this;
    that.get_list_check();
  },

  /*** 生命周期函数--监听页面初次渲染完成*/
  onReady: function () {

  },

  /*** 生命周期函数--监听页面显示*/
  onShow: function () {

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

  get_list_check: function () {
    that.setData({ spinShow: true });
    var userid = wx.getStorageSync("userid");
    const query = Bmob.Query("order_opreations_fri");
    query.equalTo("master", "==", userid);
    query.order("-createdAt");
    query.find().then(res => {
      console.log(res);
      that.setData({
        list: res,
        spinShow: false
      })
    });
  },

  //点击得到详情
  get_detail: function (e) {
    var id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: 'detail/detail?id=' + id,
      })
  }
})