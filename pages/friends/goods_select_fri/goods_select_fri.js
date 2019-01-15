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
    isEmpty: false,
    // 搜索
    inputShowed: false,
    inputVal: "",
    currenttab: '1',
    length: null,
  },

  //tab改变事件
  handleChange({ detail }) {
    var that = this;
    this.setData({
      currenttab: detail.key,
      type: true
    });
    if (detail.key == 1) {
      that.loadGoods(true);
      this.setData({
        type: true
      });
    } else {
      that.loadGoods(false);
      this.setData({
        type: false
      });
    }
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
    that.loadGoods(that.data.type, inputVal);
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
      if (curModule == 'entering') {
        url = '/pages/entering/entering?type=friend'
      }
      else if (curModule == 'delivery') {
        url = '/pages/delivery/delivery?type=friend'
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

  loadGoods: function (type, content) {
    var that = this;
    that.setData({ spinShow: true });
    var Goods = Bmob.Object.extend("Goods");
    var query = new Bmob.Query(Goods);
    query.equalTo("userId", userid);
    if (type) {
      query.greaterThan("reserve", 0);//库存充足
    } else {
      query.lessThanOrEqualTo("reserve", 0);//库存紧张
    }

    if (content != null) query.equalTo("goodsName", { "$regex": "" + content + ".*" });
    query.ascending("goodsName"); //按照货物名字
    query.include("userId");
    query.find({
      success: function (res) {
        var tempGoodsArr = new Array();
        for (var i = 0; i < res.length; i++) {
          var tempGoods = {}
          tempGoods.userid = userid || '';
          tempGoods.userName = res[i].get("userId").username || '';
          tempGoods.avatarUrl = res[i].get("userId").avatarUrl || '';
          tempGoods.goodsId = res[i].id || '';
          tempGoods.goodsName = res[i].get("goodsName") || '';
          tempGoods.goodsIcon = res[i].get("goodsIcon") || '';
          tempGoods.regNumber = res[i].get("regNumber") || '';
          tempGoods.producer = res[i].get("producer") || '';
          tempGoods.productCode = res[i].get("productCode") || '';
          tempGoods.packageContent = res[i].get("packageContent") || '';
          tempGoods.packingUnit = res[i].get("packingUnit") || '';
          tempGoods.reserve = res[i].get("reserve") || 0;
          tempGoods.costPrice = res[i].get("costPrice") || 0;
          tempGoods.retailPrice = res[i].get("retailPrice") || 0;
          tempGoods.modify_retailPrice = res[i].get("retailPrice") || 0;
          tempGoods.single_code = res[i].get("single_code") || '';
          tempGoodsArr.push(tempGoods);
        }
        that.handleData(tempGoodsArr);
        that.setData({ type: type, length: res.length });

        if (res.length == 0) {
          that.setData({ contentEmpty: true })
        } else {
          that.setData({ contentEmpty: false })
        }
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
    userid = wx.getStorageSync("friendId");
    curModule = options.type
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
      currenttab: "1",
      type: true
    });
    this.loadGoods(true);
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