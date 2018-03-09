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
    minaId: 0,
    storeId: 0,
    fansId: 0,
    name: '',
    phoneNumber: '',
    address: '',//下单地址
    sendType: 1,//配送方式
    orderTime: '',//下单时间
    orderNumber: 0,//订单编号
    deliveryTime: '',//送达时间
    payType: 0,//支付方式
    couponId: 0,//代金券
    goodsDetails: [],//商品详情
    packMoney: 0,//打包费
    deliveryMoney: 0,//配送费
    totalMoney: 0,//订单总价
    privilegeMoney: 0,//优惠金额
    actuallyMoney: 0,//实际金额
    orderStatus: 0,//订单状态
    remark: '',//备注
    storeName: '',

    hasLocation: false,//判断有没有地址
    showCart: [],//显示购物车
    cart: { //购物车
      count: 0,//数量
      total: 0,//总价
      list: {},//存放对应分类的物品id
    },
    totalPrice: 0,//支付价格
    discountTotal: 0,//已优惠
    remarkStatus: false,
    radioindex: '',
    remarkDetail: "",//备注详情（用于对比备注的缓存信息）
    send_price: 0,//起送价
    delivery_free_price: 0,//满多少免配送费
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var shopId = options.id;
    var self = this;
    //调用模本页的检查网络连接
    this.slider = new Slider(this);
    this.slider._goCheckout();
    self.setData({
      storeId: shopId
    })
    //获取缓存的购物车信息
    wx.getStorage({
      key: self.data.storeId,
      success: function (res) {
        if (res.data == shopId) {
          //获取数量计数缓存
          wx.getStorage({
            key: self.data.storeId + 'cart',
            success: function (res) {
              if (res.data != null) {
                self.setData({
                  cart: res.data,
                  totalPrice: res.data.total,
                })
                console.log("cart123cart", res.data)
              }
            },
          })
          //获取购物车显示缓存
          wx.getStorage({
            key: self.data.storeId + 'showCart',
            success: function (res) {
              if (res.data != null) {
                self.setData({
                  showCart: res.data
                })
                console.log("showcart123showcart", res.data)
                //self.countDiscount();折扣价减少不算做优惠，优惠主要包括（优惠券等活动优惠）
              }
            },
          })
          //获取门店信息（包括配送费等）
          wx.getStorage({
            key: self.data.storeId + 'showShops',
            success: function (res) {
              if (res.data != null) {
                if (self.data.totalPrice >= res.data.deliveryFreePrice) {
                  self.setData({
                    packMoney: res.data.packPrice * self.data.cart.count,
                    deliveryMoney: 0,
                    deliveryTime: res.data.deliveryTime,
                  })
                } else {
                  self.setData({
                    packMoney: res.data.packPrice * self.data.cart.count,
                    deliveryMoney: res.data.deliveryPrice,
                    deliveryTime: res.data.deliveryTime,
                  })
                }
              }
            },
          })
        }
      },
    })
    //获取缓存的默认地址信息
    var radioindex = wx.getStorageSync('radioindex')//得到默认地址的缓存
    wx.getStorage({
      key: 'address',
      success: function (res) {
        if (res.data != null) {
          if (res.data.length != 0) {
            self.setData({
              hasLocation: true,
              name: res.data[radioindex].contactMan,
              phoneNumber: res.data[radioindex].contactWay,
              address: res.data[radioindex].province + res.data[radioindex].city + res.data[radioindex].country +res.data[radioindex].deliveryAddress,//下单地址
            })
          }
        }
      },
    })
    //清空备注缓存
    wx.removeStorage({
      key: self.data.storeId + 'remark',
      success: function (res) { },
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var self = this;
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var self = this;
    if (self.data.hasLocation) {
      var radioindex = wx.getStorageSync('radioindex')//得到默认地址的缓存
      wx.getStorage({
        key: 'address',
        success: function (res) {
          if (res.data != null) {
            self.setData({
              name: res.data[radioindex].contactMan,
              phoneNumber: res.data[radioindex].contactWay,
              address: res.data[radioindex].province + res.data[radioindex].city + res.data[radioindex].country +res.data[radioindex].deliveryAddress,//下单地址
            })
          }
        },
      })
    }
  },
  //计算优惠
  countDiscount: function () {
    var self = this;
    var discountTotal = 0;
    var cart = self.data.cart;
    var showCart = self.data.showCart;
    for (var key in cart.list) {
      for (var key1 in showCart) {
        if (key == key1) {
          if (showCart[key1].flag == false) {
            discountTotal = discountTotal + (showCart[key1].price - showCart[key1].discountPrice) * cart.list[key];
          }
        }
      }
    }
    self.setData({
      discountTotal: discountTotal
    })
  },
  //点击确认下单
  toPay: function () {
    var self = this;
    //获取当前时间
    var now = Date.parse(new Date());
    if (self.data.hasLocation) {
      wx.showModal({
        title: '提示',
        content: '确定提交订单吗?',
        success: function (res) {
          if (res.confirm) {
            // if (!self.data.remarkStatus) {
            //   self.setData({
            //     remarkDetail: "",
            //   })
            // } else {
            //   self.setData({
            //     remarkDetail: self.data.remark,
            //   })
            // }
            self.setData({
              orderTime: now,
              orderNumber: String(now),
              sendType: 1,
              payType: 0,
              couponId: 0,
              orderStatus: 0,
              storeName: '',
              goodsDetails: JSON.stringify(self.data.cart.list),
            })
            console.log("TIME", self.data.deliveryTime)
            console.log("TIME1", self.data.orderTime)
            if (app.globalData.fansId == null || app.globalData.fansId == '' || app.globalData.fansId == 'undefined') {
              wx.showModal({
                title: '提示',
                content: '页面数据异常，请重新进入',
                showCancel: false,
              })
            } else {
              var deliveryTime = self.data.deliveryTime * 60 * 1000;//预计送达时间转换成毫秒
              wx.request({
                url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/order/message/saveOrder',
                data: {
                  appId: config.appId,
                  minaId: config.minaId,
                  storeId: self.data.storeId,
                  fansId: app.globalData.fansId,
                  name: self.data.name,
                  phoneNumber: self.data.phoneNumber,
                  address: self.data.address,//下单地址
                  sendType: self.data.sendType,//配送方式
                  orderTime: self.data.orderTime,//下单时间
                  orderNumber: self.data.orderNumber,//订单编号
                  time: deliveryTime + self.data.orderTime,//送达时间
                  payType: self.data.payType,//支付方式
                  couponId: self.data.couponId,//代金券
                  packMoney: self.data.packMoney,//打包费
                  deliveryMoney: self.data.deliveryMoney,//配送费
                  totalMoney: self.data.totalPrice + self.data.discountTotal + self.data.packMoney + self.data.deliveryMoney,//订单总价 = 商品总价+配送费+打包费 + 折扣费
                  privilegeMoney: self.data.discountTotal,//优惠金额
                  actuallyMoney: self.data.totalPrice + self.data.packMoney + self.data.deliveryMoney,//实际金额 = 商品总价+配送费+打包费
                  orderStatus: self.data.orderStatus,//订单状态
                  remarks: self.data.remarkDetail,//备注
                  storeName: self.data.storeName,//门店名称
                  goodsDetails: self.data.goodsDetails,//商品详情
                },
                method: 'POST',
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                  console.log("----订单提交成功-------")
                  console.log("orderId", res.data)
                  if (res.data == null || res.data == '' || res.data == 'undefined') {

                  } else {
                    var orderId = res.data;
                    //请求后台支付接口
                    wx.request({
                      url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/pay/wxPayOrder.do',
                      data: {
                        appId: config.appId,
                        minaId: config.minaId,
                        fansId: app.globalData.fansId,
                        orderId: res.data
                      },
                      method: 'POST',
                      header: {
                        'content-type': 'application/x-www-form-urlencoded'
                      },
                      success: function (res) {
                        console.log("---------pay-------------")
                        console.log(res.data)
                        if (res.data != null || res.data != "") {
                          //获取当前时间
                          var now = Date.parse(new Date());
                          //发起微信支付
                          wx.requestPayment({
                            'timeStamp': res.data[0].timeStamp,
                            'nonceStr': res.data[0].nonceStr,
                            'package': res.data[0].package,
                            'signType': res.data[0].signType,
                            'paySign': res.data[0].paySign,
                            success: function (res) {
                              console.log("调用支付成功", res.data)
                              wx.showToast({
                                title: '支付成功！',
                              })
                              //成功之后清空购物车缓存
                              wx.removeStorage({
                                key: self.data.storeId,
                                success: function (res) { },
                              })
                              wx.removeStorage({
                                key: self.data.storeId + 'cart',
                                success: function (res) { },
                              })
                              wx.removeStorage({
                                key: self.data.storeId + 'showCart',
                                success: function (res) { },
                              })
                              wx.removeStorage({
                                key: self.data.storeId + 'count',
                                success: function (res) { },
                              })
                              wx.setStorage({
                                key: 'loadOrder',
                                data: '1',
                              })
                              setTimeout(function () {
                                wx.redirectTo({
                                  url: '../orderdetail/orderdetail?id=' + orderId,
                                })
                              }, 500)
                            },
                            fail: function (res) {
                              console.log('调用支付失败！');
                              console.log(res);
                              if (res.errMsg == 'requestPayment:fail cancel') {
                                wx.showModal({
                                  title: '提示',
                                  content: '您已取消支付！',
                                  showCancel: false,
                                  success: function (res) {
                                    if (res.confirm) {
                                      //成功之后清空购物车缓存
                                      wx.removeStorage({
                                        key: self.data.storeId,
                                        success: function (res) { },
                                      })
                                      wx.removeStorage({
                                        key: self.data.storeId + 'cart',
                                        success: function (res) { },
                                      })
                                      wx.removeStorage({
                                        key: self.data.storeId + 'showCart',
                                        success: function (res) { },
                                      })
                                      wx.removeStorage({
                                        key: self.data.storeId + 'count',
                                        success: function (res) { },
                                      })
                                      console.log('用户点击确定')
                                      wx.redirectTo({
                                        url: '../orderdetail/orderdetail?id=' + orderId,
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
                                      wx.redirectTo({
                                        url: '../orderdetail/orderdetail?id=' + orderId,
                                      })
                                    }
                                  }
                                })
                              }
                            }
                          })
                        }
                      },
                      fail: function (res) {

                      }
                    })
                  }
                },
                fail: function (res) {
                  wx.showToast({
                    title: '订单提交异常',
                    duration: 600,
                  })
                }
              })
            }
          } else if (res.cancel) {

          }
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '您未选择订单地址',
        showCancel: false
      })
    }
  },
  //选择地址
  selectAddress: function () {
    wx.navigateTo({
      url: '../address/address',
    })
  },
  //选择配送时间
  deliveryTime: function () {

  },
  //点击备注
  remark: function () {
    var self = this;
    wx.navigateTo({
      url: '../remark/remark?id=' + self.data.storeId,
    })
  },
  /**
   * 商家代金券
   */
  toCashcoupon: function () {
    wx.showModal({
      title: '提示',
      content: '程序猿努力开发中',
      showCancel: false
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