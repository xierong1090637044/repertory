const app = getApp();
const Bmob = require('../../../utils/bmob_new.js');
let that;
let userid;
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    hidden: true,
    producers: [],
    isEmpty: false
  },

  //得到客户列表
  getproducer_list: function (id) {
    wx.showLoading({ title: '加载中...' })

    const query = Bmob.Query("producers");
    query.equalTo("parent", "==", id);
    query.limit(1000);
    query.find().then(res => {
      //console.log(res);
      if (res.length == 0) {
        that.setData({
          isEmpty: true
        });
        wx.hideLoading();
      } else {
        that.setData({
          producers: res,
          isEmpty: false
        });
        wx.hideLoading();
      }
    });
  },

  //搜索
  complete: function (e) {
    wx.showLoading({ title: '加载中...' });

    var name = e.detail.value;
    const query = Bmob.Query("producers");
    (name == '') ? that.getproducer_list() : query.equalTo("producer_name", "==", name);
    query.find().then(res => {
      if (res.length == 0) {
        that.setData({
          isEmpty: true
        });
        wx.hideLoading();
      } else {
        that.setData({
          producers: res,
          isEmpty: false
        });
        wx.hideLoading();
      }
    });
  },

  //点击查看详情
  getdetail: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: ['查看详情'],
      success(res) {
        console.log(res.tapIndex)
        if (res.tapIndex == 0) {
          wx.navigateTo({
            url: 'producer_add/producer_add?id=' + id,
          })
        } else if (res.tapIndex == 1) {
          producer_id = id;
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
      that.setData({ visible: false });
      const query = Bmob.Query('producers');
      query.get(producer_id).then(res => {
        if (res.debt - Number(input_money) < 0) {
          wx.hideLoading();
          wx.showToast({
            icon: "none",
            title: '收款金额过大',
          })
        } else if (res.debt == null || res.debt == 0) {
          wx.hideLoading();
          wx.showToast({
            icon: "none",
            title: '该客户没有欠款',
          })
        }
        else {
          res.set('debt', res.debt - Number(input_money));
          res.save();

          const pointer = Bmob.Pointer('producers');
          const poiID = pointer.set(producer_id);
          const pointer1 = Bmob.Pointer('_User');
          const poiID1 = pointer1.set(wx.getStorageSync("userid"));
          const query = Bmob.Query('debt_history');
          query.set("producer", poiID);
          query.set("master", poiID1)
          query.set("debt_number", Number(input_money))
          query.save().then(res => {
            console.log(res)
            wx.hideLoading();
            that.getproducer_list(userId);
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

    userid = wx.getStorageSync("userid");
    that.getproducer_list(userid);
  },

  onReady() {

  },

  onShow: function () {
    var is_add = wx.getStorageSync("is_add");
    if (is_add) {
      that.getproducer_list(userid);
      wx.removeStorageSync("is_add");
    }
  },

  goto_add: function () {
    wx.navigateTo({
      url: '../producer/producer_add/producer_add',
    })
  },
});