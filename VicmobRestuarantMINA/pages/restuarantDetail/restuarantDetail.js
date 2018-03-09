// restuantantDetail.js
var config = require('../../utils/config/config.js');
var configUrl = require('../../utils/config/configUrl.js');
var WxParse = require('../../wxParse/wxParse.js');
var app = getApp();
var server = require('../../utils/server');
var Slider = require('../../template/slider/slider.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    banners: [],
    flag1: false,
    flag2: false,
    flag: 0,
    shop: {},
    shopAccount: {},
    restaurantId: '1',//门店id（用于缓存数据时使用）
    haveRefresh: false,//判断是否是下拉刷新
    showGoodsDetail: false,
    bannersCustomPic: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var shopId = options.id;
    this.setData({
      restaurantId: shopId
    })
    this.showLoad();
    this.doRequest(shopId);
  },
  doRequest: function (shopId) {
    var that = this;
    //调用模本页的检查网络连接
    this.slider = new Slider(this);
    this.slider._goCheckout();
    //获取商家的信息
    wx.request({
      url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/store/message',
      data: {
        storeId: shopId,
        minaId: config.minaId,
        appId: config.appId
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log("res",res.data)
        var shop = {};
        if (shop != null) {

          shop = res.data;
          var businessHours = shop.businessHours;
          var businessHoursArray = businessHours.split(";");
          var businessHoursList = [];
          for (var i = 0; i < businessHoursArray.length; i++) {
            businessHoursList.push(JSON.parse(businessHoursArray[i]));
          }
          shop.businessHours = businessHoursList;
        }

        var description = shop.description;

        WxParse.wxParse('description', 'html', description, that, 5);
        that.setData({
          flag1: true,
          shop: shop
        })
        //处理轮播图
        var slide = res.data.thumbs;
        var bannersOld = '';
        if (slide != "" && slide != null && slide != "null") {
          var slideArray = slide.split("|");
          bannersOld = '[';
          for (var i = 1; i < slideArray.length; i++) {
            bannersOld += '{"img":"' + slideArray[i] + '"},'
            if (i == slideArray.length - 1) {
              bannersOld = bannersOld.substring(0, bannersOld.length - 1);
            }
          }
          bannersOld += ']';
        } else {
          bannersOld = '[]';
        }
        //处理店面环境图
        var customPic = res.data.customPic;
        var customPicOld = '';
        if (customPic != "" && customPic != null && customPic != "null") {
          var customPicArray = customPic.split("|");
          customPicOld = '[';
          for (var i = 1; i < customPicArray.length; i++) {
            customPicOld += '{"img":"' + customPicArray[i] + '"},'
            if (i == customPicArray.length - 1) {
              customPicOld = customPicOld.substring(0, customPicOld.length - 1);
            }
          }
          customPicOld += ']';
        } else {
          customPicOld = '[]';
        }
        that.setData({
          banners: JSON.parse(bannersOld),
          bannersCustomPic: JSON.parse(customPicOld),
        })
        
      },
      fail: function (res) {
        wx.stopPullDownRefresh()
        wx.hideNavigationBarLoading()
        that.hideLoad();
        if (that.data.haveRefresh) {
          wx.showToast({
            title: '刷新失败',
          })
        }
      }

    })
    //获取商店的所有商品的信息（用于计算这家店的总销量）
    wx.request({
      url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/goods/message/all',
      data: {
        storeId: shopId,
        minaId: config.minaId,
        appId: config.appId
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var account = 0;
        if (res.data.length > 0) {
          for (var i = 0; i < res.data.length; i++) {
            account += res.data[i].sailed;
          }
        }
        that.setData({
          flag2: true,
          shopAccount: account
        })

      },
      fail: function (res) {
        wx.stopPullDownRefresh()
        wx.hideNavigationBarLoading()
        that.hideLoad();
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var self = this;
    if (!self.data.flag1 || !self.data.flag2) {
      setTimeout(function () {
        self.onReady();
      }, 1000);

    } else if (self.data.flag1 && self.data.flag2 && self.data.haveRefresh) {
      self.setData({
        flag: 1
      })
      setTimeout(function () {
        // self.hideLoad();
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        wx.showToast({
          title: '刷新成功',
        })
      }, 300)
    } else {
      self.setData({
        flag: 1
      })
      setTimeout(function () {
        self.hideLoad();
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
      }, 300)
    }
  },

  // tapTese: function () {
  //   var self = this;
  //   self.setData({
  //     flag: 2,
  //     showGoodsDetail: true
  //   })
  // },
  tapClose: function () {
    var self = this;
    self.setData({
      flag: 1,
      showGoodsDetail: false
    })
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
  tapWaimai: function () {
    wx.showModal({
      title: '提示',
      content: '程序员正在开发中！',
      showCancel: false
    });
  },


  //下拉刷新
  onPullDownRefresh: function () {
    var self = this;
    var shopId = self.data.restaurantId;
    self.setData({
      flag1: false,
      flag2: false,
      haveRefresh: true
    })
    if (shopId != null) {
      wx.showNavigationBarLoading() //在标题栏中显示加载
      self.doRequest(shopId);
      self.onReady()
    }
  },


  //拨打电话
  telephone: function () {
    var phone = this.data.shop.telephone;
    wx.makePhoneCall({
      phoneNumber: phone, //仅为示例，并非真实的电话号码
    })
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