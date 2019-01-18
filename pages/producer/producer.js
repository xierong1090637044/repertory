var Bmob = require('../../utils/bmob_new.js');
var that = this;
var select_id;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    producer:[]
  },

  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    that = this;
    that.get_class();
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

  //产品类别点击
  get_products:function(e)
  {
    select_id = e.currentTarget.dataset.id
    that.setData({ select_id: e.currentTarget.dataset.id, producer:null});
    that.getproducer_list(select_id);
  },

  //得到产品类别
  get_class:function()
  {
    const query = Bmob.Query("class");
    query.find().then(res => {
      console.log(res)
      that.setData({ class_pro: res, select_id: res[0].objectId});
      that.getproducer_list(res[0].objectId);
    });
  },

  getproducer_list:function(id)
  {
    that.setData({ spinShow:true});
    const query = Bmob.Query("producer");
    query.include("user");
    query.order("createdAt");
    query.equalTo("isactive", "==", true);
    query.equalTo("class", "==", id);
    query.find().then(res => {
      console.log(res);
      that.setData({user:res});//获得用户
      if(res.length == 0)
      {
        that.setData({ isEmpty:true})
      }else{
        var products = [];
        for (var i = 0; i < res.length; i++) {
          const query = Bmob.Query("Goods");
          query.limit(3);
          query.order("createdAt");
          query.equalTo("userId", "==", res[i].user.objectId);
          query.find().then(good_res => {
            products.push(good_res);
            that.setData({ products: products, isEmpty: false })
          });
        }
      }
      that.setData({ spinShow: false });
    });

  }

})