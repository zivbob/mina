// remark.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content: "",
    storeId: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var shopId = options.id;//门店id
    var self = this;
    self.setData({
      storeId: shopId
    })
    wx.getStorage({
      key: self.data.storeId + 'remark',
      success: function (res) {
        if (res.data != null) {
          self.setData({
            content: res.data
          })
        }
      },
    })
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
  onSubmit: function (event) {
    var that = this;
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面
    if (!event.detail.value.content) {
      //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
      prevPage.setData({
        remark: '口味、偏好等',//备注
        remarkStatus: false,
      })
      that.setData({
        content: ""
      })
      wx.setStorage({
        key: that.data.storeId + 'remark',
        data: that.data.content,
      })
      setTimeout(function () {
        wx.navigateBack({

        })
      }, 500)
      return;
    }
    if (event.detail.value.content.length > 20) {
      wx.showToast({
        title: "字数不能超过20个字"
      });
      return;
    } else if (event.detail.value.content.length > 10 && event.detail.value.content.length <= 20) {
      //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
      prevPage.setData({
        remark: event.detail.value.content.substring(0, 6).trim() + '...',
        remarkDetail: event.detail.value.content.trim(),
        remarkStatus: true
      })
    } else {
      //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
      prevPage.setData({
        remark: event.detail.value.content.trim(),
        remarkDetail:event.detail.value.content.trim(),
        remarkStatus: true
      })
    }
    that.setData({
      content: event.detail.value.content.trim()
    })
    wx.setStorage({
      key: that.data.storeId + 'remark',
      data: that.data.content,
    })
    wx.showToast({
      title: "提交成功"
    });
    setTimeout(function () {
      wx.navigateBack({

      })
    }, 500)

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