// pages/mine/approve/approve-dtl/approve-dtl.js
var { $Message } = require('../../../../component/base/index');
const Bmob = require('../../../../utils/bmob.js')
const config = require('../../../../utils/config.js')
var _ = require('../../../../utils/we-lodash.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    packingUnits: config.units,
    approve: {},
    approveRemark: ''
  },
  inputRemark: function (e) {
    var remark = e.detail.detail.value
    this.setData({
      approveRemark: remark
    });
  },
  //审核通过
  handleVia: function () {
    var that = this
    wx.showModal({
      title: '提示',
      content: '是否给予审核通过？',
      success: function (res) {
        if (res.confirm) {
          var BillsTemp = Bmob.Object.extend("BillsTemp");
          var query = new Bmob.Query(BillsTemp);
          var billsTempId = that.data.approve.id
          query.get(billsTempId, {
            success: function (result) {
              if (that.data.approve.applyNum > that.data.approve.reserve){
                wx.showToast({
                  title: '库存不足,请确认',
                  icon: 'none'
                })
                return
              }
              result.set('status', 1);
              result.set('approveRemark', that.data.approveRemark)
              result.save();
              console.log("审核成功");
              that.handleUpdateApplyUserReserve(function(){
                that.handleUpdateReserve(function(){
                  wx.showToast({
                    title: '审核成功',
                    icon: 'success',
                    success: function () {
                      wx.navigateBack()
                    }
                  })
                })
              })
            },
            error: function (object, error) {
              console.log("审核失败");
            }
          });
        }
      }
    })
  },
  handleUpdateReserve: function (_callback) {//更新我的库存
    var that = this
    var Goods = Bmob.Object.extend("Goods");
    var query = new Bmob.Query(Goods);
    var goodsId = that.data.approve.goodsId
    query.get(goodsId, {
      success: function (result) {
        var reserve = result.get('reserve') - that.data.approve.applyNum
        result.set('reserve', reserve);
        result.save();
        _callback()
      },
      error: function (object, error) {
        console.log("更新我的库存失败")
      }
    });
  },
  handleUpdateApplyUserReserve:function(_callback){//更新申请者库存
    var that = this
    var Goods = Bmob.Object.extend("Goods");
    var goods = new Goods();
    var user = new Bmob.User();
    user.id = that.data.approve.applyUserId;
    //判断产品是否已存在
    var query = new Bmob.Query(Goods);
    query.equalTo("goodsName", that.data.approve.goodsName);
    query.equalTo("userId", user);
    query.find({
      success: function (results) {
        if (results.length > 0) {
          var reserve = results[0].get('reserve') + that.data.approve.applyNum
          results[0].set('reserve', reserve);
          results[0].save();
        } else {
          // 添加产品
          goods.set("userId", user);
          goods.set("goodsName", that.data.approve.goodsName);
          goods.set("regNumber", that.data.approve.regNumber);
          goods.set("producer", that.data.approve.producer);
          goods.set("productCode", that.data.approve.productCode);
          goods.set("packageContent", that.data.approve.packageContent);
          goods.set("costPrice", that.data.approve.costPrice);
          goods.set("retailPrice", that.data.approve.retailPrice);
          goods.set("packingUnit", that.data.approve.packingUnit);
          goods.set("reserve", that.data.approve.applyNum);
          goods.save(null, {
            success: function (result) {
              console.log("申请者产品新增成功");
            },
            error: function (result, error) {
              console.log("申请者产品新增失败:" + error);
            }
          })
        }
        _callback()
      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    })
  },
  //审核不通过
  handleFail:function(){
    var that = this
    wx.showModal({
      title: '提示',
      content: '是否给予审核不通过？',
      success: function (res) {
        if (res.confirm) {
          var BillsTemp = Bmob.Object.extend("BillsTemp");
          var query = new Bmob.Query(BillsTemp);
          var billsTempId = that.data.approve.id
          query.get(billsTempId, {
            success: function (result) {
              result.set('status', -1);
              result.set('approveRemark', that.data.approveRemark)
              result.save();
              console.log("审核成功");
              wx.showToast({
                title: '审核成功',
                icon: 'success',
                success: function () {
                  wx.navigateBack()
                }
              })
            },
            error: function (object, error) {
              console.log("审核失败");
            }
          });
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var item = JSON.parse(wx.getStorageSync('item'))
    this.setData({
      approve: item
    })
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