// pages/goods/goods.js
const Bmob = require('../../utils/bmob.js');
const Bmob_new = require('../../utils/bmob_new.js')
var config = require('../../utils/config.js')
var _ = require('../../utils/we-lodash.js');
var userid = '';
var now_product;
var class_text;
var that;
var type;//库存情况
var class_array;//产品类别
var select_id = null;//类别选择的id
var bad_num = null;//货损数量
var beizhu_text = '';//备注信息
Page({

  /**
   * 页面的初始数据
   */
  data: {
    spinShow:false,
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
    visible: false,
    now_goodsName:""
  },

  //选择库存情况
  bindstock_Change: function (e) {
    if (e.detail.value == "0") {
      that.loadGoods(true, null, select_id);
      that.setData({ selectd_stock: that.data.stock[e.detail.value]});
      type = true;
    }else{
      that.loadGoods(false, null, select_id);
      that.setData({ selectd_stock: that.data.stock[e.detail.value] });
      type = false;
    }
  },

  //选择产品类别
  bindclass_Change:function(e){
    var index = e.detail.value;
    select_id = class_array[index].objectId;
    that.setData({ selectd_class: class_array[index].class_text});
    that.loadGoods(type,null,select_id);
    
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
    this.loadGoods()
  },
  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value
    });
  },

  searchAction: function (e) {
    var that = this;
    var inputVal = this.data.inputVal
    that.loadGoods(type, inputVal);
  },

  //产品点击
  handleDetial: function (e) {
    var item = e.target.dataset.item;
    now_product = item;
    wx.setStorageSync('item', JSON.stringify(item));

    wx.showActionSheet({
      itemList: ['查看详情', '货损','查看产品图','编辑产品', '删除产品','取消'],
      success(res) {
        if (res.tapIndex == 0)
        {
          wx.navigateTo({
            url: '/pages/common/goods-dtl/goods-dtl?type=1'
          });
        } else if (res.tapIndex == 1) {
          that.setData({ visible: true, now_goodsName: now_product.goodsName})
        } else if (res.tapIndex == 2)
        {
          if (item.goodsIcon == "")
          {
            wx.showToast({
              title: '未上传产品图',
              icon:"none"
            })
          }else{
            wx.previewImage({
              current: item.goodsIcon, // 当前显示图片的http链接
              urls: [item.goodsIcon] // 需要预览的图片http链接列表
            })
          }
        } else if (res.tapIndex == 3) {
          that.handleEditGoods();
        } else if (res.tapIndex == 4) {
          that.handleDelGoods();
        } else if (res.tapIndex == 5){

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
    that.setData({spinShow:false});
    var Goods = Bmob.Object.extend("Goods");
    var query = new Bmob.Query(Goods);
    query.equalTo("userId", userid);
    if(type == true){
      var num_enough = wx.getStorageSync("setting").num_enough;
      query.greaterThan("reserve", num_enough);//库存充足
    }else if(type == false){
      var num_insufficient = wx.getStorageSync("setting").num_insufficient;
      query.lessThanOrEqualTo("reserve", num_insufficient);//库存紧张
    }else{}

    if (content != null) query.equalTo("goodsName", { "$regex": "" + content + ".*" });
    if (class_id != null) query.equalTo("goodsClass", class_id);
    
    query.limit(that.data.limitPage);
    query.descending("goodsName"); //按照时间降序
    query.include("userId");
    query.include("goodsClass");
    query.find({
      success: function (res) {
        that.setData({length: res.length });
        if (res.length == 0) {
          that.setData({ contentEmpty: true })
        } else {
          that.setData({ contentEmpty: false })
        }

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
          tempGoods.packModel = res[i].get("packModel") || '';
          tempGoods.reserve = res[i].get("reserve") || 0;
          tempGoods.costPrice = res[i].get("costPrice") || 0;
          tempGoods.retailPrice = res[i].get("retailPrice") || 0;
          tempGoods.class_text = res[i].get("goodsClass") || '';
          tempGoods.product_info = res[i].get("product_info") || '';
          tempGoods.bad_num = res[i].get("bad_num") || 0;
          tempGoodsArr.push(tempGoods);
        }
        that.handleData(tempGoodsArr);
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
      that.loadGoods(type, null, select_id);
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
      spinShow: false,
      current: '1',
      selectd_stock:"库存情况",
      stock:["库存充足","库存不足"],
      selectd_class:"产品类别"
    })
  },

  handleRefresh:function(){
    this.handleResetData()
    this.loadGoods(null,null,null)
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

  /*** 生命周期函数--监听页面加载*/
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

    that.getclass_list();
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
  
  },

  handleClose:function()
  {
    that.setData({visible:false})
  },

  //得到货损数量
  get_badnum:function(e)
  {
    bad_num = e.detail.detail.value;
  },

  //得到备注信息
  get_beizhu:function(e)
  {
    beizhu_text = e.detail.detail.value;
  },

  //货损记录按钮点击
  handleadd_badnum:function()
  {
    const product_id = now_product.goodsId;
    const last_bad_num = Number(now_product.bad_num);

    const pointer = Bmob_new.Pointer('_User');
    const poiID = pointer.set(userid);
    const pointer1 = Bmob_new.Pointer('Goods');
    const poiID1 = pointer1.set(product_id);

    const now_bad_num = last_bad_num + Number(bad_num);
    if(bad_num <=0)
    {
      wx.showToast({
        title: '货损数量不能为0',
        icon:"none"
      })
    }else{
      const query = Bmob_new.Query('bad_goods');
      query.set("bad_num", bad_num);
      query.set("beizhu_text", beizhu_text);
      query.set("operater", poiID);
      query.set("goods", poiID1);
      query.save().then(res => {
        
        const query = Bmob_new.Query('Goods');
        query.set('id', product_id) //需要修改的objectId
        query.set('bad_num', now_bad_num)
        query.save().then(res => {
          that.setData({ visible: false });
          that.onLoad();
          wx.showToast({
            title: '记录成功',
          });
        })

      })
    }
    
  }
})