var Bmob = require('../../../utils/bmob_new.js');
var that;
Page({

  /*** 页面的初始数据*/
  data: {
    current: '1',
  },

  handleChange({ detail }) {
    this.setData({
      current: detail.key,
    });
    if (detail.key == 1) {
      that.get_list_check("day");
    } else {
      that.get_list_check("month");
    }
  },

  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    that = this;
    that.get_list_check("day");
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

  get_list_check: function (type) {
    that.setData({ spinShow: true });
    var userid = wx.getStorageSync("userid");
    const query = Bmob.Query("order_opreations_fri");
    query.equalTo("master", "==", userid);
    if (type == "day") {
      query.equalTo("createdAt", ">", that.getDay(-7));
    } else {
      query.equalTo("createdAt", ">", that.getDay(-30));
    }
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
  },

  getDay: function (day) {
    var that = this;
    var today = new Date();
    var targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
    today.setTime(targetday_milliseconds);
    var tYear = today.getFullYear();
    var tMonth = today.getMonth();
    var tDate = today.getDate();
    tMonth = that.handleMonth(tMonth + 1);
    tDate = that.handleMonth(tDate);
    return tYear + "-" + tMonth + "-" + tDate + " " + "00:00:00";
  },

  handleMonth: function (month) {
    var m = month;
    if (month.toString().length == 1) {
      m = "0" + month;
    }
    return m;
  },
})