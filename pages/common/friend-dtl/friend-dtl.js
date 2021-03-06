// pages/common/friend-dtl/friend-dtl.js
const Bmob = require('../../../utils/bmob.js')
var config = require('../../../utils/config.js')
var userid = '';
var friend = {}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    spinShow: true,
    friend: {},
    flag: -1,
    switchSee: false,
    switchManager: false
  },
  handleAddFriend: function (e) {
    var that = this
    var friendId = e.currentTarget.dataset.friendid
    var FriendsTemp = Bmob.Object.extend("FriendsTemp");
    var FriendUser = Bmob.Object.extend("User");
    var friendsTemp = new FriendsTemp();
    var user = new Bmob.User();
    var friend = new FriendUser();
    user.id = userid;
    friend.id = friendId;
    friendsTemp.set("userId", user);
    friendsTemp.set("friendId", friend);
    friendsTemp.set("status", 0);
    friendsTemp.save(null, {
      success: function (result) {
        wx.showToast({
          title: '发起好友申请成功',
          icon: 'none',
          success: function () {
            that.setData({
              flag: 0
            })
          }
        })
      },
      error: function (result, error) {
        console.log("发起好友申请失败:" + JSON.stringify(error));
      }
    })
  },
  handleSwitchSee: function () {
    this.setData({
      switchSee: !this.data.switchSee
    })
  },
  handleSwitchManager: function () {
    this.setData({
      switchManager: !this.data.switchManager
    })
  },
  handleCheckIsAdd: function () {
    var that = this
    var FriendsTemp = Bmob.Object.extend("FriendsTemp");
    // var query = new Bmob.Query(FriendsTemp);
    // query.equalTo("userId", userid);
    // query.equalTo("friendId",friend.id);

    var query1 = new Bmob.Query(FriendsTemp);
    query1.equalTo("userId", userid);
    query1.equalTo("friendId", friend.id);

    var query2 = new Bmob.Query(FriendsTemp);
    query2.equalTo("friendId", userid);
    query2.equalTo("userId", friend.id);
    var mainQuery = Bmob.Query.or(query1, query2);

    mainQuery.first({
      success: function (result) {
        console.log(result)
        if (result == undefined) {
          that.setData({
            flag: -1,
            spinShow: false
          })
        } else {
          that.setData({
            flag: result.get("status"),
            spinShow: false
          })
        }
      },
      error: function (object, error) {
        // 查询失败
      }
    });
  },
  handleFriendDel: function (e) {
    var that = this
    var item = e.currentTarget.dataset.item
    var Friends = Bmob.Object.extend("Friends");
    var query1 = new Bmob.Query(Friends);
    query1.equalTo("userId", userid);
    query1.equalTo("friendId", item.id);
    var query2 = new Bmob.Query(Friends);
    query2.equalTo("userId", item.id);
    query2.equalTo("friendId", userid);
    var mainQuery = Bmob.Query.or(query1, query2);
    mainQuery.first({
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
                object.destroy({
                  success: function (deleteObject) {
                    wx.showToast({
                      title: '删除好友成功',
                      icon: 'success',
                      success: function () {
                        that.fetchFriendInfo()
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
  },
  fetchFriendInfo: function () {
    var that = this
    var User = Bmob.Object.extend("_User");
    var query = new Bmob.Query(User);
    query.get(wx.getStorageSync('friendId'), {
      success: function (result) {
        friend.id = result.id
        friend.username = result.get("username")
        friend.avatarUrl = result.get("avatarUrl")
        friend.sex = result.get("sex")
        that.setData({
          friend: friend
        })
        that.handleCheckIsAdd()
      },
      error: function (object, error) {
        // 查询失败
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userid = wx.getStorageSync("userid");
    this.fetchFriendInfo()
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