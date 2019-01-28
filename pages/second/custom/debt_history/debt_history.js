var { $Message } = require('../../../../component/base/index');
const Bmob = require('../../../../utils/bmob_new.js');
var that;
Page({

  /*** 页面的初始数据*/
  data: {

  },

  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    that = this;
    var real_should_get = 0;
    var real_have_get = 0;

    const query = Bmob.Query("debt_history");
    query.equalTo("master", "==", wx.getStorageSync("userid"));
    query.equalTo("custom", "==", options.id);
    query.find().then(res => {
      console.log(res)
      for(var i=0;i<res.length;i++)
      {
        real_should_get = real_should_get+res[i].debt_number;
      }
      
      that.setData({ detail: res, real_should_get: real_should_get});

      const query = Bmob.Query("order_opreations");
      query.equalTo("master", "==", wx.getStorageSync("userid"));
      query.equalTo("custom", "==", options.id);
      query.equalTo("debt", ">", 0);
      query.find().then(res => {
        for(var i =0;i<res.length;i++)
        {
          real_have_get = real_have_get+res[i].debt;
        }
        that.setData({ real_have_get: real_have_get})
      });

    });
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})