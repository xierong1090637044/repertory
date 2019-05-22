var Bmob = require('../../../utils/bmob_new.js');
var config = require('../../../utils/config.js');
var that;
var id;
Page({

  /*** 页面的初始数据*/
  data: {
    products: "",
    detail: "",
  },

  //打印点击功能
  print_goodinfo: function () {
    let detail = that.data.detail;
    let products = that.data.products;
    console.log(products)

    if (detail.type == 3) {
      orderInfo = '<CB>盘点单</CB><BR>';
      orderInfo += '--------------------------------<BR>';
      for (let i = 0; i < products.length; i++) {
        orderInfo += '产品名称：' + products[i].goodsName + '<BR>';
        orderInfo += '盘点前库存：' + products[i].reserve + '<BR>';
        orderInfo += '盘点后库存：' + products[i].now_reserve + '<BR>';
        orderInfo += '--------------------------------<BR>';
      }
    } else if (detail.type == 2) {
      orderInfo = '<CB>退货单</CB><BR>';
      orderInfo += '--------------------------------<BR>';
      for (let i = 0; i < products.length; i++) {
        orderInfo += '产品名称：' + products[i].goodsName + '<BR>';
        orderInfo += '零售价：' + products[i].retailPrice + '<BR>';
        orderInfo += '数量    ：X' + products[i].num + '<BR>';
        orderInfo += '<RIGHT>总计：' + products[i].total_money + '</RIGHT>';
        orderInfo += '--------------------------------<BR>';
        orderInfo += '退货明细：<BR>';
        if (detail.custom != null) {
          orderInfo += '客户姓名：' + detail.custom.custom_name + '<BR>';
        } else {
          orderInfo += '未记录客户 <BR>';
        }
      }
      orderInfo += '<BOLD><RIGHT>全部总计：' + detail.all_money + '</RIGHT></BOLD>';
      orderInfo += '--------------------------------<BR>';
    } else {
      var orderInfo;
      if (detail.type == 1) {
        orderInfo = '<CB>入库单</CB><BR>';
      } else {
        orderInfo = '<CB>出库单</CB><BR>';
      }
      orderInfo += '--------------------------------<BR>';
      for (let i = 0; i < products.length; i++) {
        orderInfo += '产品名称：' + products[i].goodsName + '<BR>';
        orderInfo += '实际单价：' + products[i].retailPrice + '<BR>';
        orderInfo += '数量    ：X' + products[i].num + '<BR>';
        orderInfo += '<RIGHT>总计：' + products[i].total_money + '</RIGHT>';
        orderInfo += '--------------------------------<BR>';
      }
      orderInfo += '<BOLD><RIGHT>全部总计：' + detail.all_money + '</RIGHT></BOLD>';
      orderInfo += '--------------------------------<BR>';
      if (detail.type == 1) {
        orderInfo += '开单明细：<BR>';
        orderInfo += '<BR>';
        if (detail.producer != null) {
          orderInfo += '供货商姓名：' + detail.producer.producer_name + '<BR>';
        }
        if (detail.real_money == null) {
          orderInfo += '实际收款：未填写 <BR>';
        } else {
          orderInfo += '实际收款：' + detail.real_money + '<BR>';
        }
        if (detail.debt > 0) {
          orderInfo += '本次欠款：' + detail.debt + '<BR>';
        }
        orderInfo += '--------------------------------<BR>';
      }

      if (detail.type == -1) {
        orderInfo += '开单明细：<BR>';
        orderInfo += '<BR>';
        if (detail.producer != null) {
          orderInfo += '客户姓名：' + detail.custom.custom_name + '<BR>';
        }
        if (detail.real_money == null) {
          orderInfo += '实际收款：未填写 <BR>';
        } else {
          orderInfo += '实际收款：' + detail.real_money + '<BR>';
        }

        if (detail.debt > 0) {
          orderInfo += '本次欠款  ：' + detail.debt + '<BR>';
        }

        orderInfo += '--------------------------------<BR>';
      }
    }

    orderInfo += '操作者：' + detail.opreater.nickName + '<BR>';
    orderInfo += '备注：' + (detail.beizhu == '') ? '备注：暂无' + '<BR>' : detail.beizhu + '<BR>';
    orderInfo += '操作时间：' + detail.createdAt + '<BR>';

    config.print_by_code(orderInfo);
  },

  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    id = options.id;
    that = this;
    that.getdetail(id);
  },

  /*** 生命周期函数--监听页面初次渲染完成*/
  onReady: function () {

  },

  /*** 生命周期函数--监听页面显示*/
  onShow: function () {

  },

  getdetail: function (id) {
    that.setData({ spinShow: true });
    const query = Bmob.Query('order_opreations');
    query.include("opreater", "custom", "producer");
    query.get(id).then(res => {
      console.log(res);
      that.setData({ detail: res });
      const query = Bmob.Query('order_opreations');
      query.include("goodsId");
      query.field('relations', res.objectId);
      query.relation('Bills').then(res => {
        //console.log(res);
        that.setData({ products: res.results, spinShow: false });
      })
    }).catch(err => {
      console.log(err)
    })
  },

  //数据撤销点击
  revoke: function () {
    wx.showModal({
      title: '提示',
      content: '数据撤销后不可恢复，请谨慎撤销！',
      success(res) {
        if (res.confirm) {
          wx.showLoading({ title: '撤销中...' })
          const query = Bmob.Query('order_opreations');
          query.destroy(that.data.detail.objectId).then(res => {
            if (that.data.detail.debt > 0) {
              that.delete_custom();
            }

            for (var i = 0; i < that.data.products.length; i++) {
              that.delete_bill(i);
            }
          }).catch(err => {
            console.log(err)
          })
        }
      }
    })

  },

  //删除单据
  delete_bill: function (i) {
    var product = that.data.products[i];

    const query = Bmob.Query('Bills');
    query.destroy(product.objectId).then(res => {
      const query1 = Bmob.Query('Goods');
      query1.set('id', product.goodsId.objectId);
      if (product.type == 1) {
        query1.set('reserve', product.goodsId.reserve - product.num);
      } else if (product.type == -1) {
        query1.set('reserve', product.goodsId.reserve + product.num);
      }
      query1.save().then(res => {
        if (i == (that.data.products.length - 1)) {
          wx.hideLoading();
          wx.navigateBack({ delta: 1 })
          setTimeout(function () {
            wx.showToast({ title: '撤销成功' })
          }, 1000);
        }
      })
    });
  },

  //如果客户有欠款则删除欠款
  delete_custom: function () {
    console.log(that.data.detail.custom.objectId)
    const query1 = Bmob.Query('customs');
    query1.set('id', that.data.detail.custom.objectId);
    query1.set('debt', that.data.detail.custom.debt - that.data.detail.debt);
    query1.save();
  }

})