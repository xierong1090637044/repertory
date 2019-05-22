// pages/index/index.js
let langue = require('../../utils/langue.js');
const Bmob = require('../../utils/bmob_new.js');
let that;
let userid;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    optionsLists: [{ name:"产品入库", icon: '../../images/index/entering.png', url: '/pages/common/goods-select/goods-select?type=entering' },
    { name: '产品出库', icon: '../../images/index/delivery.png', url: '/pages/common/goods-select/goods-select?type=delivery' },
    { name: '退货入库', icon: '../../images/index/return_goods.png', url: '/pages/common/goods-select/goods-select?type=returing' },
    { name: '库存盘点', icon: '../../images/index/stocking.png', url: '/pages/common/goods-select/goods-select?type=counting' },
    {name: '产品管理', icon: '../../images/index/goods.png',url: '/pages/goods/goods'},
    { name: '仓库管理', icon: '../../images/index/canvas.png', url: '/pages/second/stocks/stocks' },
    {name: '客户管理', icon: '../../images/index/customs.png',url: '/pages/second/custom/custom'},
    { name: '供货商管理', icon: '../../images/index/mine.png', url: '/pages/second/producer/producer'},
    {name: '协同管理', icon: '../../images/index/togeter.png', url: '/pages/friends/friends' },
    {name: '盈收记录', icon: '../../images/index/stock.png',url: '/pages/detail_finance/detail_finance'},
    {name: '操作记录', icon: '../../images/index/order_history.png',url: '/pages/order_history/order_history'},
    {name: '财务报表', icon: '../../images/index/finance.png',url: '/pages/finance/finance'},
    
    ],
  },

  //得到今日概况
  gettoday_detail: function () {
    let get_reserve = 0;
    let out_reserve = 0;
    let get_reserve_real_money = 0;
    let out_reserve_real_money = 0;
    let get_reserve_num = 0;
    let out_reserve_num = 0;

    const query = Bmob.Query("Bills");
    query.equalTo("userId", "==", wx.getStorageSync("userid"));
    query.equalTo("createdAt", ">=", that.getDay(0));
    query.equalTo("createdAt", "<=", that.getDay(1));

    query.include("goodsId");
    query.find().then(res => {
      for (var i = 0; i < res.length; i++) {
        if (res[i].type == 1) {
          get_reserve = get_reserve + res[i].num;
          get_reserve_real_money = get_reserve_real_money + res[i].num * res[i].goodsId.retailPrice;
          get_reserve_num = get_reserve_num + res[i].total_money;
        } else if (res[i].type == -1) {
          out_reserve = out_reserve + res[i].num;
          out_reserve_real_money = out_reserve_real_money + res[i].num * res[i].goodsId.costPrice;
          out_reserve_num = out_reserve_num + res[i].total_money;
        }
      }

      that.setData({
        spinShow: true,
        get_reserve: get_reserve.toFixed(wx.getStorageSync("print_setting").show_float),
        out_reserve: out_reserve.toFixed(wx.getStorageSync("print_setting").show_float),
        get_reserve_real_money: get_reserve_real_money,
        out_reserve_real_money: out_reserve_real_money,
        get_reserve_num: get_reserve_num.toFixed(wx.getStorageSync("print_setting").show_float),
        out_reserve_num: out_reserve_num,
        get_reserve_get_num: (get_reserve_real_money - get_reserve_num).toFixed(wx.getStorageSync("print_setting").show_float),
        out_reserve_get_num: out_reserve_num - out_reserve_real_money,
      });

    });
  },

  //得到总库存数和总金额
  loadallGoods: function () {
    var total_reserve = 0;
    var total_money = 0;
    const query = Bmob.Query("Goods");
    query.equalTo("userId", "==", userid);
    query.limit(500);
    query.find().then(res => {
      for (var i = 0; i < res.length; i++) {
        total_reserve = total_reserve + res[i].reserve;
        total_money = total_money + res[i].reserve * res[i].costPrice;
        if (i == (res.length - 1) && res.length == 500)
        {
          const query = Bmob.Query("Goods");
          query.equalTo("userId", "==", wx.getStorageSync("userid"));
          query.skip(500);
          query.limit(500);
          query.find().then(res => {
            for (var i = 0; i < res.length; i++) {
              total_reserve = total_reserve + res[i].reserve;
              total_money = total_money + res[i].reserve * res[i].costPrice;
            }
          })
          that.setData({ total_reserve: total_reserve, total_money: total_money, total_products: res.length });
        } else { that.setData({ total_reserve: total_reserve.toFixed(wx.getStorageSync("print_setting").show_float), total_money: total_money.toFixed(wx.getStorageSync("print_setting").show_float), total_products: res.length });}
      }
      
    });
  },

  //点击扫描产品条形码
  scan_code: function () {
    wx.showActionSheet({
      itemList: ['扫码出库', '扫码入库', '扫码盘点', '扫码添加产品', '查看详情'],
      success(res) {
        that.scan(res.tapIndex);
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },

  //扫码操作
  scan: function (type) {
    wx.scanCode({
      success(res) {
        var result = res.result;
        var array = result.split("-");

        if (type == 0) {
          wx.navigateTo({
            url: '../delivery/delivery?id=' + array[0] + "&type=" + array[1],
          })
        } else if (type == 1) {
          wx.navigateTo({
            url: '../entering/entering?id=' + array[0] + "&type=" + array[1],
          })
        } else if (type == 2) {
          wx.navigateTo({
            url: '../counting/counting?id=' + array[0] + "&type=" + array[1],
          })
        } else if (type == 3) {
          wx.navigateTo({
            url: '../goods/goods-add/goods-add?id=' + array[0],
          })
        } else if (type == 4) {
          wx.navigateTo({
            url: '../common/goods-dtl/goods-dtl?id=' + array[0] + "&type=" + array[1],
          })
        }
      },
      fail(res) {
        wx.showToast({
          title: '未识别到条形码',
          icon: "none"
        })
      }
    })
  },

  /** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    that = this;
    userid = wx.getStorageSync("userid");

    that.getnum_from_bmob();

    //console.log(langue)
  },

  /*** 生命周期函数--监听页面初次渲染完成*/
  onReady: function () {
  },

  /*** 生命周期函数--监听页面显示*/
  onShow: function () {
    that.gettoday_detail();
    that.loadallGoods();
  },

  /*** 生命周期函数--监听页面隐藏*/
  onHide: function () {

  },

  /*** 生命周期函数--监听页面卸载*/
  onUnload: function () {

  },

  /*** 页面相关事件处理函数--监听用户下拉动作*/
  onPullDownRefresh: function () {

  },

  /*** 页面上拉触底事件的处理函数*/
  onReachBottom: function () {

  },

  /*** 用户点击右上角分享*/
  onShareAppMessage: function () {

  },

  getDay: function (day) {
    var that = this;
    var today = new Date();
    var targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
    today.setTime(targetday_milliseconds);
    var tYear = today.getFullYear();
    var tMonth = today.getMonth();
    var tDate = today.getDate();
    tMonth = that.handleMonth(tMonth + 1);
    tDate = that.handleMonth(tDate);
    return tYear + "-" + tMonth + "-" + tDate + " " + "00:00:00";
  },

  handleMonth: function (month) {
    var m = month;
    if (month.toString().length == 1) {
      m = "0" + month;
    }
    return m;
  },


  skip: function () {
    wx.navigateTo({
      url: '../mine/upgrade/upgrade',
    })
  },

  //得到数据从Bmob
  getnum_from_bmob: function () {
    const query = Bmob.Query("setting");
    query.equalTo("parent", "==", userid);
    query.find().then(res => {
      if (res.length == 1) {
        wx.setStorageSync("print_setting", res[0])
        that.setData({
          value: res[0],
        })
      }
    });
  },
})