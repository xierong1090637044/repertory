// pages/finance/finance.js
const Bmob = require('../../utils/bmob.js')
var _ = require('../../utils/we-lodash.js');
var charts = require('../../utils/charts.js');
var finChart = null;
var finPriceChart = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    spinShow: true,
    canvasSpinShow: true,
    current: '1',
    tipShow: false,
    totalEntering: 0,
    totalDelivery: 0,
    dayEntering: 0, //日入库数
    dayEnteringPrice: 0, //日入库金额
    dayDelivery: 0, //日出库数
    dayDeliveryPrice: 0, //日出库金额
    dayProfit:0,//日利润
    weekEntering:0, //周入库数
    weekEnteringPrice:0, //周入库金额
    weekDelivery: 0, //周出库数
    weekDeliveryPrice: 0, //周出库金额
    weekProfit:0,//周利润
    totalEnteringPrice:0,
    totalDeliveryPrice:0,
    totalProfit:0
  },
  handleChange({ detail }) {
    this.setData({
      current: detail.key,
      tipShow:false
    });
  },
  loadFinData:function(_callback){
    var that = this;
    var Bills = Bmob.Object.extend("Bills");
    var query = new Bmob.Query(Bills);
    query.equalTo("userId", wx.getStorageSync("userid"));
    //query.equalTo("createdAt", {"$gte": { "__type": "Date", "iso": that.getDay(-7) + " 00:00:00" }});
    query.limit(1000)
    query.include('goodsId');
    query.find({
      success: function (results) {
        var tempFinArr = new Array();
        for (var i = 0; i < results.length; i++) {
          var tempFin = {}
          tempFin.num = results[i].get('num') || 0;
          tempFin.type = results[i].get('type') || 0;
          tempFin.goods = results[i].get('goodsId');
          tempFin.retailPrice = results[i].get('retailPrice') || 0;
          tempFin.createdAt = results[i].createdAt.substring(0, 10) || '';
          tempFinArr.push(tempFin)
        }
        var countDay = []
        var countEntering = []
        var countDayEnteringPrice = []
        var countDelivery = []
        var countDayDeliveryPrice = []
        //统计总入库
        var filterEntering = _.chain(tempFinArr)
          .filter(function (res) {
            return res.type == 1;
          })
          .map(function (res) {
            return res;
          })
          .value();

        //统计总入库数量
        var totalEntering = _.reduce(filterEntering, function (result, item) {
          return result + item.num;
        }, 0);

        //统计总入库金额
        var totalEnteringPrice = _.reduce(filterEntering, function (result, item) {
          return result + item.num * item.goods.costPrice;
        }, 0);

        //统计近7日的入库
        var filterWeekEntering = _.chain(tempFinArr)
          .filter(function (res) {
            return res.type == 1 && res.createdAt > that.getDay(-7);
          })
          .map(function (res) {
            return res;
          })
          .value();
        //统计近7日入库数量
        var weekEntering = _.reduce(filterWeekEntering, function (result, item) {
          return result + item.num;
        }, 0);

        //统计近7日入库金额
        var weekEnteringPrice = _.reduce(filterWeekEntering, function (result, item) {
          return result + item.num * item.goods.costPrice;
        }, 0);

        that.setData({
          totalEntering: totalEntering,
          totalEnteringPrice: totalEnteringPrice.toFixed(2),
          weekEntering: weekEntering,
          weekEnteringPrice: weekEnteringPrice.toFixed(2)
        })
        var groupEntering = _.groupBy(filterEntering, 'createdAt')
        
        for(var i=0; i>=-6; i--){
          var count = 0;
          var price = 0;
          if (groupEntering[that.getDay(i)] == undefined){
            count = 0
            price = 0
          }else{
            count = _.reduce(groupEntering[that.getDay(i)], function (result, item) {
              return result + item.num;
            }, 0);

            price = _.reduce(groupEntering[that.getDay(i)], function (result, item) {
              return result + item.num * item.goods.costPrice;
            }, 0);

            //设置当日入库数量及金额
            if (i == 0) {
              that.setData({
                dayEntering: count,
                dayEnteringPrice: price.toFixed(2),
              })
            }
          }
          countDay.push(that.getDay(i).substring(2, 10))
          countEntering.push(count)
          countDayEnteringPrice.push(price)
        }

        //统计出库
        var filterDelivery = _.chain(tempFinArr)
          .filter(function (res) {
            return res.type == -1;
          })
          .map(function (res) {
            return res;
          })
          .value();

         //统计总出库数量
        var totalDelivery = _.reduce(filterDelivery, function (result, item) {
          return result + item.num;
        }, 0);

        //统计总出库金额
        var totalDeliveryPrice = _.reduce(filterDelivery, function (result, item) {
          return result + item.num * item.retailPrice;
        }, 0);

        var totalProfit = _.reduce(filterDelivery, function (result, item) {
          return result + (item.num * item.retailPrice - item.num * item.goods.costPrice);
        }, 0);

        //统计近7日的入库
        var filterWeekDelivery = _.chain(tempFinArr)
          .filter(function (res) {
            return res.type == -1 && res.createdAt > that.getDay(-7);
          })
          .map(function (res) {
            return res;
          })
          .value();
          
        //统计近7日出库数量
        var weekDelivery = _.reduce(filterWeekDelivery, function (result, item) {
          return result + item.num;
        }, 0);

        //统计近7日出库金额
        var weekDeliveryPrice = _.reduce(filterWeekDelivery, function (result, item) {
          return result + item.num * item.retailPrice;
        }, 0);

        var weekProfit = _.reduce(filterWeekDelivery, function (result, item) {
          return result + (item.num * item.retailPrice - item.num * item.goods.costPrice);
        }, 0);

        that.setData({
          totalDelivery: totalDelivery,
          totalDeliveryPrice: totalDeliveryPrice.toFixed(2),
          totalProfit: totalProfit.toFixed(2),
          weekDelivery: weekDelivery,
          weekDeliveryPrice: weekDeliveryPrice.toFixed(2),
          weekProfit: weekProfit.toFixed(2)
        })
        var groupDelivery = _.groupBy(filterDelivery, 'createdAt')
        for (var i = 0; i >= -6; i--) {
          var count = 0;
          var price = 0;
          var profit = 0;
          if (groupDelivery[that.getDay(i)] == undefined) {
            count = 0
            price = 0
            profit = 0
          } else {
            count = _.reduce(groupDelivery[that.getDay(i)], function (result, item) {
              return result + item.num;
            }, 0);

            price = _.reduce(groupDelivery[that.getDay(i)], function (result, item) {
              return result + item.num * item.retailPrice;
            }, 0);

            profit = _.reduce(groupDelivery[that.getDay(i)], function (result, item) {
              return result + (item.num * item.retailPrice - item.num * item.goods.costPrice);
            }, 0);

            //设置当日出库数量及金额
            if (i == 0) {
              that.setData({
                dayDelivery: count,
                dayDeliveryPrice: price.toFixed(2),
                dayProfit: profit.toFixed(2)
              })
            }
          }
          countDelivery.push(count)
          countDayDeliveryPrice.push(price)
        }
        var result = {}
        result.countDay = countDay
        result.countEntering = countEntering
        result.countDelivery = countDelivery
        result.countDayEnteringPrice = countDayEnteringPrice
        result.countDayDeliveryPrice = countDayDeliveryPrice

        _callback(result)
        console.log("共查询到 " + results.length + " 条记录");
      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });
  },
  getDay: function (day){
    var that = this;
    var today = new Date();
    var targetday_milliseconds= today.getTime() + 1000 * 60 * 60 * 24 * day;
    today.setTime(targetday_milliseconds);
    var tYear = today.getFullYear();
    var tMonth = today.getMonth();
    var tDate = today.getDate();
    tMonth = that.handleMonth(tMonth + 1);
    tDate = that.handleMonth(tDate);
    return tYear + "-" + tMonth + "-" + tDate;
  },

  handleMonth: function (month) {
    var m = month;
    if (month.toString().length == 1) {
      m = "0" + month;
    }
    return m;
  },

  handleTip:function(){
    this.setData({
      tipShow:!this.data.tipShow
    })
  },

  touchHandler: function (e) {
    if (e.target.dataset.type == 'count') {
      finChart.scrollStart(e);
    }
    if (e.target.dataset.type == 'price') {
      finPriceChart.scrollStart(e);
    }
  },

  moveHandler: function (e) {
    if (e.target.dataset.type == 'count') {
      finChart.scroll(e);
    }
    if (e.target.dataset.type == 'price') {
      finPriceChart.scroll(e);
    }
  },

  touchEndHandler: function (e) {
    if(e.target.dataset.type == 'count'){
      finChart.scrollEnd(e);
      finChart.showToolTip(e, {
        format: function (item, category) {
          return category + ' ' + item.name + '：' + item.data
        }
      });
    }
    if (e.target.dataset.type == 'price'){
      finPriceChart.scrollEnd(e);
      finPriceChart.showToolTip(e, {
        format: function (item, category) {
          return category + ' ' + item.name + '：' + item.data + '（元）'
        }
      });
    }
  },

  //初始化图表
  initFinChart: function (windowWidth,data) {
    var that = this;
    finChart = new charts({
      canvasId: 'finCanvas',
      type: 'line',
      categories: data.countDay,
      animation: true,
      series: [{
        name: '入库',
        data: data.countEntering,
        format: function (val, name) {
          return val;
        }
      }, {
        name: '出库',
        data: data.countDelivery,
        format: function (val, name) {
          return val;
        }
      }],
      xAxis: {
        disableGrid: false
      },
      yAxis: {
        format: function (val) {
          return val.toFixed(0);
        },
        min: 0
      },
      width: windowWidth,
      height: 200,
      dataLabel: true,
      dataPointShape: true,
      enableScroll: true,
      extra: {
        lineStyle: 'curve'
      }
    })
  },

  initFinPriceChart: function (windowWidth, data) {
    var that = this;
    finPriceChart = new charts({
      canvasId: 'finPriceCanvas',
      type: 'line',
      categories: data.countDay,
      animation: true,
      series: [{
        name: '入库',
        data: data.countDayEnteringPrice,
        format: function (val, name) {
          return val;
        }
      }, {
        name: '出库',
        data: data.countDayDeliveryPrice,
        format: function (val, name) {
          return val;
        }
      }],
      xAxis: {
        disableGrid: false
      },
      yAxis: {
        format: function (val) {
          return val.toFixed(0);
        },
        min: 0
      },
      width: windowWidth,
      height: 200,
      dataLabel: true,
      dataPointShape: true,
      enableScroll: true,
      extra: {
        lineStyle: 'curve'
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    that.loadFinData(function (res) {
      that.setData({
        canvasSpinShow: false
      })
      that.initFinChart(windowWidth,res);
      that.initFinPriceChart(windowWidth, res)
    })
    
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