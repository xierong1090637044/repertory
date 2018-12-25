// pages/mine/apply-delivery/apply-bill/apply-bill.js
var { $Message } = require('../../../../component/base/index');
const Bmob = require('../../../../utils/bmob.js')
var config = require('../../../../utils/config.js')
var _ = require('../../../../utils/we-lodash.js');
var userid = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    applyBill:{},
    loading:false,
    num:0,
    remark:'',
    applyNum:0,
    applyRemark:''
  },

  inputNum:function(e){
    var num = e.detail.detail.value
    this.setData({
      applyNum: num
    });
  },
  inputRemark:function(e){
    var remark = e.detail.detail.value
    this.setData({
      applyRemark: remark
    });
  },
  handleSubmit:function(e){
    var that = this
    if (this.data.applyNum > this.data.applyBill.reserve) {
      $Message({
        content: '库存不足,请确认',
        type: 'warning',
        duration: 5
      });
      return
    }
    else if (this.data.applyNum>0){
      that.setData({
        loading: true
      })
      var BillsTemp = Bmob.Object.extend("BillsTemp");
      var GoodsUser = Bmob.Object.extend("User");
      var Goods = Bmob.Object.extend("Goods");
      var billsTemp = new BillsTemp();
      var goodsUser = new GoodsUser();
      var user = new Bmob.User();
      var goods = new Goods();
      user.id = userid;
      goodsUser.id = that.data.applyBill.userid
      goods.id = that.data.applyBill.goodsId
      billsTemp.set("goodsUserId", goodsUser);
      billsTemp.set("goodsId", goods);
      billsTemp.set("applyUserId", user);
      billsTemp.set("applyNum", parseInt(that.data.applyNum));
      billsTemp.set("applyRemark", that.data.applyRemark);
      billsTemp.set("status", 0);
      billsTemp.save(null, {
        success: function (result) {
          that.setData({
            loading: false
          })
          console.log("发起申请出库成功");
          wx.showToast({
            title: '发起申请出库成功',
            icon: 'success',
            success: function () {
              wx.navigateBack()
            }
          })
        },
        error: function (result, error) {
          //发起申请出库失败
          that.setData({
            loading: false
          })
          console.log("发起申请出库失败:" + JSON.stringify(error));
        }
      })
    }else{
      $Message({
        content: '请输入正确的申请出库数量',
        type: 'warning',
        duration: 5
      });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userid = wx.getStorageSync("userid");
    var applyBill = JSON.parse(wx.getStorageSync('applyBill'))
    this.setData({
      applyBill: applyBill
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