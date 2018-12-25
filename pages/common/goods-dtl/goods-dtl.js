// pages/common/goods-dtl/goods-dtl.js
var { $Message } = require('../../../component/base/index');
const Bmob = require('../../../utils/bmob.js')
var _ = require('../../../utils/we-lodash.js');
var config = require('../../../utils/config.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    spinShow: true,
    packingUnits: config.units,
    goodsReserve: {},
    painting: {},
    shareImage: ''
  },
  handlePreviewImage: function (e) {
    var qrCode = e.target.dataset.qrcode
    wx.previewImage({
      current: qrCode,
      urls: [qrCode]
    })
  },
  saveImgToPhotosAlbumTap: function (e) {
    var qrCode = e.target.dataset.qrcode
    wx.downloadFile({
      url: qrCode,
      success: function (res) {
        console.log(res)
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (res) {
            console.log(res)
          },
          fail: function (res) {
            console.log(res)
            console.log('fail')
          }
        })
      },
      fail: function () {
        console.log('fail')
      }
    })
  },

  // 绘制图片
  handleQRCodeDraw(item) {
    this.setData({
      painting: {
        width: 375,
        height: 520,
        clear: true,
        views: [
          {
            type: 'image',
            url: '/images/common/share-bg.png',
            top: 0,
            left: 0,
            width: 375,
            height: 520
          },
          {
            type: 'image',
            url: item.avatarUrl,//头像
            top: 27.5,
            left: 29,
            width: 55,
            height: 55
          },
          {
            type: 'image',
            url: '/images/common/ring.png',//头像圆圈
            top: 27.5,
            left: 29,
            width: 55,
            height: 55
          },
          {
            type: 'text',
            content: '您的好友【' + item.userName + '】',
            fontSize: 16,
            color: '#402D16',
            textAlign: 'left',
            top: 33,
            left: 96,
            bolder: true
          },
          {
            type: 'text',
            content: '分享给您一件产品，可扫码向他申请',
            fontSize: 15,
            color: '#563D20',
            textAlign: 'left',
            top: 59.5,
            left: 96
          },
          {
            type: 'image',
            url: item.qrCode,//产品二维码
            top: 120,
            left: 70,
            width: 220,
            height: 220
          },
          {
            type: 'text',
            content: '产品名称：' + item.goodsName,
            fontSize: 16,
            lineHeight: 21,
            color: '#383549',
            textAlign: 'left',
            top: 360,
            left: 120,
            width: 125,
            MaxLineNumber: 2,
            breakWord: true,
            bolder: true
          },
          {
            type: 'image',
            url: '/images/common/mp-code.png',
            top: 430,
            left: 85,
            width: 68,
            height: 68
          },
          {
            type: 'text',
            content: '长按保存图中二维码 感谢使用库存助手',
            fontSize: 14,
            color: '#383549',
            textAlign: 'left',
            top: 450,
            left: 165.5,
            lineHeight: 20,
            MaxLineNumber: 2,
            breakWord: true,
            width: 125
          }
        ]
      }
    })
  },
  handleQRCodeSave() {
    var that = this
    var url = this.data.shareImage
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          // 设置询问
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success(res) {
              that.saveImage(url)
            },
            fail(err) {
              console.log(err)
            },
            complete() { }
          })
        }
        else {
          that.saveImage(url)
        }
      }
    })
  },
  saveImage(url) {
    console.log(url)
    wx.saveImageToPhotosAlbum({
      filePath: url,
      success(res) {
        console.log(res)
        wx.showToast({
          title: '保存图片成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail(res) {
        console.log(res)
      },
      complete(res) {
        console.log(res)
      }
    })
  },
  eventGetImage(event) {
    this.setData({
      spinShow: false
    });
    const { tempFilePath, errMsg } = event.detail
    if (errMsg === 'canvasdrawer:ok') {
      this.setData({
        shareImage: tempFilePath
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var flag = options.type
    var title = flag==1?'产品详情':'库存详情'
    wx.setNavigationBarTitle({
      title: '库存助手-'+title
    })
    var item = JSON.parse(wx.getStorageSync('item'))
    this.setData({
      goodsReserve: item
    })
    this.handleQRCodeDraw(item)
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