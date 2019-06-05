// pages/mine/add_class/add_class.js
const Bmob_new = require('../../../utils/bmob_new.js');
const Bmob = require('../../../utils/bmob.js');
let that;
let userid;
let class_text;
let get_id;
let edit_class_text;
let edit_secondclass_text;//二级分类的文字

let selected_id;//当前选择的一级分类的id
let dbname;//修改分类的数据库名字
Page({

  /*** 页面的初始数据*/
  data: {
    type:true
  },

  //选择分类情况下返回上一层
  goto_goods:function(e)
  {
    let item = e.currentTarget.dataset.item;
    console.log(item)
    wx.setStorageSync("class", item);
    wx.navigateBack({
      delta: 1
    })
  },

  //一级分类点击
  selected_this_one:function(e)
  {
    selected_id = e.currentTarget.dataset.id
    that.setData({ selected_id: e.currentTarget.dataset.id})
    that.query_second_class();
  },

  //添加二级分类点击
  add_secclass:function(e)
  {
    edit_secondclass_text =null;
    that.setData({ one_click:true})
  },

  //一级分类编辑点击出现底部弹窗
  show_operation:function(e)
  {
    get_id = e.currentTarget.dataset.id;
    dbname = e.currentTarget.dataset.dbname;
    var value = e.currentTarget.dataset.value;
    wx.showActionSheet({
      itemList: ['编辑', '删除'],
      success(res) {
        console.log(res.tapIndex)
        if (res.tapIndex == 0)
        {
          that.setData({ edit_visible: true, get_class_text: value});
        }else{
          that.delete_class_text();
        }
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },

  //删除此类别
  delete_class_text:function()
  {
    wx.showModal({
      title: '提示',
      content: '是否删除此分类',
      success(res) {
        if (res.confirm) {
          const query = Bmob_new.Query(dbname);
          query.destroy(get_id).then(res => {
            console.log(res)
            wx.showToast({ title: '删除成功' });
            that.getclass_list();
          }).catch(err => {
            console.log(err)
          })
        }
      }
    })
    
  },

  //修改输入框输入
  editclass_text:function(e)
  {
    edit_class_text = e.detail.detail.value;
  },

  //二级分类输入
  getclass_secondtext:function(e)
  {
    edit_secondclass_text = e.detail.detail.value;
  },

  //二级分类确定点击
  getclass_text_confrim_second:function()
  {
    that.handleClose();
    //console.log(edit_secondclass_text, selected_id)
    const pointer = Bmob_new.Pointer('class_user')
    const poiID = pointer.set(selected_id)

    const query = Bmob_new.Query('second_class');
    query.set("class_text", edit_secondclass_text)
    query.set("parent", poiID)
    query.save().then(res => {
      console.log(res)
      const relation = Bmob_new.Relation('class_user') // 需要关联的表
      const relID = relation.add([res.objectId]) //关联表中需要关联的objectId, 返回一个Relation对象, add方法接受string和array的类型参数
      const query = Bmob_new.Query('class_user')
      query.get(selected_id).then(res => {
        res.set('second', relID); // 将Relation对象保存到two字段中，即实现了一对多的关联
        res.save()
        
        that.query_second_class();
      })
    }).catch(err => {
      console.log(err)
    })
  },

  //确定修改
  getclass_text_edit:function()
  {
    const query = Bmob_new.Query(dbname);
    query.set('id', get_id);//需要修改的objectId
    query.set('class_text', edit_class_text);
    query.save().then(res => {
      console.log(res);
      that.setData({ edit_visible:false});
      wx.showToast({title: '修改成功'});
      that.getclass_list();
    }).catch(err => {
      console.log(err)
    })
  },

  //处理modal的显示与消失
  add_class: function() {
    that.setData({ visible: true });
  },

  handleClose: function () {
    that.setData({ visible: false, edit_visible: false, one_click:false});
  },

  //输入产品类别事件
  getclass_text: function (e) {
    class_text = e.detail.detail.value;
  },

  //modal点击确定事件
  getclass_text_confrim: function () {
    if (class_text == null || class_text =='')
    {
      wx.showToast({
        icon:"none",
        title: '请输入类别',
      })
    }else{
      wx.showLoading({ title: '添加中...' });
      const pointer = Bmob_new.Pointer('_User')
      const poiID = pointer.set(userid);

      const query = Bmob_new.Query('class_user');
      query.set("parent", poiID)
      query.set("class_text", class_text);
      query.save().then(res => {
        console.log(res);
        that.setData({ visible: false});
        that.getclass_list();
        wx.hideLoading();
      }).catch(err => {
        console.log(err)
      })
    }
    
  },

  //得到类别列表
  getclass_list: function () {
    wx.showLoading({title: '加载中...'})
    const query = Bmob_new.Query("class_user");
    query.equalTo("parent", "==", userid);
    query.find().then(res => {
      console.log(res);
      
      if(res.length == 0)
      {
        that.setData({ isEmpty: true });
      }else{
        selected_id = res[0].objectId;

        that.setData({ class_text: res, isEmpty: false, selected_id: selected_id });
        that.query_second_class();
      }
      wx.hideLoading();
    });
  },

  //根据id查询二级分类
  query_second_class(){
    wx.showLoading({ title: '加载中...' })
    const query = Bmob_new.Query("class_user");
    query.field('second', selected_id)
    query.relation('second_class').then(res => {
      //console.log(res);
      wx.hideLoading();
      that.setData({ second_class: res.results});
    })
  },

  /*** 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    that = this;
    if (options.type == 'select') //选择类别的状态
    {
      that.setData({type:false})
    }
    userid = wx.getStorageSync("userid");
    that.getclass_list();
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