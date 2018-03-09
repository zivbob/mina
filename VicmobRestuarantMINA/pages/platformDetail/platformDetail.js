// platformDetail.js
var config = require('../../utils/config/config.js');
var configUrl = require('../../utils/config/configUrl.js');
var Slider = require('../../template/slider/slider.js');
var times = 0;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    platformDetail: {
      id: 0,
      thumb: '../../imgs/index/banner_1.jpg',
    },
    flag1: false,
    haveRefresh: false,//判断是否是下拉刷新
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.showLoad();
    this.doRequest();
  },
  //网络请求
  doRequest: function () {
    var self = this;
    //调用模本页的检查网络连接
    this.slider = new Slider(this);
    this.slider._goCheckout();
    wx.request({
      url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/platformConfig/message',
      data: {
        minaId: config.minaId,
        appId: config.appId
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log('123', res.data)
        if (res.data == null || res.data == '') {
          self.setData({
            flag1: true,
          });
        } else {
          self.setData({
            platformDetail: res.data,
            flag1: true
          });
        }
      },
      fail: function (res) {
        setTimeout(function () {
          wx.stopPullDownRefresh()
          wx.hideNavigationBarLoading()
          self.hideLoad();
        }, 500)
        if (self.data.haveRefresh) {
          wx.showToast({
            title: '刷新失败',
          })
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var self = this;
    if (!self.data.flag1) {
      setTimeout(function () {
        self.onReady();
      }, 500);
    } else if (self.data.flag1 && self.data.haveRefresh) {
      if (config.minaNickName == null || config.minaNickName == "") {

      } else {
        //上方导航标题
        wx.setNavigationBarTitle({
          title: config.minaNickName,
        })
      }
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
      if (config.minaNickName == null || config.minaNickName == "") {

      } else {
        //上方导航标题
        wx.setNavigationBarTitle({
          title: config.minaNickName,
        })
      }
      setTimeout(function () {
        self.hideLoad();
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
      }, 300)
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
  //拨打电话
  telephone: function () {
    var phone = this.data.platformDetail.mobile;
    wx.makePhoneCall({
      phoneNumber: phone, //仅为示例，并非真实的电话号码
    })
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  //下拉刷新
  onPullDownRefresh: function () {
    var self = this;
    self.setData({
      flag1: false,
      haveRefresh: true
    })
    wx.showNavigationBarLoading() //在标题栏中显示加载
    self.doRequest();
    self.onReady()
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