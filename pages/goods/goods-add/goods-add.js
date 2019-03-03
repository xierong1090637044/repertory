// pages/goods/goods-add/goods-add.js
var { $Message } = require('../../../component/base/index');
const Bmob = require('../../../utils/bmob.js');
const Bmob_new = require('../../../utils/bmob_new.js');
const config = require('../../../utils/config.js');
var temppath;
var class_text;
var that;
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
    goodsClass:'',//产品类别
    product_info:'',//商品简介
    reserve:0,
    loading:false,
    image:"none",
    is_choose: false,
  },

  //商品类别点击
  add_class:function()
  {
    class_text = wx.getStorageSync("class");
    that.setData({ class_text: class_text})
  },

  bindPickerChange(e) {
    class_text = wx.getStorageSync("class");
    var index = e.detail.value;
    this.setData({
      class_select_text: class_text[index].class_text,
      goodsClass: class_text[index].objectId
    })
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

                  if (that.data.goodsClass != '') {
                    var Class_User = Bmob.Object.extend("class_user");
                    var class_user = new Class_User();
                    class_user.id = that.data.goodsClass;
                  }

                  var user = new Bmob.User();
                  user.id = res.data;
                  //判断产品是否已存在
                  var query = new Bmob.Query(Goods);
                  query.equalTo("goodsName", goodsForm.goodsName);
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
                        if (that.data.goodsClass != '') { goods.set("goodsClass", class_user); }
                        goods.set("goodsName", goodsForm.goodsName);
                        goods.set("regNumber", goodsForm.regNumber);
                        goods.set("producer", goodsForm.producer);
                        goods.set("productCode", goodsForm.productCode);
                        goods.set("packageContent", goodsForm.packageContent);
                        goods.set("costPrice", goodsForm.costPrice);
                        goods.set("retailPrice", goodsForm.retailPrice);
                        goods.set("packingUnit", goodsForm.packingUnit);
                        goods.set("product_info", goodsForm.product_info);
                        //goods.set("packModel", goodsForm.packModel);
                        goods.set("reserve", Number(goodsForm.reserve));
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
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /*** 生命周期函数--监听页面卸载*/
  onUnload: function () {
  
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