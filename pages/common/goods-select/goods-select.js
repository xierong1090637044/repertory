// pages/common/goods-select/goods-select.js
const Bmob = require('../../../utils/bmob.js')
var config = require('../../../utils/config.js')
var _ = require('../../../utils/we-lodash.js');
var { $Message } = require('../../../component/base/index');
var userid = '';
var curModule = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    spinShow: true,
    current: [],
    currGoods: [],
    goods: [],
    totalGoods: [],
    isEmpty: true,
    // 搜索
    inputShowed: false,
    inputVal: ""
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
      inputVal: "",
      goods: this.data.totalGoods
    });

  },
  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value
    });
  },
  searchAction: function (e) {
    var that = this;
    var inputVal = this.data.inputVal
    var filterGoods = _.chain(that.data.goods)
      .filter(function (res) {
        return res.goodsName.match(new RegExp(inputVal));
      })
      .map(function (res) {
        return res;
      })
      .value();
    that.setData({
      goods: filterGoods
    })
  },
  // /.搜索
  link2page: function () {
    if (this.data.currGoods.length < 1) {
      $Message({
        content: '未选择产品，请确认',
        type: 'warning',
        duration: 5
      });
    } else {
      wx.setStorageSync('currGoods', this.data.currGoods)
      var url = ''
      if (curModule =='entering'){
        url = '/pages/entering/entering'
      }
      else if (curModule == 'delivery'){
        url = '/pages/delivery/delivery'
      }
      wx.navigateTo({
        url: url
      })
    }
  },
  handleCheckChange({ detail = {} }) {
    var that = this
    //取到当前点击的值
    var checkGoods = _.chain(that.data.goods)
      .filter(function (res) {
        return res.goodsName == detail.value;
      })
      .map(function (res) {
        return res;
      })
      .first()
      .value();
    var currIdx = this.data.current.indexOf(detail.value);
    var currGoodsIdx = _.findIndex(this.data.currGoods, checkGoods);
    currIdx === -1 ? this.data.current.push(detail.value) : this.data.current.splice(currIdx, 1);
    currGoodsIdx === -1 ? this.data.currGoods.push(checkGoods) : this.data.currGoods.splice(currGoodsIdx, 1);
    this.setData({
      current: this.data.current,
      currGoods: this.data.currGoods
    });
  },

  loadGoods: function () {
    var that = this;
    var Goods = Bmob.Object.extend("Goods");
    var query = new Bmob.Query(Goods);
    query.equalTo("userId", userid);
    query.descending("createdAt"); //按照时间降序
    query.include("userId");
    query.limit(10000)
    query.find({
      success: function (res) {
        var tempGoodsArr = new Array();
        for (var i = 0; i < res.length; i++) {
          that.setData({
            isEmpty: false
          })
          var tempGoods = {}
          tempGoods.goodsId = res[i].id || '';
          tempGoods.goodsName = res[i].get("goodsName") || '';
          tempGoods.regNumber = res[i].get("regNumber") || '';
          tempGoods.producer = res[i].get("producer") || '';
          tempGoods.productCode = res[i].get("productCode") || '';
          tempGoods.packageContent = res[i].get("packageContent") || '';
          tempGoods.packingUnit = res[i].get("packingUnit") || '';
          tempGoods.reserve = res[i].get("reserve") || 0;
          tempGoods.costPrice = res[i].get("costPrice") || 0;
          tempGoods.retailPrice = res[i].get("retailPrice") || 0;
          tempGoods.num = 0;
          tempGoodsArr.push(tempGoods);
        }
        that.handleData(tempGoodsArr);
        setTimeout(() => {
          wx.hideLoading();
        }, 1000);
      }
    })
  },
  //数据存储
  handleData: function (data) {
    //设置数据
    data = data || [];
    this.setData({
      goods: data,
      totalGoods: data,
      spinShow: false
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userid = wx.getStorageSync("userid")
    curModule = options.type
    this.loadGoods()
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
    this.setData({
      current: [],
      currGoods: []
    });
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