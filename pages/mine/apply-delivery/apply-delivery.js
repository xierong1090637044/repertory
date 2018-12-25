// pages/mine/apply-delivery/apply-delivery.js
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
    applyBills: [],
    currentPage: 0, //要跳过查询的页数
    limitPage: config.pageSize,//首先显示3条数据（之后加载时都增加3条数据，直到再次加载不够3条）
    isEmpty: true, //当前查询出来的数据是否为空
    isEnd: false, //是否到底了
    endPage: 0, //最后一页加载多少条
    totalPage: 0, //总页数
    totalApplyBills: [],
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
    this.loadApplyBills()
  },
  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value
    });
  },
  searchAction: function (e) {
    var that = this;
    var inputVal = this.data.inputVal
    var filterApplyBills = _.chain(that.data.totalApplyBills)
      .filter(function (res) {
        return res.goodsName.match(new RegExp(inputVal));
      })
      .map(function (res) {
        return res;
      })
      .value();
    var isEmpty = true
    if (filterApplyBills.length) {
      isEmpty = false
    }
    that.setData({
      applyBills: filterApplyBills,
      isEmpty: isEmpty,
      isEnd: !isEmpty
    })
  },
	// /.搜索
  handleDetial: function (e) {
    var item = e.target.dataset.item
    wx.setStorageSync('item', JSON.stringify(item))
    wx.navigateTo({
      url: '/pages/mine/apply-delivery/apply-result/apply-result'
    })
  },
  handleScanCode:function(){
    wx.scanCode({
      onlyFromCamera: false,
      scanType: ['qrCode'],
      success: (res) => {
        var goodsId = res.result
        var Goods = Bmob.Object.extend("Goods");
        var query = new Bmob.Query(Goods);
        query.include("userId");
        query.get(goodsId, {
          success: function (result) {
            // 查询成功
            var tempGoods = {}
            tempGoods.userid = result.get("userId").objectId || '';
            tempGoods.userName = result.get("userId").username || '';
            tempGoods.avatarUrl = result.get("userId").avatarUrl || '';
            tempGoods.goodsId = result.id || '';
            tempGoods.goodsName = result.get("goodsName") || '';
            tempGoods.regNumber = result.get("regNumber") || '';
            tempGoods.producer = result.get("producer") || '';
            tempGoods.productCode = result.get("productCode") || '';
            tempGoods.packageContent = result.get("packageContent") || '';
            tempGoods.packingUnit = result.get("packingUnit") || '';
            tempGoods.reserve = result.get("reserve") || 0;
            tempGoods.costPrice = result.get("costPrice") || 0;
            tempGoods.retailPrice = result.get("retailPrice") || 0;
            wx.setStorageSync('applyBill', JSON.stringify(tempGoods))
            wx.navigateTo({
              url: '/pages/mine/apply-delivery/apply-bill/apply-bill'
            })
          },
          error: function (object, error) {
            // 查询失败
          }
        });
      }
    })
  },
  loadApplyBills: function () {
    var that = this;
    var BillsTemp = Bmob.Object.extend("BillsTemp");
    var query = new Bmob.Query(BillsTemp);
    query.equalTo("applyUserId", userid);
    query.limit(that.data.limitPage);
    query.skip(that.data.limitPage * that.data.currentPage);
    query.descending("createdAt"); //按照时间降序
    query.include("goodsUserId");
    query.include("goodsId");
    query.include("applyUserId");
    query.find({
      success: function (res) {
        var tempApplyBillsArr = new Array();
        for (var i = 0; i < res.length; i++) {
          var tempApplyBill = {}
          tempApplyBill.createdAt = res[i].createdAt || '';
          tempApplyBill.userName = res[i].get("applyUserId").username || '';
          tempApplyBill.goodsId = res[i].get("goodsId").objectId || '';
          tempApplyBill.goodsName = res[i].get("goodsId").goodsName || '';
          tempApplyBill.producer = res[i].get("goodsId").producer || '';
          tempApplyBill.regNumber = res[i].get("goodsId").regNumber || '';
          tempApplyBill.productCode = res[i].get("goodsId").productCode || '';
          tempApplyBill.reserve = res[i].get("goodsId").reserve || 0;
          tempApplyBill.packageContent = res[i].get("goodsId").packageContent || '';
          tempApplyBill.packingUnit = res[i].get("goodsId").packingUnit || '';
          tempApplyBill.costPrice = res[i].get("goodsId").costPrice || '';
          tempApplyBill.retailPrice = res[i].get("goodsId").retailPrice || '';
          tempApplyBill.applyUserId = res[i].get("applyUserId").objectId || '';
          tempApplyBill.applyUserName = res[i].get("applyUserId").username || '';
          tempApplyBill.avatarUrl = res[i].get("applyUserId").avatarUrl || '';
          tempApplyBill.approveUserName = res[i].get("goodsUserId").username || '';
          tempApplyBill.approveAvatarUrl = res[i].get("goodsUserId").avatarUrl || '';
          tempApplyBill.status = res[i].get("status") || 0;
          tempApplyBill.applyNum = res[i].get("applyNum") || 0;
          tempApplyBill.applyRemark = res[i].get("applyRemark") || '暂无备注';
          tempApplyBill.approveRemark = res[i].get("approveRemark") || '暂无备注';
          tempApplyBillsArr.push(tempApplyBill);
        }
        that.handleData(tempApplyBillsArr);
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
      this.loadApplyBills();
    } else {
      this.loadApplyBills();
    }
  },
  loadAll: function () {
    var that = this;
    var BillsTemp = Bmob.Object.extend("BillsTemp");
    var query = new Bmob.Query(BillsTemp);
    query.equalTo("applyUserId", userid);
    query.limit(1000)
    query.include("goodsUserId");
    query.include("goodsId");
    query.include("applyUserId");
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

        var tempApplyBillsArr = new Array();
        for (var i = 0; i < res.length; i++) {
          that.setData({
            isEmpty: false
          })
          var tempApplyBill = {}
          tempApplyBill.createdAt = res[i].createdAt || '';
          tempApplyBill.userName = res[i].get("applyUserId").username || '';
          tempApplyBill.goodsId = res[i].get("goodsId").objectId || '';
          tempApplyBill.goodsName = res[i].get("goodsId").goodsName || '';
          tempApplyBill.producer = res[i].get("goodsId").producer || '';
          tempApplyBill.regNumber = res[i].get("goodsId").regNumber || '';
          tempApplyBill.productCode = res[i].get("goodsId").productCode || '';
          tempApplyBill.reserve = res[i].get("goodsId").reserve || 0;
          tempApplyBill.packageContent = res[i].get("goodsId").packageContent || '';
          tempApplyBill.packingUnit = res[i].get("goodsId").packingUnit || '';
          tempApplyBill.costPrice = res[i].get("goodsId").costPrice || '';
          tempApplyBill.retailPrice = res[i].get("goodsId").retailPrice || '';
          tempApplyBill.applyUserId = res[i].get("applyUserId").objectId || '';
          tempApplyBill.applyUserName = res[i].get("applyUserId").username || '';
          tempApplyBill.avatarUrl = res[i].get("applyUserId").avatarUrl || '';
          tempApplyBill.approveUserName = res[i].get("goodsUserId").username || '';
          tempApplyBill.approveAvatarUrl = res[i].get("goodsUserId").avatarUrl || '';
          tempApplyBill.status = res[i].get("status") || 0;
          tempApplyBill.applyNum = res[i].get("applyNum") || 0;
          tempApplyBill.applyRemark = res[i].get("applyRemark") || '暂无备注';
          tempApplyBill.approveRemark = res[i].get("approveRemark") || '暂无备注';
          tempApplyBillsArr.push(tempApplyBill);
        }
        //that.handleData(tempApplyBillsArr);
        that.setData({
          totalCount: count,
          endPage: endPage,
          totalPage: totalPage,
          totalApplyBills: tempApplyBillsArr || [],
          spinShow: false
        })
        console.log("【我的申请单】【共有" + count + "条记录】 " + "【共有" + totalPage + "页】" + " 【最后一页加载" + endPage + "条】");
      }
    })
  },
  //数据存储
  handleData: function (data) {
    let page = this.data.currentPage + 1;
    //设置数据
    data = data || [];
    this.setData({
      applyBills: page === 1 || page === undefined ? data : this.data.applyBills.concat(data),
    });
  },

  //重置
  handleResetData: function () {
    this.setData({
      currentPage: 0,
      limitPage: config.pageSize,
      applyBills: [],
      isEnd: false,
      isEmpty: true,
      spinShow: true
    })
  },

  handleRefresh: function () {
    this.handleResetData()
    this.loadAll()
    this.loadApplyBills()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userid = wx.getStorageSync("userid");
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    setTimeout(function () {
      that.setData({
        spinShow: false
      });
    }, 1000);
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