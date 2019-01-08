// pages/mine/about-us/about-us.js
var app = getApp();
Page({
  data: {
    year: '',
    painting: {},
    shareImage: ''
  },
  handlePreviewImage: function (e) {
    var qrCode = 'http://bmob-cdn-23134.b0.upaiyun.com/2018/12/25/8511c16940b3869c804bf8231010a067.jpg'
    wx.previewImage({
      current: qrCode,
      urls: [qrCode]
    })
  },
  // 绘制图片
  handleQRCodeDraw() {
    this.setData({
      painting: {
        width: 380,
        height: 380,
        clear: true,
        views: [
          {
            type: 'image',
            url: '/images/common/admiring-qrcode.png',
            top: 0,
            left: 0,
            width: 380,
            height: 380
          }
        ]
      }
    })
  },
  eventGetImage(event) {
    const { tempFilePath, errMsg } = event.detail
    if (errMsg === 'canvasdrawer:ok') {
      this.setData({
        shareImage: tempFilePath
      })
    }
  },
  onLoad: function () {
    var that = this
    that.setData({
      year: new Date().getFullYear()
    });
  },
  onReady: function () {
    //this.handleQRCodeDraw()
  }
})
