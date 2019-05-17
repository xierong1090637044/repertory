let that = this;
let Bmob = require('../utils/bmob.js');
let Bmob_new = require('../utils/bmob_new.js');
module.exports = {
  appId:"afaa8342776ad99ff0d49bca224de9b2",
  apiKey:"9eed865dc5914f2ecedcd63be31e33e9",
  pageSize:30,
  api:{
    fetchQRCode:'https://www.kuaizhan.com/common/encode-png?large=true&data='
  },

  //添加为总的记录 用于生成图表charts
  record_data: function (goods,type) {
    let userid = wx.getStorageSync('userid');
    let record_num = 0;
    let pointer = Bmob_new.Pointer('_User')
    let masterID = pointer.set(wx.getStorageSync('userid'));

    for (var i = 0; i < goods.length; i++) {
      record_num += goods[i].num;
    }

    const query = Bmob_new.Query("reocrd");
    query.equalTo("data", "==", this.getDay(0));
    query.equalTo("parent", "==", userid);
    query.equalTo("type", "==", type);
    query.find().then(res => {
      console.log(res)

      if (res.length == 0) {
        const query = Bmob_new.Query('reocrd');
        query.set("type", type);
        query.set("data", this.getDay(0));
        query.set("total", record_num);
        query.set("parent", masterID);
        query.save().then(res => {
          console.log(res)
        })
      } else {
        const query = Bmob_new.Query('reocrd');
        query.set('id', res[0].objectId) //需要修改的objectId
        query.set('total', res[0].total + record_num)
        query.save().then(res => {
          console.log(res)
        }).catch(err => {
          console.log(err)
        })
      }
    });
  },

  //发送小程序服务通知
  send_message: function (template_id, formId,info)
  {
    let modelData = {
      "touser": wx.getStorageSync("openid"),
      "template_id": "o0i_R4TsEvYaJ2OFU0G9JhwKleSDnSp3auSCCg-lhe8",
      "page": "pages/order_history/order_history",
      "form_id": formId,
      "data": {
        "keyword1": {
          "value": info.keyword1//that.data.goods[i].goodsName,
        },
        "keyword2": {
          "value": info.keyword2//that.data.goods[i].reserve
        },
        "keyword3": {
          "value": info.keyword3
        },
        "keyword4": {
          "value": info.keyword4//"出库"
        },
        "keyword5": {
          "value": info.keyword4//Y + "-" + M + "-" + D + " " + h + ":" + m
        }
      }
      , "emphasis_keyword": ""
    }

    Bmob_new.sendWeAppMessage(modelData).then(function (response) {
      console.log(response);
    }).catch(function (error) {
      console.log(error);
    });
  },

  //得到时间
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
    return tYear + "-" + tMonth + "-" + tDate;
  },

  handleMonth: function (month) {
    var m = month;
    if (month.toString().length == 1) {
      m = "0" + month;
    }
    return m;
  },
}