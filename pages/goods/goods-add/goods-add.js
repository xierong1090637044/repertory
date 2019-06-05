// pages/goods/goods-add/goods-add.js
let { $Message } = require('../../../component/base/index');
const Bmob = require('../../../utils/bmob.js');
const Bmob_new = require('../../../utils/bmob_new.js');
const config = require('../../../utils/config.js');
let temppath;
let class_text;//类别
let stock;//仓库
let that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    packingUnits: config.units,
    goodsName: '',//产品名称
    regNumber: '',//登记证号
    producer: '',//生产厂家
    productCode:'',//产品条码
    packageContent:'',//包装含量
    packingUnit: '',//包装单位
    packModel:'',//产品型号
    costPrice: '0',//进货价格
    retailPrice: '0',//零售价格
    goodsClass:null,//产品类别
    product_info:'',//商品简介
    warning_num:0,//库存预警数量
    reserve:0,
    loading:false,
    image:"none",
    is_choose: false,
  },

  //生产日期选择
  select_producttime(e)
  {
    that.setData({ producttime:e.detail.value})
  },

  //失效日期选择
  select_nousetime(e) {
    that.setData({ nousetime: e.detail.value })
  },

  handleAddGoods:function(e){
    var that = this
    var goodsForm = e.detail.value
    //var packModel = goodsForm.packModel.trim();
    //var packModel_arr = packModel.split(" ");
    //先进行表单非空验证
    if (goodsForm.goodsName == "") {
      $Message({
        content: '请输入产品名称',
        type: 'warning',
        duration: 5
      });
    } else if (goodsForm.costPrice == "") {
      $Message({
        content: '请输入进货价格',
        type: 'warning',
        duration: 5
      });
    } else if (goodsForm.retailPrice == "") {
      $Message({
        content: '请输入零售价格',
        type: 'warning',
        duration: 5
      });
    } else {
        wx.showModal({
          title: '提示',
          content: '是否确认新增产品',
          success: function (res) {
            if (res.confirm) {
              that.setData({
                loading: true
              })
              wx.getStorage({
                key: 'userid',
                success: function (res) {
                  var Goods = Bmob.Object.extend("Goods");
                  var goods = new Goods();

                  if (that.data.goodsClass) { //产品类别
                    var Class_User = Bmob.Object.extend("class_user");
                    var class_user = new Class_User();
                    class_user.id = that.data.goodsClass;
                  }

                  if (stock != null) { //产品存放仓库
                    var Stocks = Bmob.Object.extend("stocks");
                    var stocks = new Stocks();
                    stocks.id = stock.objectId;
                  }

                  var user = new Bmob.User();
                  user.id = res.data;
                  //判断产品是否已存在
                  var query = new Bmob.Query(Goods);
                  query.equalTo("goodsName", goodsForm.goodsName);
                  if (stock != null) query.equalTo("stocks", stock.objectId);
                  query.equalTo("userId", user);
                  query.find({
                    success: function (results) {
                      if (results.length > 0) {
                        $Message({
                          content: '该产品已存在，请确认',
                          type: 'warning',
                          duration: 5
                        });
                        that.setData({
                          loading: false
                        })
                        return
                      } else {
                        // 添加产品
                        goods.set("userId", user);
                        if (that.data.goodsClass) { goods.set("goodsClass", class_user); }
                        goods.set("stocks", stocks);
                        goods.set("goodsName", goodsForm.goodsName);
                        goods.set("regNumber", goodsForm.regNumber);
                        goods.set("producer", goodsForm.producer);
                        goods.set("productCode", goodsForm.productCode);
                        goods.set("position", goodsForm.position);
                        goods.set("packageContent", goodsForm.packageContent);
                        goods.set("costPrice", goodsForm.costPrice);
                        goods.set("retailPrice", goodsForm.retailPrice);
                        goods.set("packingUnit", goodsForm.packingUnit);
                        goods.set("product_info", goodsForm.product_info);
                        goods.set("warning_num", Number(goodsForm.warning_num));
                        if (goodsForm.producttime != null) goods.set("producttime", new Date(goodsForm.producttime + " 00:00:00"));
                        if (goodsForm.nousetime != null) goods.set("nousetime", new Date(goodsForm.nousetime + " 00:00:00"));
                        //goods.set("packModel", goodsForm.packModel);
                        goods.set("reserve", Number(goodsForm.reserve));
                        goods.set("stocktype", (Number(goodsForm.reserve) > Number(goodsForm.warning_num))?1:0);
                        goods.save(null, {
                          success: function (result) {
                            wx.setStorageSync("is_add", true);
                            if (that.data.is_choose) {
                              var file;
                              var tempFilePaths = temppath;
                              for (let item of tempFilePaths) {
                                console.log('itemn', item)
                                file = Bmob_new.File(goodsForm.goodsName + '.jpg', item);
                              }
                              file.save().then(res => {
                                const query = Bmob_new.Query('Goods');
                                query.set('id', result.id) //需要修改的objectId
                                query.set('goodsIcon', JSON.parse(res[0]).url);
                                query.save().then(res => {
                                  console.log(res)
                                  wx.showToast({
                                    title: '新增产品成功',
                                    icon: 'success',
                                    success: function () {
                                      that.setData({
                                        goodsName: "",
                                        regNumber: "",
                                        producer: "",
                                        productCode: "",
                                        packageContent: "",
                                       // packModel: "",
                                        packingUnit: "",
                                        costPrice: '0',
                                        retailPrice: '0',
                                        product_info: '',//商品简介
                                        warning_num: 0,//库存预警数量
                                        reserve: 0,
                                        loading: false
                                      })
                                    }
                                  })
                                }).catch(err => {
                                  console.log(err)
                                })
                              })
                            } else {
                              wx.showToast({
                                title: '新增产品成功',
                                icon: 'success',
                                success: function () {
                                  that.setData({
                                    goodsName: "",
                                    regNumber: "",
                                    producer: "",
                                    productCode: "",
                                    packageContent: "",
                                    //packModel: "",
                                    packingUnit: "",
                                    costPrice: '0',
                                    retailPrice: '0',
                                    product_info: '',//商品简介
                                    reserve: 0,
                                    loading: false
                                  })
                                }
                              })
                            }
                          },
                          error: function (result, error) {
                            //添加失败
                            console.log(error);
                          }
                        })
                      }
                    },
                    error: function (error) {
                      console.log(error.code + " " + error.message);
                    }
                  });
                }
              })
            }
          }
        })
    }
  },

  //选择图片
  choose_image:function()
  {
    wx.chooseImage({
      success: function (res) {
        console.log(res)
        temppath = res.tempFilePaths
        that.setData({ temppath: temppath, icon: "none", image: "inline-block", is_choose: true,})
      }
    })
  },

  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    that = this;
    var class_text = wx.getStorageSync("class");
    that.setData({ class_text: class_text });

    if(options.id != null){that.scan_by_id(options.id);}
  },

  /*** 生命周期函数--监听页面初次渲染完成*/
  onReady: function () {
  
  },

  /*** 生命周期函数--监听页面显示*/
  onShow: function () {
    wx.getStorage({
      key: 'stock',
      success(res) {
        stock = res.data
        that.setData({ stock: res.data.stock_name})
      }
    });

    wx.getStorage({
      key: 'class',
      success(res) {
        console.log(res)
        that.setData({ class_select_text: res.data.class_text, goodsClass:res.data.objectId})
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    wx.removeStorageSync("class");
  },

  /*** 生命周期函数--监听页面卸载*/
  onUnload: function () {
    wx.removeStorageSync("stock")
    wx.removeStorageSync("class");
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /*** 用户点击右上角分享*/
  onShareAppMessage: function () {
  
  },

  //通过条形码扫码得到商品信息
  scan_by_id:function(id)
  {
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: 'https://route.showapi.com/66-22',
      data: {
        showapi_appid: '84916',
        showapi_sign: 'ad4b63369c834759b411a9d7fcb07ed7',
        code: id,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        wx.hideLoading();
        var good = res.data.showapi_res_body;
        that.setData({
          goodsName: good.goodsName,
          producer: good.manuName,
          productCode:good.code
          })
      }
    });
  },
})