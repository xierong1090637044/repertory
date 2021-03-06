// pages/goods/goods.js
const Bmob = require('../../../utils/bmob.js')
var config = require('../../../utils/config.js')
var _ = require('../../../utils/we-lodash.js');
var userid = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    spinShow: true,
    goods: [],
    currentPage: 0, //要跳过查询的页数
    limitPage: config.pageSize,//首先显示3条数据（之后加载时都增加3条数据，直到再次加载不够3条）
    isEmpty: true, //当前查询出来的数据是否为空
    isEnd: false, //是否到底了
    endPage: 0, //最后一页加载多少条
    totalPage: 0, //总页数
    totalGoods: [],
    // 搜索
    inputShowed: false,
    inputVal: ""
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
    this.loadAll()
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
    var filterGoods = _.chain(that.data.totalGoods)
      .filter(function (res) {
        return res.goodsName.match(new RegExp(inputVal));
      })
      .map(function (res) {
        return res;
      })
      .value();
    var isEmpty = true
    if (filterGoods.length) {
      isEmpty = false
    }
    that.setData({
      goods: filterGoods,
      isEmpty: isEmpty,
      isEnd: !isEmpty
    })
  },
  // /.搜索
  handleDetial: function (e) {
    var item = e.target.dataset.item
    wx.setStorageSync('item', JSON.stringify(item))
    wx.navigateTo({
      url: '/pages/common/goods-dtl/goods-dtl?type=1'
    })
  },
  handleEditGoods: function (e) {
    var that = this
    var item = e.currentTarget.dataset.item
    wx.setStorageSync('editGoods', item)
    wx.navigateTo({
      url: '/pages/goods/goods-edit/goods-edit',
    })
  },
  handleDelGoods: function (e) {
    var that = this
    var item = e.currentTarget.dataset.item
    var id = e.currentTarget.dataset.item.goodsId
    wx.showModal({
      title: '提示',
      content: '是否删除【' + item.goodsName + '】产品',
      success: function (res) {
        if (res.confirm) {
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
                        wx.showToast({
                          title: '删除成功',
                          icon: 'success'
                        })
                        that.onShow();
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

  loadGoods: function () {
    var that = this;
    var Goods = Bmob.Object.extend("Goods");
    var query = new Bmob.Query(Goods);
    query.equalTo("userId", userid);
    query.limit(that.data.limitPage);
    query.skip(that.data.limitPage * that.data.currentPage);
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
          tempGoods.regNumber = res[i].get("regNumber") || '';
          tempGoods.producer = res[i].get("producer") || '';
          tempGoods.productCode = res[i].get("productCode") || '';
          tempGoods.packageContent = res[i].get("packageContent") || '';
          tempGoods.packingUnit = res[i].get("packingUnit") || '';
          tempGoods.reserve = res[i].get("reserve") || 0;
          tempGoods.costPrice = res[i].get("costPrice") || 0;
          tempGoods.retailPrice = res[i].get("retailPrice") || 0;
          tempGoods.qrCode = config.api.fetchQRCode + res[i].id || '';
          tempGoodsArr.push(tempGoods);
        }
        that.handleData(tempGoodsArr);
      }
    })
  },
  //加载下一页
  loadMore: function () {
    var that = this;
    wx.showLoading({
      title: '正在加载',
      mask: true
    });
    //一秒后关闭加载提示框
    setTimeout(function () {
      wx.hideLoading()
    }, 1000)

    that.setData({
      currentPage: that.data.currentPage + 1
    });
    //先判断是不是最后一页
    if (that.data.currentPage + 1 == that.data.totalPage) {
      that.setData({
        isEnd: true
      })
      // if (that.data.endPage != 0) { //如果最后一页的加载不等于0
      //   that.setData({
      //     limitPage: that.data.endPage,
      //   })
      // }
      this.loadGoods();
    } else {
      this.loadGoods();
    }
  },
  loadAll: function () {
    var that = this;
    var Goods = Bmob.Object.extend("Goods");
    var query = new Bmob.Query(Goods);
    query.equalTo("userId", userid);
    query.descending("createdAt"); //按照时间降序
    query.include("userId");
    query.limit(1000)
    query.find({
      success: function (res) {
        var count = res.length;
        var totalPage = 0;
        var endPage = 0;
        if (count == 0) {
          that.setData({
            isEmpty: true
          })
        }
        else if (count % that.data.limitPage == 0) {
          totalPage = parseInt(count / that.data.limitPage);
          if (totalPage == 1) {
            that.setData({
              isEnd: true,
              isEmpty: false
            })
          }
        } else {
          var lowPage = parseInt(count / that.data.limitPage);
          totalPage = lowPage + 1;
          if (lowPage == 0) {
            that.setData({
              isEnd: true,
              isEmpty: false
            })
          } else {
            endPage = count - (lowPage * that.data.limitPage);
          }
        }

        var tempGoodsArr = new Array();
        for (var i = 0; i < res.length; i++) {
          that.setData({
            isEmpty: false
          })
          var tempGoods = {}
          tempGoods.userid = userid || '';
          tempGoods.userName = res[i].get("userId").username || '';
          tempGoods.avatarUrl = res[i].get("userId").avatarUrl || '';
          tempGoods.goodsId = res[i].id || '';
          tempGoods.goodsName = res[i].get("goodsName") || '';
          tempGoods.regNumber = res[i].get("regNumber") || '';
          tempGoods.producer = res[i].get("producer") || '';
          tempGoods.productCode = res[i].get("productCode") || '';
          tempGoods.packageContent = res[i].get("packageContent") || '';
          tempGoods.packingUnit = res[i].get("packingUnit") || '';
          tempGoods.reserve = res[i].get("reserve") || 0;
          tempGoods.costPrice = res[i].get("costPrice") || 0;
          tempGoods.retailPrice = res[i].get("retailPrice") || 0;
          tempGoods.qrCode = config.api.fetchQRCode + res[i].id || '';
          tempGoodsArr.push(tempGoods);
        }
        that.setData({
          totalCount: count,
          endPage: endPage,
          totalPage: totalPage,
          totalGoods: tempGoodsArr || [],
          spinShow: false
        })
        console.log("【我的产品】【共有" + count + "条记录】 " + "【共有" + totalPage + "页】" + " 【最后一页加载" + endPage + "条】");
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
    });
  },

  //重置
  handleResetData: function () {
    this.setData({
      currentPage: 0,
      limitPage: config.pageSize,
      goods: [],
      isEnd: false,
      isEmpty: true,
      inputVal: '',
      inputShowed: false,
      spinShow: true
    })
  },

  handleRefresh: function () {
    this.handleResetData()
    this.loadAll()
    this.loadGoods()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userid = wx.getStorageSync("friendId");
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
    this.handleRefresh()
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