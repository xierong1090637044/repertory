// pages/goods/goods.js
const Bmob = require('../../utils/bmob.js')
var config = require('../../utils/config.js')
var _ = require('../../utils/we-lodash.js');
var userid = '';
var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    spinShow:true,
    goods:[],
    limitPage: 10,//限制显示条数
    isEmpty: false, //当前查询出来的数据是否为空
    isEnd: false, //是否到底了
    totalGoods: [],
    // 搜索
    inputShowed: false,
    inputVal: "",
    current: '1',
    length:null,
  },

  //tab改变事件
  handleChange({ detail }) {
    this.setData({
      current: detail.key,
      type:true
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
      inputVal: ""
    });
    this.handleResetData()
    this.loadGoods(true)
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
  handleDetial: function (e) {
    var item = e.target.dataset.item
    wx.setStorageSync('item', JSON.stringify(item))
    wx.navigateTo({
      url: '/pages/common/goods-dtl/goods-dtl?type=1'
    })
  },

  handleEditGoods:function(e){
    var that = this
    var item = e.currentTarget.dataset.item
    wx.setStorageSync('editGoods', item)
    wx.navigateTo({
      url: '/pages/goods/goods-edit/goods-edit',
    })
  },

  handleDelGoods: function (e){
    var that = this
    var item = e.currentTarget.dataset.item
    var id = e.currentTarget.dataset.item.goodsId
    wx.showModal({
      title: '提示',
      content: '是否删除【'+item.goodsName+'】产品',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({title: '删除中...',});
          var BillsTemp = Bmob.Object.extend("BillsTemp");
          var queryBillsTemp = new Bmob.Query(BillsTemp);
          queryBillsTemp.equalTo("goodsId", id);
          queryBillsTemp.limit(1000)
          queryBillsTemp.find({
            success: function (results) {
              console.log("共查询到 " + results.length + " 条记录");
              var objects = new Array()
              // 批量删除
              Bmob.Object.destroyAll(results).then(function () {
                console.log('删除BillsTemp成功')
              },
              function (error) {
                console.log('删除BillsTemp失败')
              });
            },
            error: function (error) {
              console.log("查询失败: " + error.code + " " + error.message);
            }
          });
          var Bills = Bmob.Object.extend("Bills");
          var queryBills = new Bmob.Query(Bills);
          queryBills.equalTo("goodsId", id);
          queryBills.limit(1000)
          queryBills.find({
            success: function (results) {
              console.log("共查询到 " + results.length + " 条记录");
              var objects = new Array()
              // 批量删除
              Bmob.Object.destroyAll(results).then(function () {
                var Goods = Bmob.Object.extend("Goods");
                var goods = new Bmob.Query(Goods);
                goods.get(id, {
                  success: function (result) {
                    result.destroy({
                      success: function (res) {
                        wx.hideLoading();
                        wx.showToast({
                          title: '删除成功',
                          icon: 'success'
                        })
                        that.onLoad();
                      },
                      error: function (result, error) {
                        console.log(error);
                      }
                    })
                  },
                  error: function (result, error) {
                    console.log(error);
                    wx.showToast({
                      title: '删除失败',
                      icon: 'none'
                    })
                  }
                })
              },
              function (error) {
                // 异常处理
              });
            },
            error: function (error) {
              console.log("查询失败: " + error.code + " " + error.message);
            }
          });
          
        }
      }
    })
  },

  loadGoods:function(type,content){
    var that = this;
    that.setData({spinShow:true});
    var Goods = Bmob.Object.extend("Goods");
    var query = new Bmob.Query(Goods);
    query.equalTo("userId", userid);
    if(type){
      query.greaterThan("reserve", 10);//库存充足
    }else{
      query.lessThanOrEqualTo("reserve", 10);//库存紧张
    }

    if (content != null) query.equalTo("goodsName", { "$regex": "" + content + ".*" });
    
    query.limit(that.data.limitPage);
    query.descending("createdAt"); //按照时间降序
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
          tempGoods.single_code = res[i].get("single_code") || '';
          tempGoodsArr.push(tempGoods);
        }
        console.log(res.length);
        that.handleData(tempGoodsArr);
        that.setData({ type: type, length: res.length});
      }
    })
  },

  //数据存储
  handleData: function (data) {
    let page = this.data.currentPage + 1;
    //设置数据
    data = data || [];
    this.setData({
      goods: page === 1 || page === undefined ? data : this.data.goods.concat(data),
      spinShow: false
    });
  },

  //滚动加载更多
  loadMore:function()
  {
    var that = this;
    if(that.data.length < that.data.limitPage)
    {
      wx.showToast({
        icon:'none',
        title: '到底啦',
      })
    }else{
      that.setData({ limitPage: that.data.limitPage + that.data.limitPage,})
      that.loadGoods(that.data.type);
    }
    
  },

  //重置
  handleResetData:function(){
    this.setData({
      currentPage: 0,
      limitPage: 10,
      goods: [],
      isEnd: false,
      isEmpty: false,
      inputVal:'',
      inputShowed:false,
      spinShow: true,
      current: '1',
    })
  },

  handleRefresh:function(){
    this.handleResetData()
    this.loadGoods(true)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userid = wx.getStorageSync("userid");
    this.handleRefresh();
    that = this;
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
    var is_add = wx.getStorageSync("is_add");
    if(is_add)
    {
      this.handleRefresh();
      wx.setStorageSync("is_add", false);
    }
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