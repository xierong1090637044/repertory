// pages/mine/test/test.js
const Bmob = require('../../../utils/bmob.js')
var config = require('../../../utils/config.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },
  submitInfo: function (e) {
    var temp = {
      "touser": 'oI2Gl5Dj9kf1zbOMx3LUVCqfLFmw',
      "template_id": "fVUWEpnYhDXLK17Ys7gKrp832b_mjRR47ML7DBQL2_Q",
      "page": "",
      "form_id": 'd011b7c4bd222f6adc02476d3054b0fe',
      "data": {
        "keyword1": {
          "value": "开发者",
          "color": "#173177"
        },
        "keyword2": {
          "value": "笑靥"
        },
        "keyword3": {
          "value": "开发者已关注您反馈的问题，特邀您添加开发者微信864822121进一步沟通"
        }
      },
      "emphasis_keyword": ""
    }

    Bmob.sendMessage(temp).then(function (obj) {
      console.log('发送成功')
    },
    function (err) {
      console.log(err)
    });
  },
  handleClearBillsDirtyRead: function () {//删除Bills中的脏数据
    var Bills = Bmob.Object.extend("Bills");
    var queryBills = new Bmob.Query(Bills);
    var skip = 0
    queryBills.limit(1000)
    queryBills.include('goodsId')
    var objects = []
    var total = []
    var sync = 1
    do {
      sync = 0
      if (skip == 2500) {
        break
      }
      queryBills.skip(skip)
      queryBills.find({
        success: function (results) {
          sync = 1
          if(results.length==0){
            sync = 0
          }
          total = total.concat(results)
          for (var i = 0; i < results.length; i++) {
            if (results[i].get('goodsId').goodsName == undefined) {
              objects.push(results[i])
            }
          }
          console.log("共查询到 " + results.length + " 条记录");
        },
        error: function (error) {
          console.log("查询失败: " + error.code + " " + error.message);
        }
      });
      skip = skip + 500
    } while (sync);
    setTimeout(()=>{
      console.log(objects.length)
    },2000)
    
    // Bmob.Object.destroyAll(objects).then(function () {
    //   console.log('删除成功')
    // },
    // function (error) {
    //   console.log('删除失败')
    // });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.handleClearBillsDirtyRead()
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