// pages/goods/goods-edit/goods-edit.js
var { $Message } = require('../../../component/base/index');
const Bmob = require('../../../utils/bmob.js')
const config = require('../../../utils/config.js')
var _ = require('../../../utils/we-lodash.js');
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
    packingUnitVal: '',
    costPrice: '',//进货价格
    retailPrice: '',//零售价格
    loading: false
  },

  initGoods:function(){
    var that = this
    var goods = wx.getStorageSync('editGoods')
    that.setData({
      goodsId: goods.goodsId,
      goodsName: goods.goodsName,
      regNumber: goods.regNumber,
      producer: goods.producer,
      productCode: goods.productCode,
      packageContent: goods.packageContent,
      packingUnit: goods.packingUnit,
      costPrice: goods.costPrice,
      retailPrice: goods.retailPrice
    })
    var packingUnit = _.chain(that.data.packingUnits)
      .filter(function (res) {
        return res.id == goods.packingUnit;
      })
      .map(function (res) {
        return res;
      })
      .first()
      .value();
    that.setData({
      packingUnitVal: packingUnit.name
    })
  },

  handlePackingUnit: function (e) {
    var puId = this.data.packingUnits[e.detail.value].id
    var puVal = this.data.packingUnits[e.detail.value].name
    this.setData({
      packingUnit: puId,
      packingUnitVal: puVal
    })
  },

  handleEditGoods: function (e) {
    var that = this
    var goodsForm = e.detail.value
    //先进行表单非空验证
    if (goodsForm.goodsName == "") {
      $Message({
        content: '请输入产品名称',
        type: 'warning',
        duration: 5
      });
    } else if (goodsForm.regNumber == "") {
      $Message({
        content: '请输入登记证号',
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
                //判断产品是否已存在
                var query = new Bmob.Query(Goods);
                query.get(goodsForm.goodsId,{
                  success: function (results) {
                    // 修改产品
                    results.set("goodsName", goodsForm.goodsName);
                    results.set("regNumber", goodsForm.regNumber);
                    results.set("producer", goodsForm.producer);
                    results.set("productCode", goodsForm.productCode);
                    results.set("packageContent", goodsForm.packageContent);
                    results.set("costPrice", goodsForm.costPrice);
                    results.set("retailPrice", goodsForm.retailPrice);
                    results.set("packingUnit", that.data.packingUnit);
                    results.set("reserve", results.get('reserve'));
                    results.save(null, {
                      success: function (result) {
                        console.log("修改产品成功");
                        wx.showToast({
                          title: '修改产品成功',
                          icon: 'success',
                          success: function () {
                            wx.navigateBack()
                          }
                        })
                      },
                      error: function (result, error) {
                        //修改失败
                        console.log("修改失败:" + error);
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initGoods()
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