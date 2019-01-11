var Bmob = require('../../../../utils/bmob_new.js');
var that;
Page({

  /*** 页面的初始数据*/
  data: {
    id:"",
    goodIds:[],
    products: "",
    detail: "",
    button:false,
  },

  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    console.log(options);
    that = this;
    that.setData({id:options.id});
  },

  /*** 生命周期函数--监听页面初次渲染完成*/
  onReady: function () {

  },

  /*** 生命周期函数--监听页面显示*/
  onShow: function () {
    that.getfriend_detail(that.data.id);
  },

  onHide: function () {
    console.log(that.data.button)
  },

  onUnload: function () {
  },

  getfriend_detail: function (id) {
    that.setData({ spinShow: true });
    const query = Bmob.Query('order_opreations_fri');
    query.include("opreater");
    query.get(id).then(res => {
      console.log(res);
      that.setData({ detail: res });
      const query = Bmob.Query('order_opreations_fri');
      query.include('goodsId', 'Goods')
      query.field('relations', res.objectId);
      query.relation('Bills_friends').then(res => {
        console.log(res);
        that.setData({ products: res.results, spinShow: false });
      })
    }).catch(err => {
      console.log(err)
    })
  },

  //审批通过
  confrim_decison:function()
  {
    var goodIds = [];
    wx.showModal({
      title: '提示',
      content: '是否通过该操作',
      success(res) {
        if (res.confirm) {
          that.setData({ button:true});
          var detail = that.data.detail;
          var products = that.data.products;
          const query = Bmob.Query('order_opreations_fri');
          query.set('id', detail.objectId); //需要修改的objectId
          query.set('is_check', true);
          query.save().then(res => {
            for (var i = 0; i < products.length; i++) {
              const pointer = Bmob.Pointer('_User');
              const user = pointer.set(products[i].userId.objectId);
              const pointer1 = Bmob.Pointer('Goods');
              const GoodIds = pointer1.set(products[i].goodsId.objectId);

              const query = Bmob.Query('Bills');
              query.set('goodsName', products[i].goodsName);
              query.set('retailPrice', products[i].retailPrice);
              query.set('num', products[i].num)
              query.set('total_money', products[i].total_money);
              query.set('goodsName', products[i].goodsName);
              query.set('goodsId', GoodIds);
              query.set('userId', user);
              query.set('type', products[i].type);
              query.save().then(res =>{
                goodIds.push(res.objectId);
                if (goodIds.length == products.length)
                {
                  const relation = Bmob.Relation('Bills'); // 需要关联的表
                  const relID = relation.add(goodIds);

                  const pointer = Bmob.Pointer('_User')
                  const poiID = pointer.set(detail.opreater.objectId);
                  const poiID1 = pointer.set(detail.master.objectId);

                  const query = Bmob.Query('order_opreations');
                  query.set("relations", relID);
                  query.set("beizhu", detail.beizhu);
                  query.set("type", detail.type);
                  query.set("opreater", poiID);
                  query.set("master", poiID1);
                  query.set("all_money", detail.all_money);
                  query.save().then(res => {
                    console.log(res)
                  });
                }
              });

              const query1 = Bmob.Query('Goods');
              query1.set('id', products[i].goodsId.objectId)
              if (detail.type == -1) {
                query1.set('reserve', products[i].goodsId.reserve - products[i].num)
              } else {
                query1.set('reserve', products[i].goodsId.reserve + products[i].num)
              }
              query1.save().then(res => {
                setTimeout(function(){
                  wx.showToast({
                    title: '审批成功',
                  });
                  wx.navigateBack({
                    delta: 1
                  })
                },1000)
              })
            } 
          })
        }
      }
    })
  },

})