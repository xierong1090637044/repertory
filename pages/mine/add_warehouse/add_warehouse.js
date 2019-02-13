// pages/mine/add_class/add_class.js
const Bmob_new = require('../../../utils/bmob_new.js');
const Bmob = require('../../../utils/bmob.js');
var that;
var userid;
var class_text;
var get_id;
var edit_class_text;
Page({

  /*** 页面的初始数据*/
  data: {

  },

  show_operation: function (e) {
    get_id = e.currentTarget.dataset.id;
    var value = e.currentTarget.dataset.value;
    wx.showActionSheet({
      itemList: ['编辑', '删除','取消'],
      success(res) {
        console.log(res.tapIndex)
        if (res.tapIndex == 0) {
          that.setData({ edit_visible: true, get_class_text: value });
        } else if (res.tapIndex == 1) {
          that.delete_class_text();
        }
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },

  //删除此类别
  delete_class_text: function () {
    wx.showModal({
      title: '提示',
      content: '是否删除此分类',
      success(res) {
        if (res.confirm) {
          const query = Bmob_new.Query('class_user');
          query.destroy(get_id).then(res => {
            console.log(res)
            wx.showToast({ title: '删除成功' });
            that.getclass_list();
          }).catch(err => {
            console.log(err)
          })
        }
      }
    })

  },

  //修改输入框输入
  editclass_text: function (e) {
    edit_class_text = e.detail.detail.value;
  },

  //确定修改
  getclass_text_edit: function () {
    const query = Bmob_new.Query('class_user');
    query.set('id', get_id);//需要修改的objectId
    query.set('class_text', edit_class_text);
    query.save().then(res => {
      console.log(res);
      that.setData({ edit_visible: false });
      wx.showToast({ title: '修改成功' });
      that.getclass_list();
    }).catch(err => {
      console.log(err)
    })
  },

  //处理modal的显示与消失
  add_class: function () {
    that.setData({ visible: true });
  },

  handleClose: function () {
    that.setData({ visible: false, edit_visible: false });
  },

  //输入产品类别事件
  getclass_text: function (e) {
    class_text = e.detail.detail.value;
  },

  //modal点击确定事件
  getclass_text_confrim: function () {
    if (class_text == null || class_text == '') {
      wx.showToast({
        icon: "none",
        title: '请输入仓库名称',
      })
    } else {
      wx.showLoading({ title: '添加中...' });
      const pointer = Bmob_new.Pointer('_User')
      const poiID = pointer.set(userid);

      const query = Bmob_new.Query('class_user');
      query.set("parent", poiID)
      query.set("class_text", class_text);
      query.save().then(res => {
        console.log(res);
        that.setData({ visible: false });
        that.getclass_list();
        wx.hideLoading();
      }).catch(err => {
        console.log(err)
      })
    }

  },

  //得到类别列表
  getclass_list: function () {
    wx.showLoading({ title: '加载中...' })
    const query = Bmob_new.Query("warehouse");
    query.equalTo("parent", "==", userid);
    query.find().then(res => {
      console.log(res);
      wx.hideLoading();
      if (res.length == 0) {
        that.setData({ isEmpty: true });
      } else {
        that.setData({ class_text: res, isEmpty: false });
        wx.setStorageSync("warehouse", res);
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    var currentUser = Bmob.User.current();
    userid = currentUser.id;
    console.log(currentUser.id);
    that.getclass_list();
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