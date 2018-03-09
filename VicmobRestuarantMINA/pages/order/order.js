var app = getApp()
var config = require('../../utils/config/config.js');
var configUrl = require('../../utils/config/configUrl.js');
var Slider = require('../../template/slider/slider.js');
var times = 0;
// 定义一个总毫秒数，以一分钟为例。TODO，传入一个时间点，转换成总毫秒数
/* 毫秒级倒计时 */
function count_down(that, total_micro_second, orderId) {
  // 渲染倒计时时钟
  that.data.clock['' + orderId] = date_format(total_micro_second[''+orderId]);
  that.setData({
    clock: that.data.clock
  });
  if (total_micro_second['' + orderId] <= 0) {
    that.outOfDateOrder(orderId);
    // timeout则跳出递归
    return;
  }
  setTimeout(function () {
    // 放在最后--
    total_micro_second['' + orderId] -= 1000;
    that.setData({
      total_micro_second: total_micro_second
    })
    count_down(that, total_micro_second, orderId);
  }, 1000)
}
// 时间格式化输出，如03:25:19 86。每10ms都会调用一次
function date_format(micro_second) {
  // 秒数
  var second = Math.floor(micro_second / 1000);
  // 小时位
  var hr = Math.floor(second / 3600);
  // 分钟位
  var min = fill_zero_prefix(Math.floor((second - hr * 3600) / 60));
  // 秒位
  var sec = fill_zero_prefix((second - hr * 3600 - min * 60));// equal to => var sec = second % 60;
  // 毫秒位，保留2位
  //var micro_sec = fill_zero_prefix(Math.floor((micro_second % 1000) / 10));

  return hr + ":" + min + ":" + sec + " "// + micro_sec;
}

// 位数不足补零
function fill_zero_prefix(num) {
  return num < 10 ? "0" + num : num
}
Page({
  data: {
    showOrder: false,//是否显示订单
    orderExceptions: false,//订单获取异常
    hasOrder: false,//是否有订单
    orderlist: [],//订单列表
    logo: [],//空数组，用来存放门店logo
    flag1: false,
    haveRefresh: false,//判断是否是下拉刷新
    storeName: [],//存放門店名稱
    clock: {},
    total_micro_second: {},
    showModel: false
  },
  onLoad: function () {
    this.showLoad();
    this.doRequest();
  },
  doRequest: function () {
    var self = this;
    //调用模本页的检查网络连接
    this.slider = new Slider(this);
    this.slider._goCheckout();

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
      }, 300)
    } else {
      //请求订单列表数据
      wx.request({
        url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/order/message/personOrder',
        method: 'POST',
        data: {
          fansId: app.globalData.fansId,
          minaId: config.minaId,
          appId: config.appId
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          setTimeout(function () {
            if (res.data != null) {
              console.log("-------orderList-------------")
              console.log(res.data)
              if (res.data.length != 0) {
                for (var i = 0; i < res.data.length; i++) {
                  self.data.logo = self.data.logo.concat(configUrl.httpsUrl + res.data[i].logo)
                  if (res.data[i].storeName.length > 10) {
                    res.data[i].storeName = res.data[i].storeName.substring(0, 10) + '...'
                  }
                  if (res.data[i].goodsDetails[0].name.length > 10) {
                    res.data[i].goodsDetails[0].name = res.data[i].goodsDetails[0].name.substring(0, 10) + '...'
                  }
                  //待支付超时处理
                  if (res.data[i].orderStatus == 0) {
                    var orderTime = res.data[i].orderTime;
                    var resData = orderTime.replace(/-/g, '/');//用正则替换2017-01-01日期格式为2017/01/01，即可解决ios上出现NaN的问题
                    var nowTime = new Date().getTime();
                    var betweenTime = 30 * 60 * 1000 - (nowTime - new Date(resData).getTime());
                    self.data.total_micro_second['' + res.data[i].orderId] = betweenTime;
                    count_down(self, self.data.total_micro_second, res.data[i].orderId);
                  }
                }
                self.setData({
                  showOrder: true,
                  hasOrder: true,
                  orderlist: res.data,
                  logo: self.data.logo,
                  storeName: self.data.storeName,
                  flag1: true,
                })
              } else {
                self.setData({
                  showOrder: true,
                  hasOrder: false,
                  flag1: true,
                })
              }

            }
          }, 200)
        },
        fail: function (res) {
          self.hideLoad();
          wx.stopPullDownRefresh()
          wx.hideNavigationBarLoading()
          setTimeout(function () {
            self.setData({
              orderExceptions: true,
              showOrder: false,
              hasOrder: false,
            })
          }, 500)
          if (self.data.haveRefresh) {
            wx.showToast({
              title: '刷新失败',
            })
          }
        }
      })
    }
  },
  onReady: function () {
    var self = this;
    if (!self.data.flag1) {
      setTimeout(function () {
        self.onReady();
      }, 500);
    } else if (self.data.flag1 && self.data.haveRefresh) {
      setTimeout(function () {
        // self.hideLoad();
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        wx.showToast({
          title: '刷新成功',
        })
      }, 300)
    } else {
      setTimeout(function () {
        self.hideLoad();
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
      }, 300)
    }
  },
  onShow: function () {
    var self = this;
    wx.getStorage({
      key: 'loadOrder',
      success: function (res) {
        if (res.data == null || res.data == '') {

        } else {
          self.onLoad();//重新load订单，并且将订单加载状态的缓存清除
          self.onReady()
          wx.removeStorage({
            key: 'loadOrder',
            success: function (res) {
            },
          })
        }
      },
    })
  },
  //去支付
  toPay: function (e) {
    var self = this;
    console.log('orderId:', e.currentTarget.dataset.id);
    //发送请求，支付接口
    wx.request({
      url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/pay/wxPayOrder.do',
      method: 'POST',
      data: {
        fansId: app.globalData.fansId,
        minaId: config.minaId,
        appId: config.appId,
        orderId: e.currentTarget.dataset.id,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log("进入支付接口！");
        console.log('res.data', res.data[0].package);
        //调用微信支付
        wx.requestPayment({
          'timeStamp': res.data[0].timeStamp,
          'nonceStr': res.data[0].nonceStr,
          'package': res.data[0].package,
          'signType': res.data[0].signType,
          'paySign': res.data[0].paySign,
          'success': function (res) {
            console.log('调用支付成功！');
            console.log(res);
            wx.showToast({
              title: '支付成功！',
            })
            setTimeout(function () {
              self.doRequest();
            }, 1500)
          },
          'fail': function (res) {
            console.log('调用支付失败！');
            console.log(res);
            if (res.errMsg == 'requestPayment:fail cancel') {
              wx.showModal({
                title: '提示',
                content: '您已取消支付！',
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                    wx.navigateTo({
                      url: '../orderdetail/orderdetail?id=' + e.currentTarget.dataset.id,
                    })
                  }
                }
              })
            } else if (res.errMsg == 'requestPayment:fail (detail message)') {
              wx.showModal({
                title: '提示',
                content: '支付失败，请稍后重试！',
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                    wx.navigateTo({
                      url: '../orderdetail/orderdetail?id=' + e.currentTarget.dataset.id,
                    })
                  }
                }
              })
            }
          },
        })
      },
      fail: function (res) {
        wx.stopPullDownRefresh()
        wx.hideNavigationBarLoading()
        self.hideLoad();

        if (self.data.haveRefresh) {
          wx.showToast({
            title: '刷新失败',
          })
        }
      }
    })
  },
  //跳转到首页
  toIndex: function () {
    wx.switchTab({
      url: '../index/index',
    })
  },
  //跳转订单详情
  toOrderDetail: function (e) {
    var orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../orderdetail/orderdetail?id=' + orderId,
    })
  },
  //取消订单
  cancelOrder: function (e) {
    var self = this;
    var orderId = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '是否取消订单?',
      success: function (res) {
        if (res.confirm) {
          //取消订单
          wx.request({
            url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/order/client/cancelOrder',
            method: 'POST',
            data: {
              fansId: app.globalData.fansId,
              minaId: config.minaId,
              appId: config.appId,
              orderId: orderId
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              console.log('取消订单：', res.data);
              if(res.data.boolean){
                wx.showToast({
                  title: '取消订单成功！',
                })
                setTimeout(function () {
                  self.doRequest();
                }, 1500)
              }else{
                wx.showToast({
                  title: '未知错误！',
                })
              }
            }
          })
        }
      }
    })
  },
  //订单超时
  outOfDateOrder: function (orderId){
    var self = this;

    //超时更改订单状态
    wx.request({
      url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/order/client/orderOvertime',
      method: 'POST',
      data: {
        fansId: app.globalData.fansId,
        minaId: config.minaId,
        appId: config.appId,
        orderId: orderId
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log('超时更改订单状态：', res.data);
        if (res.data.boolean) {
          wx.showToast({
            title: '订单超时已更改！',
          })
          setTimeout(function () {
            self.doRequest();
          }, 1500)
        } else {
          wx.showToast({
            title: '未知错误！',
          })
        }
      }
    })

  },
  //申请退款
  tapRefund: function(e){
    var orderId = e.currentTarget.dataset.id;
    var phone = e.currentTarget.dataset.phone;
    var self = this;
    wx.showModal({
      title: '申请退款',
      content: '建议您先联系商家，以免高峰期商家未看到退款申请正常出餐，出餐后商家有权拒绝您的申请',
      cancelText: '申请退款',
      confirmText: '联系商家',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.makePhoneCall({
            phoneNumber: phone,
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
          //显示对话框
          self.setData({
            showModel: true,
            orderId: orderId
          });
        }
      }
    })
    
  },
  //退款理由
  getInputValue: function (e) {
    var reason = e.detail.value;
    console.log("reason", reason)
    this.setData({
      reason: reason
    })
  },
  //申请退款（取消按钮）
  quxiao: function () {
    this.setData({
      showModel: false
    })
  },
  //申请退款（确认按钮）
  queding: function () {
    var self = this;

    if (self.data.reason == '' || self.data.reason == 'null' || self.data.reason == null) {
      wx.showToast({
        title: '取消理由不能为空！',
      })
    } else {
      this.setData({
        showModel: false
      })
      
      //发送请求申请退款
      wx.request({
        url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/order/client/applicationForDrawback',
        data: {
          minaId: config.minaId,
          appId: config.appId,
          orderId: self.data.orderId,
          fansId: app.globalData.fansId,
          reason: self.data.reason
        },
        method: 'post',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          console.log("------------发送请求申请退款--------------");
          console.log("申请退款", res.data)
          if (res.data) {
            wx.showToast({
              title: '退款申请成功，待商家审核！',
            })
            setTimeout(function () {
              self.doRequest();
            }, 1500)
          }else{
            wx.showToast({
              title: '未知错误！',
            })
          }
        }
      });
      
    }
  },
  //确认收货
  tapOrderOk: function(e) {
    var self = this;
    var orderId = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '是否确认收货?',
      success: function (res) {
        if (res.confirm) {
          //确认收货
          wx.request({
            url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/order/client/confirmationGoods',
            method: 'POST',
            data: {
              fansId: app.globalData.fansId,
              minaId: config.minaId,
              appId: config.appId,
              orderId: orderId
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              console.log('确认收货：', res.data);
              if (res.data.boolean) {
                wx.showToast({
                  title: '确认收货成功！',
                })
                setTimeout(function () {
                  self.doRequest();
                }, 1500)
              } else {
                wx.showToast({
                  title: '未知错误！',
                })
              }
            }
          })
        }
      }
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
  //跳转商店
  goStore:function(e){
    var storeId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/restuarant/restuarant?id=' + storeId,
    })
  },
  //下拉刷新
  onPullDownRefresh: function () {
    var self = this;
    wx.showNavigationBarLoading() //在标题栏中显示加载
    self.setData({
      orderExceptions: false,//订单获取异常
      flag1: false,
      haveRefresh: true
    })
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
});

