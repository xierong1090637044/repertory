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
    wx.setStorageSync('friendId', friendId);
    wx.setStorageSync('friendopenid', e.currentTarget.dataset.openid)
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

  // 搜索
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
    this.handleResetData()
    this.loadFriendsAll()
    this.loadFriends()
  },
  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value
    });
  },
  searchAction: function (e) {
    var that = this;
    var inputVal = this.data.inputVal
    var filterFriends = _.chain(that.data.totalFriends)
      .filter(function (res) {
        return res.userName.match(new RegExp(inputVal));
      })
      .map(function (res) {
        return res;
      })
      .value();
    var isEmpty = true
    if (filterFriends.length) {
      isEmpty = false
    }
    that.setData({
      friends: filterFriends,
      isEmpty: isEmpty,
      isEnd: !isEmpty
    })
  },
	// /.搜索
  loadFriends: function () {
    var that = this;
    var Friends = Bmob.Object.extend("Friends");
    var query1 = new Bmob.Query(Friends);
    query1.equalTo("userId", userid);
    query1.limit(that.data.limitPage);
    query1.skip(that.data.limitPage * that.data.currentPage);
    query1.descending("createdAt"); //按照时间降序
    query1.include("userId");
    query1.include("friendId");
    query1.find({
      success: function (res) {
        var tempFriendArr = new Array();
        for (var i = 0; i < res.length; i++) {
          var tempFriend = {}
          tempFriend.friendId = res[i].get("friendId").objectId;
          tempFriend.openid = res[i].get("friendId").openid;
          tempFriend.userName = res[i].get("friendId").username;
          tempFriend.avatarUrl = res[i].get("friendId").avatarUrl;
          tempFriend.id = res[i].id || '';
          tempFriend.status = res[i].get("status") || 0;
          tempFriendArr.push(tempFriend);
        }
        console.log(tempFriendArr)
        that.handleData(tempFriendArr);
      }
    })
  },
  //加载下一页
  loadMore: function () {
    var that = this;
    wx.showLoading({
      title: '正在加载',
      mask: true
    });
    //一秒后关闭加载提示框
    setTimeout(function () {
      wx.hideLoading()
    }, 1000)

    that.setData({
      currentPage: that.data.currentPage + 1
    });
    //先判断是不是最后一页
    if (that.data.currentPage + 1 == that.data.totalPage) {
      that.setData({
        isEnd: true
      })
      this.loadFriends();
    } else {
      this.loadFriends();
    }
  },
  loadFriendsAll: function () {
    var that = this;
    var Friends = Bmob.Object.extend("Friends");
    var query1 = new Bmob.Query(Friends);
    query1.equalTo("userId", userid);
    query1.limit(1000)
    query1.include("userId");
    query1.include("friendId");
    query1.find({
      success: function (res) {
        //console.log(res)
        var count = res.length;
        var totalPage = 0;
        var endPage = 0;
        if (count == 0) {
          that.setData({
            isEmpty: true
          })
        }
        else if (count % that.data.limitPage == 0) {
          totalPage = parseInt(count / that.data.limitPage);
          if (totalPage == 1) {
            that.setData({
              isEnd: true,
              isEmpty: false
            })
          }
        } else {
          var lowPage = parseInt(count / that.data.limitPage);
          totalPage = lowPage + 1;
          if (lowPage == 0) {
            that.setData({
              isEnd: true,
              isEmpty: false
            })
          } else {
            endPage = count - (lowPage * that.data.limitPage);
          }
        }

        var tempFriendArr = new Array();
        for (var i = 0; i < res.length; i++) {
          that.setData({
            isEmpty: false
          })
          var tempFriend = {}
          tempFriend.friendId = res[i].get("friendId").objectId;
          tempFriend.userName = res[i].get("friendId").username;
          tempFriend.openid = res[i].get("friendId").openid;
          tempFriend.avatarUrl = res[i].get("friendId").avatarUrl;
          tempFriend.id = res[i].id || '';
          tempFriend.status = res[i].get("status") || 0;
          tempFriendArr.push(tempFriend);
        }
        //that.handleData(tempGoodsArr);
        that.setData({
          totalCount: count,
          endPage: endPage,
          totalPage: totalPage,
          totalFriends: tempFriendArr || [],
          spinShow: false
        })
      }
    })
  },
  //数据存储
  handleData: function (data) {
    let page = this.data.currentPage + 1;
    //设置数据
    data = data || [];
    this.setData({
      friends: page === 1 || page === undefined ? data : this.data.friends.concat(data),
    });
  },

  //重置
  handleResetData: function () {
    this.setData({
      currentPage: 0,
      limitPage: config.pageSize,
      friends: [],
      isEnd: false,
      isEmpty: true,
      spinShow: true
    })
  },

  handleRefresh: function () {
    this.handleResetData()
    this.loadFriendsAll()
    this.loadFriends()
  },
  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    userid = wx.getStorageSync("userid");
    that = this;
    this.handleRefresh();
  },

  /*** 生命周期函数--监听页面初次渲染完成*/
  onReady: function () {
  
  },

  /*** 生命周期函数--监听页面显示*/
  onShow: function () {
    
  },

 })