var app = getApp();
var server = require('../../utils/server');
var config = require('../../utils/config/config.js');
var configUrl = require('../../utils/config/configUrl.js');
var Slider = require('../../template/slider/slider.js');

Page({
  data: {
    goodsType: [],//物品分类数组
    shopId: 1,//门店id
    filterId: 1,//导航初始值
    goodsCategorysId: 0,//分类id
    storeMe: [],//获取门店公告用的
    goods: {},//物品信息列表
    goodsList: [],//物品分类列表
    showInfo: [],
    showGoods: [],//需要展示的物品列表
    showTitle: "",
    showCart: [],
    getInfoFlag: false,
    cart: { //购物车
      count: 0,//数量
      total: 0,//总价
      list: {},//存放对应分类的物品id
    },
    count: { //购物车缓存
      storeId: 0,//门店id
      count: 0,//数量
    },
    flag: {},
    showCartDetail: false,

    //文字跑马灯
    text: '这是一条会滚动的文字跑马灯',
    marqueePace: 0.6,//滚动速度
    marqueeDistance: 0,//初始滚动距离
    marqueeDistance2: 0,
    marquee2copy_status: false,
    marquee2_margin: 60,
    size: 22,
    orientation: 'left',//滚动方向
    interval: 20, // 时间间隔

    restaurantId: '1',//门店id（用于缓存数据时使用）
    goodsTypepPrice: [],//用于点击规格时获取当前规格的具体信息
    goodsTypepNum: [],//用于点击规格时获取当前规格的数量
    noGoods: false,
  },

  //页面加载
  onLoad: function (options) {
    var shopId = options.id;
    this.setData({
      restaurantId: shopId,
    })
    console.log("shopId:", shopId)
    this.showLoad();
    this.doRequest(shopId);
  },
  doRequest: function (shopId) {
    var that = this;
    //调用模本页的检查网络连接
    this.slider = new Slider(this);
    this.slider._goCheckout();
    //获取map所有信息
    wx.request({
      url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/goodsCategory/message/map',
      method: 'POST',
      data: {
        storeId: shopId,
        minaId: config.minaId,
        appId: config.appId
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.wcsGoodsCategoryList.length > 0) {
          that.setData({
            goods: res.data.wcsGoodsMap,
            goodsList: res.data.wcsGoodsCategoryList,
            goodsType: res.data.wcsGoodsOptionsMap,
            goodsCategorysId: res.data.wcsGoodsCategoryList[0].goodsCategorysId,
            getInfoFlag: true
          })
        } else {
          that.setData({
            getInfoFlag: true
          })
        }
      },
      fail: function (res) {
        wx.stopPullDownRefresh()
        wx.hideNavigationBarLoading()
        that.hideLoad();
      }
    })

    //获取商店信息
    wx.request({
      url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/store/message',
      method: 'POST',
      data: {
        storeId: shopId,
        minaId: config.minaId,
        appId: config.appId
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log("123", res.data)
        if (res.data != null) {
          that.setData({
            storeMe: res.data
          })
          //存储当前门店信息(包括配送费等)
          wx.setStorage({
            key: shopId + 'showShops',
            data: that.data.storeMe,
          })
        }
      },
      fail: function (res) {
        wx.stopPullDownRefresh()
        wx.hideNavigationBarLoading()
        that.hideLoad();
      }
    })

    //获取缓存数据
    wx.getStorage({
      key: shopId,
      success: function (res) {
        if (res.data == shopId) {
          //获取数量计数缓存
          wx.getStorage({
            key: shopId + 'cart',
            success: function (res) {
              if (res.data != null) {
                that.setData({
                  cart: res.data
                })
              }
            },
          })
          //获取购物车显示缓存
          wx.getStorage({
            key: shopId + 'showCart',
            success: function (res) {
              if (res.data != null) {
                that.setData({
                  showCart: res.data
                })
              }
            },
          })
        }
      },
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var self = this;
    if (!self.data.getInfoFlag) {
      setTimeout(function () {
        self.onReady();
      }, 1000);
    } else {
      //上方导航标题
      wx.setNavigationBarTitle({
        title: self.data.storeMe.title,
      })
      setTimeout(function () {
        // self.hideLoad();
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
      }, 300)
    }
    if (self.data.goodsList.length > 0) {
      self.setData({
        showTitle: self.data.goodsList[0].title,
        classifySeleted: self.data.goodsList[0].goodsCategorysId,
      });
      console.log("123456789", self.data.goodsList)
      if (self.data.goodsList[0].goodsIdCollection.length == 0) {//如果第一个分类没有商品
        setTimeout(function () {
          wx.showToast({
            title: '亲，该分类暂无商品哦',
            duration: 400,
          })
        }, 200)
        self.data.noGoods = true;
        self.setData({
          noGoods: self.data.noGoods
        })
      } else {
        setTimeout(function () {
          self.hideLoad();
        }, 500)
      }
    } else {
      setTimeout(function () {
        self.hideLoad();
      }, 300)
    }
  },
  //导航栏按钮点击事件
  tapFilter: function (e) {
    var that = this;
    var shopId = this.data.storeMe.storeId;
    switch (e.target.dataset.id) {
      case '1':
        break;
      case '2':
        wx.showModal({
          title: '提示',
          content: '程序员正在开发中！',
          showCancel: false,
        });
        break;
      case '3':
        wx.navigateTo({ url: '../restuarantDetail/restuarantDetail?id=' + shopId });
        break;
    }
    this.setData({
      filterId: e.target.dataset.id,
      shops: this.data.shops
    });
  },

  //物品详情跳转
  goodsDet: function (e) {
    var goodsId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '../goods/goods?id=' + goodsId });
  },

  //页面渲染事件
  onShow: function () {
    // 页面显示
    var vm = this;
    var length = vm.data.text.length * vm.data.size;//文字长度
    var windowWidth = wx.getSystemInfoSync().windowWidth;// 屏幕宽度
    vm.setData({
      length: length,
      windowWidth: windowWidth,
      marquee2_margin: length < windowWidth ? windowWidth - length : vm.data.marquee2_margin//当文字长度小于屏幕长度时，需要增加补白
    });
    vm.run1();// 水平一行字滚动完了再按照原来的方向滚动
    //  vm.run2();// 第一个字消失后立即从右边出现

    vm.setData({
      filterId: 1,
    });
  },
  // 水平方向滚动
  run1: function () {
    var vm = this;
    var interval = setInterval(function () {
      if (-vm.data.marqueeDistance < vm.data.length) {
        vm.setData({
          marqueeDistance: vm.data.marqueeDistance - vm.data.marqueePace,
        });
      } else {
        clearInterval(interval);
        vm.setData({
          marqueeDistance: vm.data.windowWidth
        });
        vm.run1();
      }
    }, vm.data.interval);
  },

  //左边物品分类点击分类名称跳转到相应分类的物品列表
  tapClassify: function (e) {
    var self = this;
    // var goods = self.data.goods;
    self.data.noGoods = false;
    var id = e.currentTarget.dataset.id;
    var title = e.currentTarget.dataset.title;
    var array = e.currentTarget.dataset.array;

    if (array.length == 0) {
      wx.showToast({
        title: '亲，该分类暂无商品哦',
        duration: 400,
      })
      self.data.noGoods = true;
    }
    // var idArray = e.currentTarget.dataset.idarray;
    // self.doShowInfo(id, title, idArray, goods);

    self.setData({
      showTitle: title,
      classifySeleted: id,
      noGoods: self.data.noGoods
    });

  },
  // //页面显示商品
  // doShowInfo: function (id, title, idArray, goods) {
  //   var self = this;
  //   var showGoods = [];
  // if (idArray.length == 0) {
  //   wx.showToast({
  //     title: '亲，该分类暂时没有商品哦',
  //   })
  //   }
  //   for (var i = 0; i < idArray.length; i++) {
  //     for (var j = 0; j < goods.length; j++) {
  //       if (goods[j].goodsId == idArray[i]) {
  //         showGoods.push(goods[j]);
  //         break;
  //       }
  //     }
  //   }
  //   self.setData({
  //     showTitle: title,
  //     showGoods: showGoods
  //   });
  // },

  //提交表单到结算页面
  submit: function (e) {
    var self = this;
    var shopId = self.data.storeMe.storeId;
    if (self.data.cart.total < self.data.storeMe.sendPrice) {
      wx.showModal({
        title: '提示',
        content: '很抱歉，未达到起送价哦！',
        showCancel: false
      })
      return;
    }
    wx.navigateTo({
      url: '/pages/payment/payment?id=' + shopId,
    })
  },

  //计算
  //+
  tapAddCart: function (e) {
    this.addCart(e.currentTarget.dataset.id);
  },
  //-
  tapReduceCart: function (e) {
    this.reduceCart(e.currentTarget.dataset.id);
  },
  addCart: function (id) {
    var self = this;
    var addFlag = true;
    var num = self.data.cart.list[id] || 0;
    var count = self.data.cart.count;
    if (count >= 999) {
      addFlag = false;
      wx.showModal({
        title: '提示',
        content: '购买的数量过多,请先结算再继续购买！',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {

            return;
          } else if (res.cancel) {

            return;
          }
        }
      })
    }
    var goods = self.data.goods;
    id = id.toString();
    if (id.indexOf('-') != -1) {
      var goodsType = self.data.goodsType;
      var total = goodsType[id].total;

      if (total == -1) {

      } else if (num >= total) {
        addFlag = false;
        wx.showModal({
          title: '提示',
          content: '库存不足！',
          showCancel: false,
        })
      }
    } else {
      var total = goods[id].total;
      if (total == -1) {

      } else if (num >= total) {
        addFlag = false;
        wx.showModal({
          title: '提示',
          content: '库存不足！',
          showCancel: false,
        })
      }
    }
    if (addFlag) {
      self.data.cart.list[id] = num + 1;
      self.countCart();
    }
    console.log("23232", self.data.cart)
  },

  reduceCart: function (id) {
    var num = this.data.cart.list[id] || 0;
    if (num <= 1) {
      delete this.data.cart.list[id];
    } else {
      this.data.cart.list[id] = num - 1;
    }
    this.countCart();

  },

  countCart: function () {
    var self = this;
    var count = 0,
      total = 0;

    var showCart = {};
    for (var id in self.data.cart.list) {
      if (id.indexOf('-') != -1) {
        var goodsType = self.data.goodsType;
        count += self.data.cart.list[id];
        total += goodsType[id].price * self.data.cart.list[id];
        showCart[id] = goodsType[id];
        showCart[id].flag = true;
      } else {
        var goods = self.data.goods;
        count += self.data.cart.list[id];
        if (goods[id].discountPrice != 0 && goods[id].discountPrice != null && goods[id].discountPrice != "null") {
          total += goods[id].discountPrice * self.data.cart.list[id];
        } else {
          total += goods[id].price * self.data.cart.list[id];
        }
        showCart[id] = goods[id];
        showCart[id].flag = false;
      }
    }
    self.data.cart.count = count;//购物车
    self.data.cart.total = total;//购物车
    self.data.count.storeId = self.data.restaurantId;//购物车缓存
    self.data.count.count = count;//购物车缓存
    self.setData({
      cart: self.data.cart,
      showCart: showCart
    });
    //存储购物车数据
    wx.setStorage({
      key: self.data.restaurantId + 'cart',
      data: self.data.cart,
    })
    //存储显示在购物车里的东西
    wx.setStorage({
      key: self.data.restaurantId + 'showCart',
      data: self.data.showCart,
    })
    //存储门店id
    wx.setStorage({
      key: self.data.restaurantId,
      data: self.data.storeMe.storeId
    })
    //存储商品计数和商店id
    wx.setStorage({
      key: self.data.restaurantId + 'count',
      data: self.data.count
    })
    if (self.data.cart.count == 0) {
      this.hideCartDetail();
    }

  },
  //清空购物车
  clearcart: function () {
    var self = this;
    wx.showModal({
      title: '提示',
      content: '确定清空购物车吗？',
      success: function (res) {
        if (res.confirm) {
          var count = 0,
            total = 0,
            list = {};
          self.data.cart.count = count;
          self.data.cart.total = total;
          self.data.cart.list = list;
          self.data.count.storeId = self.data.restaurantId;//购物车缓存
          self.data.count.count = count;//购物车缓存
          self.setData({
            cart: self.data.cart
          })
          self.hideCartDetail()
          //成功之后清空购物车缓存
          wx.removeStorage({
            key: self.data.restaurantId,
            success: function (res) { },
          })
          wx.removeStorage({
            key: self.data.restaurantId + 'cart',
            success: function (res) { },
          })
          wx.removeStorage({
            key: self.data.restaurantId + 'showCart',
            success: function (res) { },
          })
          wx.removeStorage({
            key: self.data.restaurantId + 'count',
            success: function (res) { },
          })
        } else if (res.cancel) {

        }
      }

    })
  },
  //显示购物车
  showCartDetail: function () {
    if (this.data.cart.count == 0) {
      this.hideGoodsDetail();
    } else {
      this.setData({
        showCartDetail: !this.data.showCartDetail,
        showGoodsDetail: false,
      });
    }
  },
  //隐藏购物车
  hideCartDetail: function () {
    this.setData({
      showCartDetail: false
    });
  },
  //关闭商品规格弹出窗
  closeGoodsDetails: function () {
    var self = this;
    self.setData({
      showGoodsDetail: false,
    });
  },
  //显示隐藏商品详情弹窗
  showGoodsDetail: function (e) {
    var self = this;
    self.setData({
      showGoodsDetail: !this.data.showGoodsDetail,
    });
    var array = [];
    var goodsId = e.currentTarget.dataset.goodsid;
    var goodsType = self.data.goodsType;
    for (var key in goodsType) {
      var key1 = key.substring(0, key.indexOf("-"));
      if (key1 == goodsId) {
        array.push(key);
      }
    }
    //默认显示第一个规格的id
    if (array.length > 0) {
      var item = array[0]
    }
    self.setData({
      showInfo: array,
      goodsTypepPrice: self.data.goodsType[item],
      goodsTypepNum: array[0],
      goodsTypeSelected: item//用于判断是否选中规格id=当前商品规格id
    });
    console.log("232323", self.data.goodsTypepNum)
  },

  guige: function (e) {
    var self = this;
    var item = e.currentTarget.dataset.item;
    var index = e.currentTarget.dataset.index;
    // var itemNum = self.data.showInfo[index];//规格商品id
    console.log("121312313", item)
    console.log("121312313444555", self.data.goodsType[item])
    self.setData({
      goodsTypepPrice: self.data.goodsType[item],
      goodsTypepNum: item,
      goodsTypeSelected: item
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
    wx.hideLoading({
      title: '加载中...',
    })
  },
  //隐藏商品详情
  hideGoodsDetail: function () {
    this.setData({
      showGoodsDetail: false
    });
  },
  /**
    * 用户点击右上角分享
    */
  onShareAppMessage: function () {
    return {
      title: '微餐饮小程序',
      path: '/pages/restuarant/restuarant?id=' + this.data.restaurantId,
      success: function (res) {

      },
      fail: function () {

      }
    }
  }
})

