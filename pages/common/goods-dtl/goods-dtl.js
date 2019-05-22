// pages/common/goods-dtl/goods-dtl.js
let { $Message } = require('../../../component/base/index');
const Bmob = require('../../../utils/bmob.js');
const Bmob_new = require('../../../utils/bmob_new.js')
let _ = require('../../../utils/we-lodash.js');
let config = require('../../../utils/config.js');
let that;

let product_id;
let good; //产品信息
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current: '1',
    view2:"none",
    view3: "none",
    spinShow: true,
    packingUnits: config.units,
    goodsReserve: {},
    painting: {},
    shareImage: ''
  },

  //tab改变
  handleChange({ detail }) {
    this.setData({
      current: detail.key,
    });
    if (detail.key == 1) {
      that.setData({view1:"block",view2:"none"})
    } else if(detail.key == 2) {
      that.setData({ view1: "none", view2: "block",view3:"none" });
      that.get_opera_detail(product_id, false);
      
    } else if (detail.key == 3) {
      that.setData({ view1: "none", view2: "block" });
      that.get_opera_detail(product_id, true);
    }
  },

  //点击预览"条形码并下载"
  handlePreviewImage: function (e) {
    var single_code = e.target.dataset.qrcode;
    var type = e.target.dataset.type;

    wx.showActionSheet({
      itemList: ['二维码', '条形码'],
      success(res) {
        console.log(res.tapIndex)
 
          wx.showLoading({ title: '加载中...' })
          wx.request({
            url: (res.tapIndex == 0) ? 'https://route.showapi.com/887-1' : 'https://route.showapi.com/1129-1',
            data: {
              showapi_appid: '84916',
              showapi_sign: 'ad4b63369c834759b411a9d7fcb07ed7',
              content: single_code + "-" + type,
              height: "80",
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success(res) {
              wx.hideLoading();
              wx.previewImage({
                current: res.data.showapi_res_body.imgUrl,
                urls: [res.data.showapi_res_body.imgUrl]
              })
            }
          });
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },

  //打印点击功能
  print_goodinfo: function () {
    var orderInfo;
    orderInfo = '<CB>商品信息</CB><BR>';
    orderInfo += '--------------------------------<BR>';
    orderInfo += '产品名称：　　 ' + good.goodsName + '<BR>';
    if (good.stocks != null) orderInfo += '存放仓库：　　 ' + good.stocks.stock_name + '<BR>';

    if (good.position) orderInfo += '货架位置：　　 ' + good.position + '<BR>';
    if (good.producttime) orderInfo += '生产日期：　　 ' + good.producttime + '<BR>';
    if (good.nousetime) orderInfo += '失效日期：　　 ' + good.nousetime + '<BR>';
    orderInfo += '当前库存：　　 ' + good.reserve + '<BR>';
    orderInfo += '产品规格:　　　' + good.packageContent * good.packingUnit + '<BR>';
    orderInfo += '进货价格:      ' + good.costPrice + '<BR>';
    orderInfo += '零售价格:      ' + good.retailPrice + '<BR>';
    orderInfo += '货损数量:      ' + good.bad_num + '<BR>';
    orderInfo += '--------------------------------<BR>';
    orderInfo += '产品二维码：<BR>';
    if (good.productCode == "") {
      orderInfo += '<QR>' + good.goodsId + '-false</QR>';//把二维码字符串用标签套上即可自动生成二维码
    } else {
      orderInfo += '<QR>' + good.productCode + '-true</QR>';//把二维码字符串用标签套上即可自动生成二维码
    }

    config.print_by_code(orderInfo);
  },

  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    that = this;
    var flag = options.type;
    var title = flag==1?'产品详情':'库存详情';
    wx.setNavigationBarTitle({
      title: '库存助手-'+title
    });

    if(options.id !=null )
    {
      product_id = options.id;
      const query = Bmob_new.Query('Goods');
      if(options.type == true)
      {
        query.equalTo("productCode", "==", options.id)
      }else{
        query.equalTo("objectId", "==", options.id);
      }
      query.find().then(res => {
        console.log(res)
        that.setData({ goodsReserve: res[0] });

        good = res[0];
      })
    }else{
      var item = JSON.parse(wx.getStorageSync('item'));
      good = item;
      product_id = item.goodsId;

      this.setData({
        goodsReserve: item
      })
    }
  },

  /*** 生命周期函数--监听页面初次渲染完*/
  onReady: function () {

  },

  /** 生命周期函数--监听页面显示*/
  onShow: function () {

  },

  onShareAppMessage(res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: that.data.goodsReserve.goodsName,
      path: '/pages/common/goods-dtl/goods-dtl?id=' + product_id
    }
  },

  //得到该产品的操作详情
  get_opera_detail:function(id,is_today)
  {
    const query = Bmob_new.Query("Bills");
    const query1 = query.equalTo("type", '==', 1);
    const query2 = query.equalTo("type", '==', -1);
    query.order("-createdAt");
    query.equalTo("goodsId", "==", id);
    query.or(query1, query2);
    if (is_today) query.equalTo("createdAt", ">=", that.getDay(0));
    query.find().then(res => {
      that.setData({ detail: res});

      if(is_today)
      {
        var in_reserve_num = 0;
        var out_reserve_num = 0;

        for (let item of res) {
          if(item.type == 1)
          {
            in_reserve_num = item.num + in_reserve_num;
          }else{
            out_reserve_num = item.num + out_reserve_num;
          }
        }

        that.setData({ in_reserve_num: in_reserve_num, out_reserve_num: out_reserve_num,view3:"flex"})
      }
      
    });
  },

  getDay: function (day) {
    var that = this;
    var today = new Date();
    var targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
    today.setTime(targetday_milliseconds);
    var tYear = today.getFullYear();
    var tMonth = today.getMonth();
    var tDate = today.getDate();
    tMonth = that.handleMonth(tMonth + 1);
    tDate = that.handleMonth(tDate);
    return tYear + "-" + tMonth + "-" + tDate + " "+"00:00:00";
  },

  handleMonth: function (month) {
    var m = month;
    if (month.toString().length == 1) {
      m = "0" + month;
    }
    return m;
  },

})