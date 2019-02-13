var Bmob = require('../../../utils/bmob_new.js');
var that;
var id;
Page({

  /*** 页面的初始数据*/
  data: {
    products:"",
    detail:"",
  },

  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    id = options.id;
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
    query.include("opreater", "custom");
    query.get(id).then(res => {
      //console.log(res);
      that.setData({detail:res});
      const query = Bmob.Query('order_opreations');
      query.include("goodsId");
      query.field('relations',res.objectId);
      query.relation('Bills').then(res => {
        //console.log(res);
        that.setData({ products: res.results, spinShow:false });
      })
    }).catch(err => {
      console.log(err)
    })
  },

  //数据撤销点击
  revoke:function()
  {
    wx.showModal({
      title: '提示',
      content: '数据撤销后不可恢复，请谨慎撤销！',
      success(res) {
        if (res.confirm) {
          wx.showLoading({ title: '撤销中...'})
          const query = Bmob.Query('order_opreations');
          query.destroy(that.data.detail.objectId).then(res => {
            for (var i = 0; i < that.data.products.length; i++) {
              that.delete_bill(i);
            }
          }).catch(err => {
            console.log(err)
          })
        }
      }
    })
    
  },

  delete_bill:function(i)
  {
    var product = that.data.products[i];

    const query = Bmob.Query('Bills');
    query.destroy(product.objectId).then(res => {
      const query1 = Bmob.Query('Goods');
      query1.set('id', product.goodsId.objectId);
      if (product.type == 1) {
        query1.set('reserve', product.goodsId.reserve - product.num);
      } else if (product.type == -1) {
        query1.set('reserve', product.goodsId.reserve + product.num);
      }
      query1.save().then(res => {
        if (i == (that.data.products.length - 1))
        {
          wx.hideLoading();
          wx.navigateBack({ delta: 1 })
          setTimeout(function () {
            wx.showToast({ title: '撤销成功' })
          }, 1000);
        }
      })
    });
  }

})