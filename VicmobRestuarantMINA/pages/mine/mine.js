var app = getApp();
var server = require('../../utils/server');
var Slider = require('../../template/slider/slider.js');

Page({
  data: {
    userInfo: {},
    filterId: 1,
    icons: [
      [
        {
          id: 2,
          img: '/imgs/images/navli1.png',
          name: '我的地址',
          url: ''
        },
      ]
    ],
    shops: app.globalData.shops,
    telephone: "4008286877",
    actionSheetHidden: true,
    actionSheetItems: [
      { bindtap: 'Menu1', txt: '菜单1' },
    ],
  },
  onLoad: function () {
    var that = this
    //调用模本页的检查网络连接
    this.slider = new Slider(this);
    this.slider._goCheckout();
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
  },
  onShow: function () {
    var self = this
    self.setData({
      userInfo: app.globalData.userInfo
    });

  },
  onReady: function () {
    var self = this
    self.setData({
      userInfo: app.globalData.userInfo
    });
  },

  toIcon: function (e) {
    wx.navigateTo({
      url: '../address/address',
    })
  },
  //拨打客服电话，跳出弹出框
  toPhone: function () {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },

  //是否显示底部弹出框
  actionSheetbindchange: function () {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  //绑定menu1的事件
  bindMenu1: function () {
    var phone = this.data.telephone;
    wx.makePhoneCall({
      phoneNumber: phone, 
    })
    this.setData({
      menu: 1,
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },

  onScroll: function (e) {
    if (e.detail.scrollTop > 100 && !this.data.scrollDown) {
      this.setData({
        scrollDown: true
      });
    } else if (e.detail.scrollTop < 100 && this.data.scrollDown) {
      this.setData({
        scrollDown: false
      });
    }
  },


  //跳转到订单列表页面
  oredertap: function () {
    wx.switchTab({
      url: '../order/order',
    })
  },
  //关于我们
  ustap: function () {
    wx.navigateTo({
      url: '../platformDetail/platformDetail',
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '微餐饮小程序',
      path: '/pages/index/index',
      success: function (res) {

      },
      fail: function () {

      }
    }
  }
});

