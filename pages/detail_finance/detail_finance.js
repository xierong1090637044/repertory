// pages/detail_finance/detail_finance.js
let Bmob = require('../../utils/bmob_new.js');
var charts = require('../../utils/charts.js');
let that;
let selectd_start_data;
let selectd_end_data;
let finChart;
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
    that.setData({ selectd_start_data: e.detail.value, show_start_data: e.detail.value,spinShow: true});
    that.gettoday_detail();
  },

  //选择结束日期
  bindDate_endChange(e) {
    selectd_end_data = e.detail.value + " 00:00:00";
    that.setData({ selectd_end_data: e.detail.value, show_end_data: e.detail.value,spinShow: true});
    that.gettoday_detail();
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
            get_reserve_real_money = get_reserve_real_money + res[i].num * res[i].goodsId.retailPrice;
            get_reserve_num = get_reserve_num + res[i].total_money;
          } else if (res[i].type == -1) {
            out_reserve = out_reserve + res[i].num;
            out_reserve_real_money = out_reserve_real_money + res[i].num * res[i].goodsId.costPrice;
            out_reserve_num = out_reserve_num + res[i].total_money;
          }
        }
      
      that.setData({
        spinShow: true,
        get_reserve: get_reserve, 
        out_reserve: out_reserve,
        get_reserve_real_money: get_reserve_real_money,
        out_reserve_real_money: out_reserve_real_money,
        get_reserve_num: get_reserve_num.toFixed(2),
        out_reserve_num: out_reserve_num,
        get_reserve_get_num: (get_reserve_real_money - get_reserve_num).toFixed(2),
        out_reserve_get_num: out_reserve_num - out_reserve_real_money,
        });

       //查询当日应收和实际收款
      var should_get_money = 0;
      var real_get_money = 0;
      const query = Bmob.Query("order_opreations");
      query.equalTo("master", "==", wx.getStorageSync("userid"));
      query.equalTo("createdAt", ">=", selectd_start_data);
      query.equalTo("type", "==", -1);
      query.equalTo("createdAt", "<=", selectd_end_data);
      query.find().then(res => {
        //console.log(res);
        for(var i=0;i<res.length;i++)
        {
          should_get_money = should_get_money + res[i].all_money;
          real_get_money = real_get_money + res[i].real_money;
        }
        that.setData({
          should_get_money: should_get_money,
          real_get_money: real_get_money,
          spinShow: false
        })
      });
    });
  },

  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    that = this;

    selectd_start_data = that.getDay(0);
    selectd_end_data = that.getDay(1);

    that.gettoday_detail();

    that.setData({
      selectd_start_data: selectd_start_data,
      selectd_end_data: selectd_end_data,
      show_start_data : that.getshowDay(0),
      show_end_data : that.getshowDay(1),
      view1: "block",
      view2: "none"
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

  getshowDay: function (day) {
    var that = this;
    var today = new Date();
    var targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
    today.setTime(targetday_milliseconds);
    var tYear = today.getFullYear();
    var tMonth = today.getMonth();
    var tDate = today.getDate();
    tMonth = that.handleMonth(tMonth + 1);
    tDate = that.handleMonth(tDate);
    return tYear + "-" + tMonth + "-" + tDate;
  },

  handleMonth: function (month) {
    var m = month;
    if (month.toString().length == 1) {
      m = "0" + month;
    }
    return m;
  },

})