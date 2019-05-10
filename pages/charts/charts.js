import F2 from '../../f2-canvas/lib/f2';
let Bmob = require('../../utils/bmob_new.js');
let config = require('../../utils/config.js');
let that;
let userid;
let showdata = []; //数据展示

Page({
  data: {
    opts: {
      lazyLoad: true // 延迟加载组件
    },
  },

  /** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    that = this;
    userid = wx.getStorageSync("userid");
  },

  /*** 生命周期函数--监听页面显示*/
  onShow: function () {
    var today = new Date();
    
    that.get_month_data(30,config.getDay(0),1)
    that.get_month_data(30, config.getDay(0), -1)
  },

  onReady() {
  },

  //max_day是天数，now_data是当前时间,//type是操作类型
  get_month_data:function(max_day,now_data,type)
  {
    const query = Bmob.Query("reocrd");
    query.equalTo("parent", "==", userid);
    query.equalTo("data", ">=", config.getDay(-max_day));
    query.equalTo("data", "<=", now_data);
    query.equalTo("type", "==", type);
    query.find().then(res => {
      //console.log(config.getDay(-max_day).split("-")[2]);
      for (let i = 0; i < max_day;i++)
      {
        //console.log(res[i])
        if(res[i]== null)
        {
          let record = new Object();
          record.value = 0;
          record.year = config.getDay(-i);
          record.type = type;
          record.country = (type == 1) ? "入库" : "出库";
          showdata.push(record);
        }else{
          if (res[i].data == config.getDay(-i)) {
            let record = new Object();
            record.value = res[i].total;
            record.year = config.getDay(-i);
            record.type = type;
            record.country = (type == 1) ? "入库" : "出库";
            showdata.push(record);
          } else {
            let record = new Object();
            record.value = 0;
            record.year = config.getDay(-i);
            record.type = type;
            record.country = (type ==1)?"入库":"出库";
            showdata.push(record);
          }
        }
      }
      
      if (showdata.length == max_day*2)
      {
        console.log(showdata)
        that.InitChart(showdata,"#area")
      }
      
    });
  },

  //生成区域图
  InitChart:function(data,canvas_id)
  {
    const self = this;
    self.chartComponent = self.selectComponent(canvas_id);
    self.chartComponent.init((canvas, width, height) => {
      const data = showdata;
      const chart = new F2.Chart({
        el: canvas,
        width,
        height
      });
      chart.source(data,{
        year: {
          range: [0, 1],
          type: 'timeCat',
          mask: 'MM-DD'
        },
        sales: {
          tickCount: 1
        }
      });
      chart.axis('year', {
        label(text, index, total) {
          const textCfg = {};
          if (index === 0) {
            textCfg.textAlign = 'left';
          }
          if (index === total - 1) {
            textCfg.textAlign = 'right';
          }
          return textCfg;
        }
      });
      chart.axis('value', {
        label(text) {
          return {
            text: text
          };
        }
      });
      // tooltip 与图例结合
      chart.tooltip({
        showCrosshairs: true,
        showItemMarker: false,
        custom: true, // 自定义 tooltip 内容框
        onChange(obj) {
          const legend = chart.get('legendController').legends.top[0];
          const tooltipItems = obj.items;
          const legendItems = legend.items;
          const map = {};
          legendItems.map(item => {
            map[item.name] = Object.assign({}, item);
          });
          tooltipItems.map(item => {
            const { name, value,year } = item;
            //console.log(item)
            if (map[name]) {
              map[name].value = value;
            }
          });
          legend.setItems(Object.values(map));
        },
        
        onHide() {
          const legend = chart.get('legendController').legends.top[0];
          legend.setItems(chart.getLegendItems().country);
        },
      });
      chart.area().position('year*value').color('country').shape('smooth');
      chart.line().position('year*value').color('country').shape('smooth');
      chart.render();
      return chart;
    });
  },
});
