// goods.js
var WxParse = require('../../wxParse/wxParse.js');
var configUrl = require('../../utils/config/configUrl.js');
var Slider = require('../../template/slider/slider.js');
var times = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods: {
    },
    goodsId: '',
    flag1: false,
    haveRefresh: false,//判断是否是下拉刷新
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var goodsId = options.id;
    console.log("434343", goodsId)
    this.setData({
      goodsId: goodsId,
    })
    this.showLoad();
    this.doRequest(goodsId);
  },
  doRequest: function (goodsId) {
    var that = this;
    //调用模本页的检查网络连接
    this.slider = new Slider(this);
    this.slider._goCheckout();
    //获得指定商品的信息
    wx.request({
      url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/goods/message',
      data: {
        goodsId: goodsId
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        that.setData({
          goods: res.data,
          flag1: true
        })
        var article = res.data.description;
        WxParse.wxParse('article', 'html', article, that, 5);
      },
      fail: function (res) {
        if (that.data.haveRefresh) {
          wx.showToast({
            title: '刷新失败',
          })
        }
      }
    })

  },

  /**
  * 生命周期函数--监听页面初次渲染完成
  */
  onReady: function () {
    var self = this;
    if (!self.data.flag1) {
      setTimeout(function () {
        self.onReady();
      }, 500)
    } else if (self.data.flag1 && self.data.haveRefresh) {
      setTimeout(function () {
        // self.hideLoad();
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        wx.showToast({
          title: '刷新成功',
        })
      }, 300)
    }
    else {
      setTimeout(function () {
        self.hideLoad();
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
      }, 300)
    }
  },


  //显示加载框
  showLoad: function () {
    wx.showLoading({
      title: '加载中...',
      mask: true,
    })
  },
  //隐藏加载框
  hideLoad: function () {
    wx.hideLoading()
  },
  //下拉刷新
  onPullDownRefresh: function () {
    var self = this;
    wx.showNavigationBarLoading() //在标题栏中显示加载
    self.setData({
      flag1: false,
      haveRefresh: true
    })
    self.doRequest(self.data.goodsId);
    self.onReady()
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
})