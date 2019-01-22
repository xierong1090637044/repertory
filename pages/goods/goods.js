// pages/goods/goods.js
const Bmob = require('../../utils/bmob.js');
const Bmob_new = require('../../utils/bmob_new.js')
var config = require('../../utils/config.js')
var _ = require('../../utils/we-lodash.js');
var userid = '';
var now_product;
var select_id = null;//类别选择的id
var class_text;
var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    spinShow:true,
    goods:[],
    limitPage: 200,//限制显示条数
    isEmpty: false, //当前查询出来的数据是否为空
    isEnd: false, //是否到底了
    totalGoods: [],
    // 搜索
    inputShowed: false,
    inputVal: "",
    current: '1',
    length:null,
  },

  //处理modal的显示与消失
  add_class:function(){
    that.setData({ visible: true });
  },

  handleClose:function(){
    that.setData({ visible: false });
  },

  //输入产品类别事件
  getclass_text: function (e) {
    class_text = e.detail.detail.value;
  },

  //modal点击确定事件
  getclass_text_confrim:function(){
    wx.showLoading({title: '添加中...'})
    const pointer = Bmob_new.Pointer('_User')
    const poiID = pointer.set(wx.getStorageSync("userid"));

    const query = Bmob_new.Query('class_user');
    query.set("parent", poiID)
    query.set("class_text", class_text);
    query.save().then(res => {
      console.log(res);
      that.setData({ visible: false });
      that.getclass_list();
      wx.hideLoading();
    }).catch(err => {
      console.log(err)
    })
  },

  //得到类别列表
  getclass_list:function()
  {
    const query = Bmob_new.Query("class_user");
    query.equalTo("parent", "==", wx.getStorageSync("userid"));
    query.find().then(res => {
      that.setData({ class_text: res});
      wx.setStorageSync("class", res);
    });
  },

  //点击得到该商品类别的产品
  getclass_pro: function (e) {
    var id = e.currentTarget.dataset.id;
    console.log(id);
    if(id == null || id=='')
    {
      select_id = null;
      that.setData({ select_id: null ,current: '1',});
      that.loadGoods(true);
      that.loadallGoods();
    }else{
      select_id = id;
      that.setData({ select_id: id });
      that.loadGoods(that.data.type,null,id);
      that.loadallGoods(id);
    }
  },

  //tab改变事件
  handleChange({ detail }) {
    this.setData({
      current: detail.key,
      type:true
    });
    if (detail.key == 1) {
      that.loadGoods(true,null,select_id);
      this.setData({
        type: true
      });
    } else {
      that.loadGoods(false,null,select_id);
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

  //产品点击
  handleDetial: function (e) {
    var item = e.target.dataset.item;
    now_product = item;
    wx.setStorageSync('item', JSON.stringify(item));

    wx.showActionSheet({
      itemList: ['查看详情', '编辑产品', '删除产品','取消'],
      success(res) {
        console.log(res.tapIndex)
        if (res.tapIndex == 0)
        {
          wx.navigateTo({
            url: '/pages/common/goods-dtl/goods-dtl?type=1'
          });
        } else if (res.tapIndex == 1)
        {
          that.handleEditGoods();
        } else if (res.tapIndex == 2) {
          that.handleDelGoods();
        } else if (res.tapIndex == 3) {
          
        }
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })

  },

  handleEditGoods:function(e){
    var that = this
    var item = now_product;
    wx.setStorageSync('editGoods', item)
    wx.navigateTo({
      url: '/pages/goods/goods-edit/goods-edit',
    })
  },

  handleDelGoods: function (){
    var that = this
    var item = now_product;
    console.log(now_product);
    var id = now_product.goodsId
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

  loadGoods:function(type,content,class_id){
    var that = this;
    that.setData({spinShow:true});
    var Goods = Bmob.Object.extend("Goods");
    var query = new Bmob.Query(Goods);
    query.equalTo("userId", userid);
    if(type){
      query.greaterThan("reserve", 0);//库存充足
    }else{
      query.lessThanOrEqualTo("reserve", 0);//库存紧张
    }

    if (content != null) query.equalTo("goodsName", { "$regex": "" + content + ".*" });
    if (class_id != null) query.equalTo("goodsClass", class_id);
    
    query.limit(that.data.limitPage);
    query.ascending("goodsName"); //按照时间降序
    query.include("userId");
    query.include("goodsClass");
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
          tempGoods.class_text = res[i].get("goodsClass") || '';
          tempGoodsArr.push(tempGoods);
        }
        that.handleData(tempGoodsArr);
        that.setData({ type: type, length: res.length});

        if(res.length == 0)
        {
          that.setData({ contentEmpty:true})
        }else{
          that.setData({ contentEmpty: false })
        }
      }
    })
  },

  //得到总库存数和总金额
  loadallGoods:function(class_id)
  {
    var that = this;
    var total_reserve = 0;
    var total_money = 0;
    var Goods = Bmob.Object.extend("Goods");
    var query = new Bmob.Query(Goods);
    query.equalTo("userId", userid);
    if (class_id != null) query.equalTo("goodsClass", class_id);
    query.find({
      success: function (res) {
        for (var i = 0; i < res.length; i++) {
          total_reserve = total_reserve + res[i].get("reserve");
          total_money = total_money + res[i].get("reserve") * res[i].get("retailPrice");
        }
        that.setData({total_reserve: total_reserve, total_money: total_money });
        console.log(total_reserve, total_money);
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
      limitPage: 200,
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
    this.loadGoods(true,null,select_id)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userid = wx.getStorageSync("userid");
    this.handleRefresh();
    that = this;
    that.loadallGoods();
    that.getclass_list();
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