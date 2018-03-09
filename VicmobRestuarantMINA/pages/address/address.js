// address.js
var app = getApp();
var server = require('../../utils/server');
var config = require('../../utils/config/config.js');
var configUrl = require('../../utils/config/configUrl.js');
var Slider = require('../../template/slider/slider.js');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    allAddress: [],//地址列表
    radioindex: '',
    showAddress: false,//显示地址
    flag1: false,
    haveRefresh: false,//判断是否是下拉刷新
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    if (!self.data.haveRefresh) {
      self.showLoad();//显示加载中
    }
    //调用模本页的检查网络连接
    this.slider = new Slider(this);
    this.slider._goCheckout();
    var radioindex = wx.getStorageSync('radioindex')//得到默认地址的缓存
    if (app.globalData.fansId == null || app.globalData.fansId == '' || app.globalData.fansId == 'undefined') {
      wx.showModal({
        title: '提示',
        content: '页面数据异常，请重新进入',
        showCancel: false,
      })
      setTimeout(function () {
        self.hideLoad();
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
      }, 200)
    } else {
      wx.request({
        url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/addresses/message/address',
        method: 'POST',
        data: {
          minaId: config.minaId,
          fansId: app.globalData.fansId,
          appId: config.appId
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          console.log("---------------addresslist---------------------------")
          console.log(res.data);
          for(var i = 0;i<res.data.length;i++){
            if (res.data[i].province == null || res.data[i].province == '' || res.data[i].city == null || res.data[i].city == '' || res.data[i].country == null || res.data[i].country == ''){
              res.data[i].province='';
              res.data[i].country ='';
              res.data[i].city = '';
            }
          }
          
          self.setData({
            allAddress: res.data,
            radioindex: radioindex,
            flag1: true
          })
          console.log(self.data.allAddress);
        },
        fail: function (res) {
          setTimeout(function () {
            self.hideLoad();
            wx.hideNavigationBarLoading()
            wx.stopPullDownRefresh()
          }, 300)
          if (self.data.haveRefresh) {
            wx.showToast({
              title: '刷新失败',
            })
          }
        }
      })
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var self = this;
    if (!self.data.flag1) {
      setTimeout(function () {
        self.onReady()
      }, 500)
    } else if (self.data.flag1 && self.data.haveRefresh) {
      setTimeout(function () {
        // self.hideLoad();
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        wx.showToast({
          title: '刷新成功',
        })
      }, 100)
    } else {
      setTimeout(function () {
        self.hideLoad();
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
      }, 100)
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var self = this;
    if (self.data.showAddress) {
      self.onLoad()
      self.onReady()
    }
  },
  //新增地址
  addAddress:function(){
    wx.navigateTo({
      url: '../addAddress/addAddress',
    })
  },
  //地址改变监听
  addressChange: function (e) {
    var addressId = e.currentTarget.dataset.id;
    console.log("-=-===-addressId-=-=-=-=-=")
    console.log(addressId)
    var that = this
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面

    prevPage.setData({
      hasLocation: true
    })
    wx.setStorageSync('radioindex', addressId)
    wx.setStorage({
      key: 'address',
      data: that.data.allAddress,
    })
    wx.navigateBack({
    })
  },
  //删除地址信息
  delAddress: function (e) {
    var self = this;
    var deleteId = e.currentTarget.dataset.id;//删除时对应的index
    console.log("-----------www-------" + deleteId)
    var addressesId = self.data.allAddress[deleteId].addressesId;//对应的数据库主键id
    console.log("-----------rrr-------" + addressesId)
    wx.showModal({
      title: '提示',
      content: '确定删除地址？',
      success: function (res) {
        if (res.confirm) {
          //删除地址信息
          wx.request({
            url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/addresses/message/deleteAddress',
            method: 'POST',
            data: {
              addressesId: addressesId
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              console.log(res.data);
              if (res.data != null) {
                wx.showToast({
                  title: '地址删除成功',
                })
                self.onLoad()
                self.onReady()
              }
            }
          })
          return;
        } else if (res.cancel) {
          //  console.log('用户点击取消');
          return;
        }
      }
    })
  },
  //编辑地址信息
  editAddress: function (e) {
    var self = this;
    var editId = e.currentTarget.dataset.id;//编辑时对应的index
    var addressesId = self.data.allAddress[editId].addressesId;//对应的数据库主键id
    wx.navigateTo({
      url: '../addAddress/addAddress?id=' + addressesId,
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
  //下拉刷新
  onPullDownRefresh: function () {
    var self = this;
    wx.showNavigationBarLoading() //在标题栏中显示加载
    self.setData({
      haveRefresh: true
    })
    self.onLoad()
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