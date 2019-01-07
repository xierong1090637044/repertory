var Bmob = require('../../../utils/bmob_new.js');
var that;
Page({

  /*** 页面的初始数据*/
  data: {
    products:"",
    detail:"",
  },

  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    var id = options.id;
    that = this;
    that.getdetail(id);
  },

  /*** 生命周期函数--监听页面初次渲染完成*/
  onReady: function () {

  },

  /*** 生命周期函数--监听页面显示*/
  onShow: function () {

  },

  getdetail:function(id)
  {
    that.setData({ spinShow:true});
    const query = Bmob.Query('order_opreations');
    query.include("opreater","custom");
    query.get(id).then(res => {
      console.log(res);
      that.setData({detail:res});
      const query = Bmob.Query('order_opreations');
      query.field('relations',res.objectId);
      query.relation('Bills').then(res => {
        query.include("Goods");
        console.log(res);
        that.setData({ products: res.results, spinShow:false });
      })
    }).catch(err => {
      console.log(err)
    })
  },

})