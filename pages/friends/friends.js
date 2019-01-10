// pages/mine/friends/friends.js
const Bmob = require('../../utils/bmob.js')
var config = require('../../utils/config.js')
var _ = require('../../utils/we-lodash.js');
var userid = '';
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
    inputVal: ""
  },

  /*handleFriendDtl:function(e){
    var friendId = e.currentTarget.dataset.friendid
    wx.setStorageSync('friendId', friendId)
    wx.navigateTo({
      url: '/pages/common/friend-dtl/friend-dtl'
    })
  },*/

  handleFriendAuth: function (e) {
    var friendId = e.currentTarget.dataset.friendid
    wx.setStorageSync('friendId', friendId)
    wx.navigateTo({
      url: '/pages/common/friend-together/friend-together'
    })
  },

  handleFriendDel: function (e) {
    var that = this;
    var item = e.currentTarget.dataset.item;
    wx.showModal({
      title: '提示',
      content: '是否删除该好友',
      success(res) {
        if (res.confirm) {
          var Friends = Bmob.Object.extend("Friends");
          var query = new Bmob.Query(Friends);
          query.get(item.id, {
            success: function (object) {
              object.destroy({
                success: function (deleteObject) {
                  var FriendsTemp = Bmob.Object.extend("FriendsTemp");
                  var query1 = new Bmob.Query(FriendsTemp);
                  query1.equalTo("userId", userid);
                  query1.equalTo("friendId", item.friendId);
                  var query2 = new Bmob.Query(FriendsTemp);
                  query2.equalTo("userId", item.friendId);
                  query2.equalTo("friendId", userid);
                  var mainQuery = Bmob.Query.or(query1, query2);
                  mainQuery.first({
                    success: function (object) {
                      console.log(object)
                      object.destroy({
                        success: function (deleteObject) {
                          wx.showToast({
                            title: '删除好友成功',
                            icon: 'success',
                            success: function () {
                              that.handleRefresh()
                            }
                          })
                        },
                        error: function (object, error) {
                          console.log('删除失败');
                        }
                      });
                    },
                    error: function (error) {
                      console.log("查询失败: " + error.code + " " + error.message);
                    }
                  });
                },
                error: function (object, error) {
                  console.log('删除失败');
                }
              });
            },
            error: function (object, error) {
              console.log("query object fail");
            }
          });
        }
      }
    })
  },

  handleAddFriend:function(){
    wx.scanCode({
      onlyFromCamera: false,
      scanType: ['qrCode'],
      success: (res) => {
        var friendId = res.result
        var User = Bmob.Object.extend("_User");
        var query = new Bmob.Query(User);
        wx.setStorageSync('friendId', friendId)
        wx.navigateTo({
          url: '/pages/common/friend-dtl/friend-dtl'
        })
      }
    })
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

    var query2 = new Bmob.Query(Friends);
    query2.equalTo("friendId", userid);
    var mainQuery = Bmob.Query.or(query1, query2);
    mainQuery.limit(that.data.limitPage);
    mainQuery.skip(that.data.limitPage * that.data.currentPage);
    mainQuery.descending("createdAt"); //按照时间降序
    mainQuery.include("userId");
    mainQuery.include("friendId");
    mainQuery.find({
      success: function (res) {
        var tempFriendArr = new Array();
        for (var i = 0; i < res.length; i++) {
          var tempFriend = {}
          if (userid == res[i].get("userId").objectId) {
            tempFriend.friendId = res[i].get("friendId").objectId;
            tempFriend.userName = res[i].get("friendId").username;
            tempFriend.avatarUrl = res[i].get("friendId").avatarUrl;
          } else {
            tempFriend.friendId = res[i].get("userId").objectId;
            tempFriend.userName = res[i].get("userId").username;
            tempFriend.avatarUrl = res[i].get("userId").avatarUrl;
          }
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
      // if (that.data.endPage != 0) { //如果最后一页的加载不等于0
      //   that.setData({
      //     limitPage: that.data.endPage,
      //   })
      // }
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
    var query2 = new Bmob.Query(Friends);
    query2.equalTo("friendId", userid);
    var mainQuery = Bmob.Query.or(query1, query2);
    mainQuery.limit(1000)
    mainQuery.include("userId");
    mainQuery.include("friendId");
    mainQuery.find({
      success: function (res) {
        console.log(res)
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
          if (userid == res[i].get("userId").objectId) {
            tempFriend.friendId = res[i].get("friendId").objectId;
            tempFriend.userName = res[i].get("friendId").username;
            tempFriend.avatarUrl = res[i].get("friendId").avatarUrl;
          } else {
            tempFriend.friendId = res[i].get("userId").objectId;
            tempFriend.userName = res[i].get("userId").username;
            tempFriend.avatarUrl = res[i].get("userId").avatarUrl;
          }
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
        console.log("【我的产品】【共有" + count + "条记录】 " + "【共有" + totalPage + "页】" + " 【最后一页加载" + endPage + "条】");
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userid = wx.getStorageSync("userid");
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
    this.handleRefresh();
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