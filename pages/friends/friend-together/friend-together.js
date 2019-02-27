// pages/common/friend-dtl/friend-dtl.js
const Bmob = require('../../../utils/bmob.js')
var config = require('../../../utils/config.js')
var userid = wx.getStorageSync("userid");
var friend = {}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    spinShow: true,
    friend: {},
    firstlyModules: [],
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
          friend: friend,
          spinShow: false
        })
      },
      error: function (object, error) {
        // 查询失败
      }
    });
  },
  
  getauth:function()
  {
    var that = this;
    var auths =[];
    var Diary = Bmob.Object.extend("Friends");
    var query = new Bmob.Query(Diary);
    query.equalTo("userId", wx.getStorageSync("friendId"));
    query.equalTo("friendId", wx.getStorageSync("userid"));
    // 查询所有数据
    query.find({
      success: function (results) {
        console.log(results);
        var stockManager = results[0].get("stockManager");
        var stockSee = results[0].get("stockSee");
        var customList = results[0].get("customList");
        var add_product = results[0].get("add_product");

        if (stockManager == 1)
        {
          auths.push({
            name: '协作入库', icon: '../../../images/index/entering.png',
            url: '/pages/friends/goods_select_fri/goods_select_fri?type=entering'
          },
            {
              name: '协作出库', icon: '../../../images/index/delivery.png',
              url: '/pages/friends/goods_select_fri/goods_select_fri?type=delivery'
            });
        }
        if (stockSee == 1)
        {
          auths.push({name: '他/她的产品', icon: '../../../images/index/goods.png',
          url: '/pages/friends/goods-fri/goods-fri'
          });
        }
        if (customList == 1)
        {
          auths.push({
            name: '她/他的客户', icon: '../../../images/index/customs.png',
            url: '/pages/second/custom/custom?friendId=' + wx.getStorageSync("friendId")
          });
        }
        if (add_product ==1)
        {
          wx.setStorageSync("friend_addproUrl", "../goods-add/goods-add")
        }else{
          wx.removeStorageSync("friend_addproUrl")
        }

        that.setData({
          firstlyModules: auths
        })
      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });
  },

  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
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