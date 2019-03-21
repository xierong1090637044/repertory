// pages/common/goods-select/goods-select.js
const Bmob = require('../../../utils/bmob.js');
const Bmob_new = require('../../../utils/bmob_new.js')
var config = require('../../../utils/config.js')
var _ = require('../../../utils/we-lodash.js');
var { $Message } = require('../../../component/base/index');
var userid = '';
var curModule = '';
var that;
var type;//库存情况
var class_array;//产品类别
var select_id;//产品类别id
Page({

  /*** 页面的初始数据*/
  data: {
    spinShow: false,
    current: [],
    currGoods: [],
    goods: [],
    totalGoods: [],
    isEmpty: false,
    // 搜索
    inputShowed: false,
    limitPage:50,//限制条数
    inputVal: "",
    currenttab: '1',
    length: null,
    selectd_stock: "库存情况",
    stock: ["库存充足", "库存不足"],
    selectd_class: "产品类别"
  },

  //选择产品类别
  bindclass_Change: function (e) {
    var index = e.detail.value;
    select_id = class_array[index].objectId;
    that.setData({ selectd_class: class_array[index].class_text, current: [], currGoods: [] });
    that.loadGoods(type, null, select_id);
  },

  //选择库存情况
  bindstock_Change: function (e) {
    if (e.detail.value == "0") {
      that.loadGoods(true, null, select_id);
      that.setData({
        selectd_stock: that.data.stock[e.detail.value], current: [],currGoods: [] });
      type = true;
    } else {
      that.loadGoods(false, null, select_id);
      that.setData({ selectd_stock: that.data.stock[e.detail.value], current: [], currGoods: [] });
      type = false;
    }
  },

  //得到类别列表
  getclass_list: function () {
    const query = Bmob_new.Query("class_user");
    query.equalTo("parent", "==", userid);
    query.find().then(res => {
      wx.setStorageSync("class", res);

      var all = {};
      all.class_text = "全部";
      all.objectId = null;

      res.push(all);
      that.setData({ all_class: res });
      class_array = res;
    });
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
    that.loadGoods(type, inputVal,select_id);
  },
  // /.搜索
  link2page: function () {
    if (that.data.currGoods.length < 1) {
      $Message({
        content: '未选择产品，请确认',
        type: 'warning',
        duration: 5
      });
    } else {
      wx.setStorageSync('currGoods', that.data.currGoods)
      var url = ''
      if (curModule =='entering'){
        url = '/pages/entering/entering'
      }
      else if (curModule == 'delivery'){
        url = '/pages/delivery/delivery'
      } else if (curModule == 'returing') {
        url = '/pages/returing/returing'
      } else if (curModule == 'counting') {
        url = '/pages/counting/counting'
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
    var currIdx = that.data.current.indexOf(detail.value);
    var currGoodsIdx = _.findIndex(that.data.currGoods, checkGoods);
    currIdx === -1 ? that.data.current.push(detail.value) : that.data.current.splice(currIdx, 1);
    currGoodsIdx === -1 ? that.data.currGoods.push(checkGoods) : that.data.currGoods.splice(currGoodsIdx, 1);
    that.setData({
      current: that.data.current,
      currGoods: that.data.currGoods
    });
  },

  loadGoods: function (type, content, class_id) {
    var that = this;
    that.setData({ spinShow: false });
    var Goods = Bmob.Object.extend("Goods");
    var query = new Bmob.Query(Goods);
    query.equalTo("userId", userid);
    if (class_id != null) query.equalTo("goodsClass", class_id);
    if (type == true) {
      var num_enough = wx.getStorageSync("setting").num_enough;
      query.greaterThan("reserve", num_enough);//库存充足
    } else if(type == false) {
      var num_insufficient = wx.getStorageSync("setting").num_insufficient;
      query.lessThanOrEqualTo("reserve", num_insufficient);//库存紧张
    }else{}

    if (content != null) query.equalTo("goodsName", { "$regex": "" + content + ".*" });
    query.limit(that.data.limitPage);
    query.descending("goodsName"); //按照货物名字
    query.include("userId");
    query.find({
      success: function (res) {
        that.setData({ length: res.length });
        if (res.length == 0) {
          that.setData({ contentEmpty: true })
        } else {
          that.setData({ contentEmpty: false })
        }

        that.getclass_list();

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
          tempGoods.modify_retailcostPrice = res[i].get("costPrice") || 0;
          tempGoodsArr.push(tempGoods);
        }
        that.handleData(tempGoodsArr);
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
      spinShow: false,
    });
  },
  

  //滚动加载更多
  loadMore: function () {
    var that = this;
    if (that.data.length < that.data.limitPage) {
      wx.showToast({
        icon: 'none',
        title: '到底啦',
      })
    } else {
      that.setData({ limitPage: that.data.limitPage + that.data.limitPage, })
      that.loadGoods(type, null, select_id);
    }
  },

  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    that = this;
    userid = wx.getStorageSync("userid");
    curModule = options.type;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /*** 生命周期函数--监听页面显示*/
  onShow: function () {
    this.loadGoods(null, null, null);
    this.setData({
      current: [],
      currGoods: [],
      selectd_stock: "库存情况",
      selectd_class: "产品类别"
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  },

  /*** 生命周期函数--监听页面卸载*/
  onUnload: function () {
    type = null;//库存情况
    select_id = null;//类别选择的id
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