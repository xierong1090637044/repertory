// pages/goods/goods-add/goods-add.js
var { $Message } = require('../../../component/base/index');
const Bmob = require('../../../utils/bmob.js')
const config = require('../../../utils/config.js')
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
    costPrice: '',//进货价格
    retailPrice: '',//零售价格
    loading:false
  },

  handleAddGoods:function(e){
    var that = this
    var goodsForm = e.detail.value
    //先进行表单非空验证
    if (goodsForm.goodsName == "") {
      $Message({
        content: '请输入产品名称',
        type: 'warning',
        duration: 5
      });
    } else if (goodsForm.costPrice == "" || goodsForm.costPrice == 0) {
      $Message({
        content: '请输入进货价格',
        type: 'warning',
        duration: 5
      });
    } else if (goodsForm.retailPrice == "" || goodsForm.retailPrice == 0) {
      $Message({
        content: '请输入零售价格',
        type: 'warning',
        duration: 5
      });
    }else{
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
                var user = new Bmob.User();
                user.id = res.data;
                //判断产品是否已存在
                var query = new Bmob.Query(Goods);
                query.equalTo("goodsName", goodsForm.goodsName);
                query.equalTo("userId", user);
                query.find({
                  success: function (results) {
                    if(results.length>0){
                      $Message({
                        content: '该产品已存在，请确认',
                        type: 'warning',
                        duration: 5
                      });
                      that.setData({
                        loading: false
                      })
                      return
                    }else{
                      // 添加产品
                      goods.set("userId", user);
                      goods.set("goodsName", goodsForm.goodsName);
                      goods.set("regNumber", goodsForm.regNumber);
                      goods.set("producer", goodsForm.producer);
                      goods.set("productCode", goodsForm.productCode);
                      goods.set("packageContent", goodsForm.packageContent);
                      goods.set("costPrice", goodsForm.costPrice);
                      goods.set("retailPrice", goodsForm.retailPrice);
                      goods.set("packingUnit", goodsForm.packingUnit);
                      goods.set("reserve", 0);
                      goods.save(null, {
                        success: function (result) {
                          console.log("新增产品成功");
                          wx.setStorageSync("is_add", true)
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
                                packingUnit: "",
                                costPrice: '',
                                retailPrice: '',
                                loading: false
                              })
                            }
                          })
                        },
                        error: function (result, error) {
                          //添加失败
                          console.log("添加失败:" + error);
                        }
                      })
                    }
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
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