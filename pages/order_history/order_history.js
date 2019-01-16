var Bmob = require('../../utils/bmob_new.js');
var that;
var c_type;
var custom_id;
Page({

  /*** 页面的初始数据*/
  data: {
    current: '1',
    page:1,
    limit:20
  },

  //tab改变
  handleChange({ detail }) {
    this.setData({
      current: detail.key,
    });
    if (detail.key == 1)
    {
      c_type = "month";
      that.get_list("month", custom_id);
      that.getallpage("month", custom_id);
    }else{
      c_type = "all";
      that.get_list("all", custom_id);
      that.getallpage("all", custom_id);
    }
  },

  //页码改变
  handlePageChange({ detail }) {
    const type = detail.type;
    if (type === 'next') {
      this.setData({
        page: this.data.page + 1
      });
      that.get_list(c_type);
    } else if (type === 'prev') {
      this.setData({
        page: this.data.page - 1
      });
      that.get_list(c_type, custom_id);
    }
  },

  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    that = this;
    custom_id = options.custom_id;
    if (custom_id == null){
      that.get_list("month");
      that.getallpage("month");
    }else{
      that.get_list("month", custom_id);
      that.getallpage("month", custom_id);
    }
  },

  /*** 生命周期函数--监听页面初次渲染完成*/
  onReady: function () {

  },

  /*** 生命周期函数--监听页面显示*/
  onShow: function () {
    
  },


  /*** 用户点击右上角分享*/
  onShareAppMessage: function () {

  },

  get_list:function(type,custom)
  {
    that.setData({ spinShow:true});
    var userid = wx.getStorageSync("userid");
    const query = Bmob.Query("order_opreations");
    query.equalTo("master", "==", userid);
    query.equalTo("custom", "==", custom);
    query.limit(that.data.limit);
    query.skip(that.data.limit*(that.data.page-1));
    if(type =="month")
    {
      query.equalTo("createdAt", ">", that.getDay(-30));
    }
    query.order("-createdAt");
    query.find().then(res => {
      //console.log(res);
      that.setData({
        list: res,
        spinShow:false
      })
    });
  },

  getallpage: function (type,custom)
  {
    var userid = wx.getStorageSync("userid");
    const query = Bmob.Query("order_opreations");
    query.equalTo("master", "==", userid);
    query.equalTo("custom", "==", custom);
    if (type == "month") {
      query.equalTo("createdAt", ">", that.getDay(-30));
    }
    query.find().then(res => {
      that.setData({
        all_page: Math.ceil(res.length / that.data.limit) ,
      })
    });
  },

  //点击得到详情
  get_detail:function(e)
  {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: 'detail/detail?id='+id,
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