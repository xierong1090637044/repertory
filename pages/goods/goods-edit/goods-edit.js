// pages/goods/goods-edit/goods-edit.js
var { $Message } = require('../../../component/base/index');
const Bmob = require('../../../utils/bmob.js')
const config = require('../../../utils/config.js')
var _ = require('../../../utils/we-lodash.js');
const Bmob_new = require('../../../utils/bmob_new.js');
var temppath;
var that;
var class_text;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    packingUnits: config.units,
    goodsId:'',
    goodsName: '',//产品名称
    regNumber: '',//登记证号
    producer: '',//生产厂家
    productCode: '',//产品条码
    packageContent: '',//包装含量
    packingUnit: '',//包装单位
    costPrice: '',//进货价格
    retailPrice: '',//零售价格
    reserve:null,
    loading: false,
    is_choose:false,
  },

  //商品类别点击
  add_class: function () {
    class_text = wx.getStorageSync("class");
    that.setData({ class_text: class_text })
  },

  bindPickerChange(e) {
    class_text = wx.getStorageSync("class");
    var index = e.detail.value;
    this.setData({
      class_select_text: class_text[index].class_text,
      goodsClass: class_text[index].objectId
    })
  },

  initGoods:function(){
    var that = this
    var goods = wx.getStorageSync('editGoods')
    that.setData({
      temppath: (goods.goodsIcon == "") ? "/images/common/goods-default.png" : goods.goodsIcon,
      goodsId: goods.goodsId,
      goodsName: goods.goodsName,
      regNumber: goods.regNumber,
      producer: goods.producer,
      productCode: goods.productCode,
      packageContent: goods.packageContent,
      packingUnit: goods.packingUnit,
      costPrice: goods.costPrice,
      retailPrice: goods.retailPrice,
      reserve: goods.reserve,
      class_select_text: (goods.class_text.class_text == null) ? null : goods.class_text.class_text,
      goodsClass:goods.class_text.objectId,
      product_info:goods.product_info
    })
  },

  handleEditGoods: function (e) {
    var that = this
    var goodsForm = e.detail.value
    console.log(e);
    //先进行表单非空验证
    if (goodsForm.goodsName == "") {
      $Message({
        content: '请输入产品名称',
        type: 'warning',
        duration: 5
      });
    } else {
      wx.showModal({
        title: '提示',
        content: '是否确认修改该产品',
        success: function (res) {
          if (res.confirm) {
            that.setData({
              loading: true
            })
            wx.getStorage({
              key: 'userid',
              success: function (res) {
                var Goods = Bmob.Object.extend("Goods");
                var user = new Bmob.User();
                user.id = res.data;

                var Class_User = Bmob.Object.extend("class_user");
                var class_user = new Class_User();
                class_user.id = that.data.goodsClass;

                //判断产品是否已存在
                var query = new Bmob.Query(Goods);
                query.get(goodsForm.goodsId,{
                  success: function (results) {
                    // 修改产品
                    results.set("goodsName", goodsForm.goodsName);
                    results.set("goodsClass", class_user);
                    results.set("goodsIcon", goodsForm.goodsIcon);
                    results.set("regNumber", goodsForm.regNumber);
                    results.set("producer", goodsForm.producer);
                    results.set("productCode", goodsForm.productCode);
                    results.set("packageContent", goodsForm.packageContent);
                    results.set("costPrice", goodsForm.costPrice);
                    results.set("retailPrice", goodsForm.retailPrice);
                    results.set("packingUnit", goodsForm.packingUnit);
                    results.set("reserve", Number(goodsForm.reserve));
                    results.set("product_info", goodsForm.product_info);
                    results.save(null, {
                      success: function (result) {
                        console.log("修改产品成功");
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
                                title: '修改产品成功',
                                icon: 'success',
                                success: function () {
                                  that.setData({
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
                            title: '修改产品成功',
                            icon: 'success',
                          })
                        }
                       
                      },
                      error: function (result, error) {
                        //修改失败
                        console.log(error);
                      }
                    })
                  },
                  error: function (error) {
                    console.log("查询失败: " + error.code + " " + error.message);
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
  choose_image: function () {
    wx.chooseImage({
      success: function (res) {
        console.log(res)
        temppath = res.tempFilePaths
        that.setData({ temppath: temppath, is_choose: true, image: "inline-block" })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initGoods();
    that = this;
    that.add_class();
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