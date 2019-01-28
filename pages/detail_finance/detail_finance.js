// pages/detail_finance/detail_finance.js
const Bmob = require('../../utils/bmob_new.js');
var that;
var selectd_start_data;
var selectd_end_data;
Page({

  /*** 页面的初始数据*/
  data: {
    current: '1',
    spinShow: true,
    selectd_start_data:"选择开始日期",
    selectd_end_data: "选择结束日期",
  },

  //选择开始日期
  bindDateChange(e) {
    selectd_start_data = e.detail.value + " 00:00:00";
    that.setData({ selectd_start_data: e.detail.value, current: '1', spinShow: true});
    that.gettoday_detail();
    that.get_operation_detail(1);
  },

  //选择结束日期
  bindDate_endChange(e) {
    selectd_end_data = e.detail.value + " 00:00:00";
    that.setData({ selectd_end_data: e.detail.value, current: '1', spinShow: true});
    that.gettoday_detail();
    that.get_operation_detail(1);
  },

  //tab改变
  handleChange({ detail }) {
    this.setData({
      current: detail.key,
    });
    if (detail.key == 1) {
      that.get_operation_detail(1);
    } else {
      that.get_operation_detail(-1);
    }
  },

  //得到总库存数和总金额
  loadallGoods: function () {
    var total_reserve = 0;
    var total_money = 0;
    const query = Bmob.Query("Goods");
    query.equalTo("userId", "==", wx.getStorageSync("userid"));
    query.find().then(res => {
      for (var i = 0; i < res.length; i++) {
        total_reserve = total_reserve + res[i].reserve;
        total_money = total_money + res[i].reserve * res[i].retailPrice;
      }
      that.setData({ total_reserve: total_reserve, total_money: total_money, spinShow: true });

      that.gettoday_detail();
    });
  },

  //得到今日概况
  gettoday_detail: function ()
  {
    var get_reserve = 0;
    var out_reserve = 0;
    var get_reserve_real_money = 0;
    var out_reserve_real_money = 0;
    var get_reserve_num = 0;
    var out_reserve_num = 0;

    const query = Bmob.Query("Bills");
    query.equalTo("userId", "==", wx.getStorageSync("userid"));
    query.equalTo("createdAt", ">=", selectd_start_data);
    query.equalTo("createdAt", "<=", selectd_end_data);
    
    query.include("goodsId");
    query.find().then(res => {
        for (var i = 0; i < res.length; i++) {
          if (res[i].type == 1) {
            get_reserve = get_reserve + res[i].num;
            get_reserve_real_money = get_reserve_real_money + res[i].num * res[i].goodsId.costPrice;
            get_reserve_num = get_reserve_num + res[i].total_money;
          } else if (res[i].type == -1) {
            out_reserve = out_reserve + res[i].num;
            out_reserve_real_money = out_reserve_real_money + res[i].num * res[i].goodsId.costPrice;
            out_reserve_num = out_reserve_num + res[i].total_money;
          }
        }
      
      that.setData({
        get_reserve: get_reserve, 
        out_reserve: out_reserve,
        get_reserve_real_money: get_reserve_real_money,
        out_reserve_real_money: out_reserve_real_money,
        get_reserve_num: get_reserve_num,
        out_reserve_num: out_reserve_num,
        get_reserve_get_num: get_reserve_num - get_reserve_real_money,
        out_reserve_get_num: out_reserve_num - out_reserve_real_money,
        });

       that.get_operation_detail(1);

       //查询当日应收和实际收款
      var should_get_money = 0;
      var real_get_money = 0;
      const query = Bmob.Query("order_opreations");
      query.equalTo("master", "==", wx.getStorageSync("userid"));
      query.equalTo("createdAt", ">=", selectd_start_data);
      query.equalTo("type", "==", -1);
      query.equalTo("createdAt", "<=", selectd_end_data);
      query.find().then(res => {
        console.log(res);
        for(var i=0;i<res.length;i++)
        {
          should_get_money = should_get_money + res[i].all_money;
          real_get_money = real_get_money + res[i].real_money;
        }
        that.setData({
          should_get_money: should_get_money,
          real_get_money: real_get_money
        })
      });
    });
  },

  //得到操作记录
  get_operation_detail: function (term) {
    wx.showLoading({ title: '加载中...' })
    const query = Bmob.Query("Bills");
    query.equalTo("userId", "==", wx.getStorageSync("userid"));
    query.equalTo("createdAt", ">=", selectd_start_data);
    query.equalTo("createdAt", "<", selectd_end_data);
    query.equalTo("type", "==", term);
    query.include("goodsId");
    query.find().then(res => {
      //console.log(res);
      that.setData({ bill_his: res, spinShow: false });
      wx.hideLoading();
    });
  },

  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    that = this;
    selectd_start_data = that.getDay(0);
    selectd_end_data = that.getDay(1);
    that.loadallGoods();

    that.setData({
      selectd_start_data: selectd_start_data,
      selectd_end_data: selectd_end_data,
    })
  },

  /*** 生命周期函数--监听页面初次渲染完成*/
  onReady: function () {

  },

  /*** 生命周期函数--监听页面显示*/
  onShow: function () {

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