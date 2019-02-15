// pages/common/friend-dtl/friend-dtl.js
const Bmob = require('../../../utils/bmob.js')
var config = require('../../../utils/config.js')
var userid = '';
var friend = {};
var objectId;
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
    var that = this;
    this.setData({
      switchSee: !this.data.switchSee
    });
    that.add_auth('see');
  },

  handleSwitchManager: function () {
    var that = this;
    this.setData({
      switchManager: !this.data.switchManager
    });
    that.add_auth('manager');
  },

  handleswitchcustomList:function()
  {
    var that = this;
    this.setData({
      switchcustomList: !this.data.switchcustomList
    });
    that.add_auth('custom');
  },

  handleswitchaddProducts: function () {
    var that = this;
    this.setData({
      switchaddProducts: !this.data.switchaddProducts
    });
    that.add_auth('addProducts');
  },

  //添加权限功能
  add_auth:function(type)
  {
    var that = this;
    var Diary = Bmob.Object.extend("Friends");
    var query = new Bmob.Query(Diary);
    query.get(objectId, {
      success: function (result) {
        if (type == "manager") {
          if (!that.data.switchManager) {
            result.set('stockManager', 0);
          } else {
            result.set('stockManager', 1);
          }
        } else if (type == "see"){
          if (!that.data.switchSee) {
            result.set('stockSee', 0);
          } else {
            result.set('stockSee', 1);
          }
        } else if (type == "custom"){
          if (!that.data.switchcustomList) {
            result.set('customList', 0);
          } else {
            result.set('customList', 1);
          }
        } else if (type == "addProducts") {
          if (!that.data.switchaddProducts) {
            result.set('add_product', 0);
          } else {
            result.set('add_product', 1);
          }
        }
        result.save();
      },
    });
  },

  //得到权限信息
  getauth:function()
  {
    var that = this;
    var user = wx.getStorageSync("userid");
    var friend = wx.getStorageSync("friendId");
    
    var Diary = Bmob.Object.extend("Friends");
    var query = new Bmob.Query(Diary);
    query.equalTo("userId", user);
    query.equalTo("friendId", friend);
    // 查询所有数据
    query.find({
      success: function (results) {
        console.log(results);
        if(results.length == 0){return};
        objectId = results[0].id;
        var stockManager = results[0].get("stockManager");
        var stockSee = results[0].get("stockSee");
        var customList = results[0].get("customList");
        var add_product = results[0].get("add_product");

        (stockManager == 0)?that.setData({ switchManager: false }):that.setData({ switchManager: true });

        (stockSee == 0)?that.setData({ switchSee: false }):that.setData({ switchSee: true });
        (customList == 0 || customList == null) ? that.setData({ switchcustomList: false }) : that.setData({ switchcustomList: true });
        (add_product == 0 || add_product == null) ? that.setData({ switchaddProducts: false }) : that.setData({ switchaddProducts: true });
      }
    });
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
    query1.find().then(function (todos) {
      return Bmob.Object.destroyAll(todos);
    }).then(function (todos) {
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
              var query3 = new Bmob.Query(Friends);
              query3.equalTo("userId", item.id);
              query3.equalTo("friendId", userid);
              query3.find().then(function (todos) {
                return Bmob.Object.destroyAll(todos);
              }).then(function (todos) {
                wx.showToast({
                  title: '删除好友成功',
                  icon: 'success',
                  success: function () {
                    that.fetchFriendInfo()
                  }
                })
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
    }, function (error) {
      // 异常处理
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
    this.fetchFriendInfo();
    this.getauth();
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