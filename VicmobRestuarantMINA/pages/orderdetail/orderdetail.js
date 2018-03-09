// page/detail/detail.js
var app = getApp()
var config = require('../../utils/config/config.js');
var configUrl = require('../../utils/config/configUrl.js');
var Slider = require('../../template/slider/slider.js');
// 定义一个总毫秒数，以一分钟为例。TODO，传入一个时间点，转换成总毫秒数
/* 毫秒级倒计时 */
function count_down(that, total_micro_second) {
  // 渲染倒计时时钟
  that.setData({
    clock: date_format(total_micro_second)
  });
  if (total_micro_second <= 0) {
    that.setData({
      clock: "Time out!"
    });
    that.outOfDateOrder();
    // timeout则跳出递归
    return;
  }
  setTimeout(function () {
    // 放在最后--
    total_micro_second -= 100;
    that.setData({
      total_micro_second: total_micro_second
    })
    count_down(that, total_micro_second);
  }, 100)
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
    orderDetails: [],
    logo: '../../imgs/index/mine_1.png',
    deliveryMoney: 0,//配送费
    orderId: '',
    flag1: false,
    haveRefresh: false,//判断是否是下拉刷新
    showModel: false,
    clock: '',//倒计时
    deliveryService:'由 商家 提供配送服务',
    actionSheetHidden: true,
    actionSheetItems: [
      { bindtap: 'Menu1', txt: '菜单1' },
    ],
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var orderId = options.id;
    console.log("orderId", orderId)
    this.setData({
      orderId: orderId,
    })
    this.showLoad();
    this.doRequest(orderId);
  },
  doRequest: function (orderId) {
    console.log('orderId', orderId);
    var self = this;
    //调用模本页的检查网络连接
    this.slider = new Slider(this);
    this.slider._goCheckout();
    //请求订单列表数据
    wx.request({
      url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/order/message/aOrder',
      method: 'POST',
      data: {
        orderId: orderId,
        minaId: config.minaId,
        appId: config.appId,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.logo != null) {
          self.setData({
            logo: configUrl.httpsUrl + res.data.logo
          })
        }
        if (res.data != null) {
          self.setData({
            orderDetails: res.data,
            flag1: true
          })
          console.log("2323233", res.data)
        }
        if (res.data.actuallyMoney >= res.data.deliveryFreePrice) {
          self.setData({
            deliveryMoney: 0,
          })
        } else {
          self.setData({
            deliveryMoney: res.data.deliveryMoney,
          })
        }
        //计算倒计时
        if (res.data.orderStatus == 0) {
          var createTime = res.data.orderTime;
          var resData = createTime.replace(/-/g, '/'); //用正则替换2017-01-01日期格式为2017/01/01，即可解决ios上出现NaN的问题
          var nowTime = new Date().getTime();
          var betweenTime = 30 * 60 * 1000 - (nowTime - new Date(resData).getTime());
          count_down(self, betweenTime);
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
    })

  },
  onReady: function () {
    // 页面渲染完成
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
    var orderId = self.data.orderId
    self.setData({
      flag1: false,
      haveRefresh: true
    })
    if (orderId != null) {
      wx.showNavigationBarLoading() //在标题栏中显示加载
      self.doRequest(orderId);
      self.onReady()
    }
  },

  //去支付
  toPay: function () {
    var self = this;
    var orderId = self.data.orderId
    //发送请求，支付接口
    wx.request({
      url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/pay/wxPayOrder.do',
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
              self.doRequest(orderId);
            }, 1500)
          },
          'fail': function (res) {
            console.log('调用支付失败！');
            console.log(res);
            if (res.errMsg == 'requestPayment:fail cancel') {
              wx.showModal({
                title: '提示',
                content: '您已取消支付！',
                showCancel: false
              })
            } else if (res.errMsg == 'requestPayment:fail (detail message)') {
              wx.showModal({
                title: '提示',
                content: '支付失败，请稍后重试！',
                showCancel: false
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
  //取消订单
  toCancelOrder: function () {
    var self = this;
    var orderId = self.data.orderId;
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
              if (res.data.boolean) {
                wx.showToast({
                  title: '取消订单成功！',
                })
                setTimeout(function () {
                  self.doRequest(orderId);
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
  //订单超时
  outOfDateOrder: function () {
    //订单状态改为超时
    var self = this;
    var orderId = self.data.orderId;
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
            self.doRequest(orderId);
          }, 1500)
        } else {
          wx.showToast({
            title: '未知错误！',
          })
        }
      }
    })
  },
  //确认收货
  orderOk() {
    var self = this;
    var orderId = self.data.orderId;
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
                  self.doRequest(orderId);
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
  //联系商家
  tapPhone: function () {
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
    var phone = this.data.orderDetails.storePhoneNumber;
    wx.makePhoneCall({
      phoneNumber: phone,
    })
    this.setData({
      menu: 1,
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },


  //申请退款
  tapRefund() {
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
            phoneNumber: self.data.orderDetails.storePhoneNumber,
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
          //显示对话框
          self.setData({
            showModel: true
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
    var orderId = self.data.orderId;
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
          orderId: orderId,
          fansId: app.globalData.fansId,
          reason: self.data.reason
        },
        method: 'post',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          console.log("------------发送请求申请退款--------------");
          console.log("res.data", res.data)
          if (res.data) {
            wx.showToast({
              title: '退款申请成功，待商家审核！',
            })
            setTimeout(function () {
              self.doRequest(orderId);
            }, 1500)
          } else {
            wx.showToast({
              title: '未知错误！',
            })
          }
        }
      });

    }
  },
  //再去逛逛
  tapAgain: function () {
    wx.switchTab({
      url: '../index/index',
    })
  },
  goStore:function(){
    var self = this;
    var storeId = self.data.orderDetails.sid;
    wx.navigateTo({
      url: '/pages/restuarant/restuarant?id=' + storeId,
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
})