// pages/common/goods-dtl/goods-dtl.js
var { $Message } = require('../../../component/base/index');
const Bmob = require('../../../utils/bmob.js');
const Bmob_new = require('../../../utils/bmob_new.js')
var _ = require('../../../utils/we-lodash.js');
var config = require('../../../utils/config.js');
var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    spinShow: true,
    packingUnits: config.units,
    goodsReserve: {},
    painting: {},
    shareImage: ''
  },

  handlePreviewImage: function (e) {
    var qrCode = e.target.dataset.qrcode
    console.log(qrCode);
    wx.previewImage({
      current: qrCode,
      urls: [qrCode]
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    var flag = options.type;
    var title = flag==1?'产品详情':'库存详情';
    wx.setNavigationBarTitle({
      title: '库存助手-'+title
    });
    var item = JSON.parse(wx.getStorageSync('item'));
    this.setData({
      goodsReserve: item
    })
    that.get_opera_detail(item.goodsId);
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  //得到该产品的操作详情
  get_opera_detail:function(id)
  {
    console.log(that.getDay(-7));
    const query = Bmob_new.Query("Bills");
    query.order("-createdAt");
    query.equalTo("goodsId", "==", id);
    query.equalTo("createdAt", ">", that.getDay(-7));
    query.find().then(res => {
      console.log(res);
      that.setData({ detail: res});
    });
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
    return tYear + "-" + tMonth + "-" + tDate + " "+"00:00:00";
  },

  handleMonth: function (month) {
    var m = month;
    if (month.toString().length == 1) {
      m = "0" + month;
    }
    return m;
  },

})