// pages/delivery/delivery-history/delivery-history.js
var Bmob = require('../../../utils/bmob.js');
var Bmob_new = require('../../../utils/bmob_new.js');
var that;
Page({

  /*** 页面的初始数据*/
  data: {
    beizhu_text:"",
    goods:"",
    all_money:0,
    real_money:0
  },

  //选择客户点击
  choose_custom:function()
  {
    wx.navigateTo({
      url: '../../second/choose_custom/choose_custom',
    })
  },

  //输入实际得到的钱款
  getreal_money:function(e)
  {
    var real_money = e.detail.detail.value;
    that.setData({real_money:real_money});
  },

  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    that = this;
    wx.removeStorageSync("custom");//移除这个缓存
    var operate_goods = wx.getStorageSync("operate_goods");
    var all_money = 0;
    for (var i = 0; i < operate_goods.length;i++)
    {
      all_money += operate_goods[i].total_money;
    }
    that.setData({ goods: operate_goods, all_money: all_money, real_money:all_money});
  },

  /*** 生命周期函数--监听页面初次渲染完成*/
  onReady: function () {

  },

  /*** 生命周期函数--监听页面显示*/
  onShow: function () {
    var custom = wx.getStorageSync("custom");
    if(custom !=null )
    {
      that.setData({custom:custom});
    }
  },

  /** 生命周期函数--监听页面隐藏 */
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

  input_beizhu:function(e)
  {
    var input_beizhu = e.detail.value;
    that.setData({ beizhu_text: input_beizhu});
  },

  formSubmit(e) {
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000; 
    var n = timestamp * 1000;
    var date = new Date(n);
    var Y = date.getFullYear();
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    var h = date.getHours();
    var m = date.getMinutes();

    var formId = e.detail.formId;
    var operation_ids = [];

    that.setData({ button: true });

    var Goods = Bmob.Object.extend("Goods");
    var Bills = Bmob.Object.extend("Bills");
    var objects = new Array();
    var billsObj = new Array();
    
    for (var i = 0; i < that.data.goods.length; i++) {
      if (that.data.goods[i].num > 0) {

        var num = that.data.goods[i].reserve + that.data.goods[i].num;
        var tempGoods = new Goods();
        tempGoods.set('objectId', that.data.goods[i].goodsId)
        tempGoods.set('reserve', num)
        objects.push(tempGoods)
        //单据
        var tempBills = new Bills();
        var user = new Bmob.User();
        user.id = wx.getStorageSync('userid');
        tempBills.set('goodsName', that.data.goods[i].goodsName);
        tempBills.set('retailPrice', that.data.goods[i].modify_retailPrice);
        tempBills.set('num', that.data.goods[i].num);
        tempBills.set('total_money', that.data.goods[i].total_money);
        tempBills.set('goodsId', tempGoods);
        tempBills.set('userId', user);
        tempBills.set('type', 2);

        billsObj.push(tempBills)
      }
    }
    Bmob.Object.saveAll(objects).then(function (objects) {
      // 批量更新成功
      console.log("批量更新成功", objects);
      //插入单据
      Bmob.Object.saveAll(billsObj).then(function (res) {
        //console.log("批量新增单据成功", res);
        for (var i = 0; i < res.length; i++) {
          operation_ids.push(res[i].id);
          if (i == (res.length - 1)) {
            //console.log("批量新增单据成功", res);
            var currentUser = Bmob.User.current();
            const relation = Bmob_new.Relation('Bills'); // 需要关联的表
            const relID = relation.add(operation_ids);

            const pointer = Bmob_new.Pointer('_User')
            const poiID = pointer.set(currentUser.id);

            const query = Bmob_new.Query('order_opreations');
            query.set("relations", relID);
            query.set("beizhu", that.data.beizhu_text);
            query.set("type", 2);
            query.set("opreater", poiID);
            query.set("master", poiID);
            query.set('goodsName', that.data.goods[0].goodsName);
            query.set('real_money', Number(that.data.real_money));

            if (that.data.custom.objectId != null) {
              const custom = Bmob_new.Pointer('customs');
              const customID = custom.set(that.data.custom.objectId);
              query.set("custom", customID);
            }

            query.set("all_money", that.data.all_money);
            query.save().then(res => {
              //console.log("添加操作历史记录成功", res);
              wx.removeStorageSync("custom");//移除这个缓存
              wx.showToast({
                title: '产品退货成功',
                icon: 'success',
                success: function () {
                  setTimeout(() => {
                    wx.navigateBack({
                      delta: 2
                    });
                  }, 500)
                }
              })
            })
          }
        }
      },
        function (error) {
          // 批量新增异常处理
          console.log("异常处理");
        });
    },
      function (error) {
        // 批量更新异常处理
        console.log(error);
      });
  },
})