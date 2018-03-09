var config = require('../../utils/config/config.js');
var configUrl = require('../../utils/config/configUrl.js');
var app = getApp();
var server = require('../../utils/server');
var Slider = require('../../template/slider/slider.js');
var times = 0;
//-------------------------------------------------------------------------------
Page({
  data: {
    address: '定位中...',
    latitude: 31.4117,
    longitude: 120.31191,
    flag: false,
    flag1: false,
    flag2: false,
    flag3: false,
    distanceFlag: false,
    //幻灯片展示
    shopSlide: [
      {
        id: 0,
        thumb: '../../imgs/index/banner_1.jpg',
      },
    ],
    //门店类别展示
    shopCategory: [],
    categoryFlag: "all",
    //门店列表
    shops: [],
    shopsSortSails: [],
    shopsDistance: [],
    //根据类别显示的门店列表
    showShops: [

    ],
    //显示已无更多
    showNoMore: "正在加载中...",
    showPage: true,
    scrollDown: false,
    haveRefresh: false,//判断是否是下拉刷新

    flag1_1: false,
    flag2_1: false,
    flag3_1: false,
    //获取所有门店缓存的商品数量
    count: [],
  },
  onLoad: function () {
    var self = this;
    if (!self.data.haveRefresh) {
      self.showLoad();//显示加载中
    }
    //调用模本页的检查网络连接
    this.slider = new Slider(this);
    this.slider._goCheckout();
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        var latitude = res.latitude;
        var longitude = res.longitude;
        self.setData({
          latitude: latitude,
          longitude: longitude,
        });
        self.doDistance(self.data.longitude, self.data.latitude);
        self.doRequest(self.data.longitude, self.data.latitude);
        self.doSV(self.data.longitude, self.data.latitude);
        //发送请求通过经纬度反查地址信息
        wx.request({
          url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/addresses/message/getBaiduMap',
          data: {
            latitude: latitude,
            longitude: longitude
          },
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            self.setData({
              distanceFlag: true,
              address: res.data.address
            });
          },
          fail: function (res) {
            self.setData({
              address: '定位失败'
            });
          }
        })
      },
      fail: function (res) {
        wx.showToast({
          title: '你没有开启定位',
          duration: 600,
        })
        self.setData({
          latitude: 39.90960456049752,
          longitude: 116.3972282409668,
          address: '定位失败'
        });
      }
    })

    //幻灯片请求
    wx.request({
      url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/slide/message/all',
      data: {
        minaId: config.minaId,
        appId: config.appId
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.length == 0) {
          self.setData({
            flag1: true,
          });
        } else {
          self.setData({
            flag1: true,
            shopSlide: res.data
          });
        }
      },
      fail: function (res) {
        self.setData({
          flag1_1: true,
        });
      }
    });

    //门店类别请求
    wx.request({
      url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/storeCategory/message/all',
      data: {
        minaId: config.minaId,
        appId: config.appId
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.length > 0) {
          var shopCategory = [];
          var arrayList = [];
          var m = 0;
          for (var i = 0; i < res.data.length; i++) {
            arrayList.push(res.data[i]);
            m++;
            if ((m % 4 == 3) || (i == res.data.length - 1)) {

              shopCategory.push(arrayList);
              arrayList = [];
            }
          }
        }
        self.setData({
          flag2: true,
          shopCategory: shopCategory
        });
      },
      fail: function (res) {
        self.setData({
          flag2_1: true,
        });
      }
    });
  },
  //综合排序
  doRequest: function (longitude, latitude) {
    var self = this;
    //门店列表请求(综合排序)
    wx.request({
      url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/store/message/all/forSort',
      data: {
        minaId: config.minaId,
        locationX: longitude,
        locationY: latitude,
        appId: config.appId
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        self.setData({
          flag3: true,
        });
        var stores = res.data;
        for (var i = 0; i < stores.length; i++) {
          var hotStrArray = stores[i].hotStr.split(" ");
          var hotStr = "";
          if (hotStrArray.length > 0) {
            for (var j = 0; j < hotStrArray.length; j++) {
              hotStr += hotStrArray[j] + " ";
              if (j == 3) {
                break;
              }
            }
          }
          stores[i].hotStr = hotStr;
          if (stores[i].totalSail == null) {
            stores[i].totalSail = 0;
          }
        }
        //定义一个空数组，用于存放每个门店的购物车数量缓存
        var storeCount = []
        console.log("stores:", stores)
        for (var i = 0; i < stores.length; i++) {
          var storeId = stores[i].storeId
          //获取门店缓存数据
          wx.getStorage({
            key: storeId + 'count',
            success: function (res) {
              if (res.data != null) {
                storeCount.push(res.data)
              }
            },
          })
        }
        setTimeout(function () {
          self.setData({
            shops: stores,
            showShops: stores,
            showNoMore: "我是有底线的...",
            count: storeCount
          });
        }, 200);
      },
      fail: function (res) {
        self.setData({
          flag3_1: true,
        });
      }
    });
  },

  //销量排序
  doSV: function (longitude, latitude) {
    var self = this;
    //门店列表请求(销量排序)
    wx.request({
      url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/store/message/all/forSales',
      data: {
        minaId: config.minaId,
        locationX: longitude,
        locationY: latitude,
        appId: config.appId
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {

        self.setData({
          flag3: true,
        });
        var stores = res.data;

        for (var i = 0; i < stores.length; i++) {
          var hotStrArray = stores[i].hotStr.split(" ");
          var hotStr = "";
          if (hotStrArray.length > 0) {
            for (var j = 0; j < hotStrArray.length; j++) {
              hotStr += hotStrArray[j] + " ";
              if (j == 3) {
                break;
              }
            }
          }
          stores[i].hotStr = hotStr;
          if (stores[i].totalSail == null) {
            stores[i].totalSail = 0;
          }
        }
        self.setData({
          shopsSortSails: stores,
        });
      },
      fail: function (res) {
        self.setData({
          flag3_1: true,
        });
      }
    });
  },

  //距离最近排序
  doDistance: function (longitude, latitude) {
    var self = this;
    wx.request({
      url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/store/message/all/distance',
      data: {
        minaId: config.minaId,
        locationX: longitude,
        locationY: latitude,
        appId: config.appId
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        self.setData({
          flag1: true,
          shopsDistance: res.data
        });
      },
      fail: function (res) {
        self.setData({
          flag1_1: true,
        });
      }
    });
  },

  onReady: function () {
    var self = this;
    if (!self.data.flag1 || !self.data.flag2 || !self.data.flag3) {
      setTimeout(function () {
        self.onReady();
      }, 500);
    } else if (self.data.flag1 && self.data.flag2 && self.data.flag3 && self.data.haveRefresh) {
      self.setData({
        flag: true
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
        flag: true
      })
      setTimeout(function () {
        self.hideLoad();
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
      }, 300)
    }
    if (self.data.flag1_1 && self.data.flag2_1 && self.data.flag3_1) {
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
    if (config.minaNickName == null || config.minaNickName == "") {

    } else {
      //上方导航标题
      wx.setNavigationBarTitle({
        title: config.minaNickName,
      })
    }
  },

  onShow: function () {
    var self = this;
    self.setData({
      filterId: 1,//默认排序为综合排序
    });
    //定义一个空数组，用于存放每个门店的购物车数量缓存
    var storeCount = []
    var stores = self.data.showShops;
    console.log("stores:", stores)
    for (var i = 0; i < stores.length; i++) {
      var storeId = stores[i].storeId
      //获取门店缓存数据
      wx.getStorage({
        key: storeId + 'count',
        success: function (res) {
          if (res.data != null) {
            storeCount.push(res.data)
          }
        },
      })
    }
    setTimeout(function () {
      self.setData({
        count: storeCount
      });
    }, 200);
  },

  //门店类别
  tapRestuarant: function (e) {
    var self = this;
    var type = e.currentTarget.dataset.type;
    self.setData({
      categoryFlag: type
    })

  },
  //点击搜索
  tapSearch: function () {
    wx.navigateTo({ url: 'search' });
  },

  //打开地图
  openAddress: function () {
    var self = this;
    var currentAddress = self.data.address;
    var latitude = self.data.latitude;
    var longitude = self.data.longitude;
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      address: currentAddress,
      scale: 28
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
      flag1: false,
      flag2: false,
      flag3: false,
      distanceFlag: false,
      haveRefresh: true
    })
    self.onLoad()
    self.onReady()
    self.onShow()
  },
  //排序方式
  tapFilter: function (e) {
    var id = e.target.dataset.id;
    var self = this;
    if (id == 1) {
      self.setData({
        showShops: self.data.shops,
        filterId: 1
      })
    } else if (id == 2) {
      self.setData({
        showShops: self.data.shopsSortSails,
        filterId: 2
      })
    } else {
      if (self.data.distanceFlag == false) {
        wx.showModal({
          title: '提示',
          content: '你没有开启定位，不能计算最近的商家',
          showCancel: false
        });
        return;
      }
      self.setData({
        showShops: self.data.shopsDistance,
        filterId: 3
      })
    }
  },

  //点击进入门店
  goToDetailPage: function (e) {
    var id = parseInt(e.currentTarget.dataset.id);
    wx.navigateTo({
      url: '/pages/restuarant/restuarant?id=' + id,
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

