const app = getApp();
const Bmob = require('../../../utils/bmob_new.js');
var that;
var input_money;
var custom_id;
var friendId;
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    hidden: true,
    customs:[],
    isEmpty:false,
    spinShow:true,
  },

  //得到客户列表
  getcustom_list:function(id)
  {
    const query = Bmob.Query("customs");
    query.order("custom_type");
    query.equalTo("parent", "==", id);
    query.find().then(res => {
      console.log(res);
      if(res.length == 0)
      {
        that.setData({
          isEmpty: true,
          spinShow:false
        });
      }else{
        that.setData({
          customs: res,
          isEmpty: false,
          spinShow: false
        });
      }
    });
  },

  //搜索
  complete:function(e)
  {
    var name = e.detail.value;
    if(name == '')
    {
      that.getcustom_list();
    }else{
      const query = Bmob.Query("customs");
      query.equalTo("custom_name", "==", name);
      query.order("custom_type");
      query.find().then(res => {
        if (res.length == 0) {
          that.setData({
            isEmpty: true,
            spinShow: false
          });
        } else {
          that.setData({
            customs: res,
            isEmpty: false,
            spinShow: false
          });
        }
      });
    }
  },

  //点击查看详情
  getdetail:function(e)
  {
    if(friendId == null)
    {
      var id = e.currentTarget.dataset.id;
      wx.showActionSheet({
        itemList: ['查看详情', '收款', "收款记录"],
        success(res) {
          console.log(res.tapIndex)
          if (res.tapIndex == 0) {
            wx.navigateTo({
              url: 'custom_add/custom_add?id=' + id,
            })
          } else if (res.tapIndex == 1) {
            custom_id = id;
            that.setData({ visible: true })
          } else if (res.tapIndex == 2) {
            wx.navigateTo({
              url: 'debt_history/debt_history?id=' + id,
            })
          }
        },
        fail(res) {
          console.log(res.errMsg)
        }
      })
    }
    
  },
  
  //输入收款金额事件
  getmoney_number: function (e) {
    input_money = e.detail.detail.value;
  },

  //modal点击确定事件
  handlegetId: function () {
    if (input_money == null || input_money.length == 0) {
      wx.showToast({
        title: '请输入收款金额',
        icon: "none"
      });
    } else {
      wx.showLoading({ title: '加载中...' });
      that.setData({visible:false});
      const query = Bmob.Query('customs');
      query.get(custom_id).then(res => {
        if (res.debt - Number(input_money) < 0)
        {
          wx.hideLoading();
          wx.showToast({
            icon:"none",
            title: '收款金额过大',
          })
        } else if (res.debt == null || res.debt == 0 )
        {
          wx.hideLoading();
          wx.showToast({
            icon: "none",
            title: '该客户没有欠款',
          })
        }
        else{
          res.set('debt', res.debt - Number(input_money));
          res.save();

          const pointer = Bmob.Pointer('customs');
          const poiID = pointer.set(custom_id);
          const pointer1 = Bmob.Pointer('_User');
          const poiID1 = pointer1.set(wx.getStorageSync("userid"));
          const query = Bmob.Query('debt_history');
          query.set("custom", poiID);
          query.set("master", poiID1)
          query.set("debt_number", Number(input_money))
          query.save().then(res => {
            console.log(res)
            wx.hideLoading();
            that.getcustom_list();
            wx.showToast({
              title: '收款成功',
            });
          }).catch(err => {
            console.log(err)
          })
        }

      }).catch(err => {
        console.log(err)
      })
    }
  },

  //modal点击取消事件
  handleClose: function () {
    that.setData({ visible: false })
  },

  onLoad(options) {
    that = this;

    friendId = options.friendId;
    if(friendId != null)
    {
      that.getcustom_list(friendId);
    }else{
      var userid = wx.getStorageSync("userid");
      that.getcustom_list(userid);
    }
  },

  onReady() {
    
  },

  onShow:function()
  {
    var is_add = wx.getStorageSync("is_add");
    if(is_add)
    {
      that.getcustom_list(wx.getStorageSync("userid"));
      wx.removeStorageSync("is_add");
    }
  },

  goto_add:function()
  {
    if(friendId == null)
    {
      wx.navigateTo({
        url: 'custom_add/custom_add',
      })
    }else{
      wx.showToast({
        title: '您无权添加',
        icon:"none"
      })
    }
    
  },
});