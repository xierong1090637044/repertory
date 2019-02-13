// pages/mine/friends/friends.js
const Bmob = require('../../utils/bmob.js');
const Bmob_new = require('../../utils/bmob_new.js')
var config = require('../../utils/config.js')
var _ = require('../../utils/we-lodash.js');
var userid = '';
var staffId;
var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    spinShow: true,
    friends: [],
    currentPage: 0, //要跳过查询的页数
    limitPage: config.pageSize,//首先显示3条数据（之后加载时都增加3条数据，直到再次加载不够3条）
    isEmpty: true, //当前查询出来的数据是否为空
    isEnd: false, //是否到底了
    // 搜索
    inputShowed: false,
    inputVal: "",
    visible:false
  },

  handleFriendDtl:function(e){
    wx.showLoading({title: '加载中...'});
    var friendId = e.currentTarget.dataset.friendid
    wx.setStorageSync('friendId', friendId)
    wx.navigateTo({
      url: '/pages/friends/friend-dtl/friend-dtl'
    });
    wx.hideLoading();
  },

  handleFriendAuth: function (e) {
    wx.showLoading({ title: '加载中...' })
    var friendId = e.currentTarget.dataset.friendid
    wx.setStorageSync('friendId', friendId)
    wx.navigateTo({
      url: '/pages/friends/friend-together/friend-together'
    });
    wx.hideLoading();
  },

  handleAddFriend:function(){
    wx.showActionSheet({
      itemList: ['搜索账号添加', '扫码添加'],
      success(res) {
        console.log(res.tapIndex)
        if (res.tapIndex == 1)
        {
          wx.scanCode({
            onlyFromCamera: false,
            scanType: ['qrCode'],
            success: (res) => {
              var friendId = res.result
              wx.setStorageSync('friendId', friendId)
              wx.navigateTo({
                url: '/pages/friends/friend-dtl/friend-dtl'
              })
            }
          })
        }else{
          that.setData({ visible:true});
        }
      },
      fail(res) {
        console.log(res.errMsg)
      }
    });
  },

  //输入员工id事件
  getstaffId:function(e)
  {
    staffId = e.detail.detail.value;
  },

  //modal点击确定事件
  handlegetId:function()
  {
    if (staffId == null || staffId.length == 0) {
      wx.showToast({
        title: '请输入Id',
        icon: "none"
      });
    } else {
      wx.showLoading({ title: '加载中...' });
      const query = Bmob_new.Query('_User');
      query.get(staffId).then(res => {
        wx.hideLoading();
        wx.setStorageSync('friendId', staffId);
        wx.navigateTo({
          url: '/pages/friends/friend-dtl/friend-dtl'
        })
      }).catch(err => {
        wx.hideLoading();
        wx.showToast({
          title: '查无此人',
          icon: "none"
        });
      })
    }
  },

  //modal点击取消事件
  handleClose:function(){
    that.setData({ visible:false})
  },


  loadFriends: function () {
    const query = Bmob_new.Query("_User");
    query.equalTo("matserId", "==", userid);
    query.order("createdAt");
    query.include('matserId', '_User');
    query.find().then(res => {
      console.log(res)
      if (res.length > 0) {
        that.setData({ spinShow: false, staff: res, isEmpty: false })
      }
    });
  },


  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    userid = wx.getStorageSync("userid");
    that = this;

    this.loadFriends()
  },

  /*** 生命周期函数--监听页面初次渲染完成*/
  onReady: function () {
  
  },

  /*** 生命周期函数--监听页面显示*/
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
  
  },
 })