// pages/goods/goods-add/goods-add.js
var { $Message } = require('../../../../component/base/index');
const Bmob = require('../../../../utils/bmob_new.js');
var that;
let friendId;
Page({

  /*** 页面的初始数*/
  data: {
    loading: false,
  },

  handleAddCustoms: function (e) {
    //console.log(that.data.custom);
    var goodsForm = e.detail.value
    //先进行表单非空验证
    if (goodsForm.custom_type == null) {
      $Message({
        content: '请输入客户编号',
        type: 'warning',
        duration: 5
      });
    } else if (goodsForm.custom_name == null) {
      $Message({
        content: '请输入客户姓名',
        type: 'warning',
        duration: 5
      });
    } else {
      that.setData({ loading: true });
      const userid = wx.getStorageSync("userid");
      const pointer = Bmob.Pointer('_User');
      var poiID;
      
      if (friendId == null) {poiID = pointer.set(userid);}else{
        poiID = pointer.set(friendId);
      }
      const query = Bmob.Query('customs');
      query.set("custom_type", that.daxie(goodsForm.custom_type));
      query.set("custom_name", goodsForm.custom_name);
      query.set("custom_phone", (goodsForm.custom_phone == null ? "" : goodsForm.custom_phone));
      query.set("custom_address", (goodsForm.custom_address == null ? "" : goodsForm.custom_address));
      query.set("parent", poiID);
      (that.data.custom != null) ? query.set("id", that.data.custom.objectId):null;
      query.save().then(res => {
        that.setData({ loading:false});
        wx.setStorageSync("is_add", true);
        if(that.data.custom !=null)
        {
          wx.showToast({
            title: '修改成功',
          })
        }else{
          wx.showToast({
            title: '添加成功',
          })
          that.setData({ custom:null})
        }
      }).catch(err => {
        console.log(err)
      })
      
    }
  },

  //删除这条记录
  _delete:function()
  {
    wx.showModal({
      title: '提示',
      content: '是否删除此客户',
      success(res) {
        if (res.confirm) {
          const query = Bmob.Query('customs');
          query.destroy(that.data.custom.objectId).then(res => {
            console.log(res)
            wx.showToast({
              title: '删除成功',
              duration: 1000,
              success: function () {
                wx.navigateBack();
                wx.setStorageSync("is_add", true);
              }
            })
          }).catch(err => {
            console.log(err)
          })
        }
      }
    })
  },

  daxie:function(value)
  {
    var value = value.toString();
    return value.toUpperCase()
  },

  //联系他点击
  make_phone:function()
  {
    wx.makePhoneCall({
      phoneNumber: that.data.custom.custom_phone
    })
  },

  //查看来往记录点击
  getmoney_detail:function()
  {
    wx.navigateTo({
      url: '../../../order_history/order_history?custom_id=' + that.data.custom.objectId,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    that = this;
    var id = options.id;
    friendId = options.friendId;
    if(id !=null)
    {
      const query = Bmob.Query('customs');
      query.get(id).then(res => {
        console.log(res)
        that.setData({custom:res,is_modify:true});
      }).catch(err => {
        console.log(err)
      })
    }else{
      that.setData({ is_modify: false})
    }
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