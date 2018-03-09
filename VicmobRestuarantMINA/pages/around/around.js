// around.js
var config = require('../../utils/config/config.js');
var configUrl = require('../../utils/config/configUrl.js');
var Slider = require('../../template/slider/slider.js');
//-------------------------------------------------------------------------------
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nearbyShops: [
    ],
    //默认的经纬度(北京天安门)
    latitude: 39.90960456049752,
    longitude: 116.3972282409668,
    //地图上的标记
    markers: [{
      iconPath: "../../imgs/around/mapEnd.png",
      id: 0,
      latitude: 39.90960456049752,
      longitude: 116.3972282409668,
      width: 50,
      height: 50
    }],
    controls: [{
      id: 1,
      iconPath: '../../imgs/around/mapEnd.png',
      position: {
        left: 0,
        top: 300 - 50,
        width: 50,
        height: 50
      },
      clickable: true
    }],
    //附近门店图片
    around: {
      imgBussDistrict: '../../imgs/around/bussDistrict.png'
    },
    //是否显示附近的门店
    showNearBy: true,
    //判断是否附近有门店
    hasSrore: false,
    loadStore: '正在加载...',
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
    //获取定位
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        var latitude = res.latitude;
        var longitude = res.longitude;
        //地图标记点的经纬度
        self.data.markers[0].latitude = latitude;
        self.data.markers[0].longitude = longitude;
        self.setData({
          latitude: latitude,
          longitude: longitude,
          markers: self.data.markers,
        });
        self.doDistance(self.data.longitude, self.data.latitude);
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
            //找到所需要的城市项，提取出来set到Data集合中
            self.setData({
              address: res.data.address
            });
            console.log("address:", res.data.address)
          },
          fail: function (res) {
            self.setData({
              address: '定位失败',
            });
          }
        })
      },
      fail: function (res) {
        self.setData({
          address: '定位失败',
          loadStore: '暂无门店',
        });
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
        self.hideLoad()
        wx.showModal({
          title: '提示',
          content: '您未开启定位，无法获得当前位置！',
          showCancel: false,
        })

      }
    })
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
      method: 'post',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var nearbyShops = res.data;
        self.setData({
          nearbyShops: nearbyShops,
          hasSrore: true,
          loadStore: '我是有底线的...',
          flag1: true
        });
      },
      fail: function (res) {
        self.setData({
          hasSrore: true,
          loadStore: '暂无门店',
        });
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
      }, 300)
    } else {
      setTimeout(function () {
        self.hideLoad();
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
      }, 300)
    }

  },
  //下拉刷新
  onPullDownRefresh: function () {
    var self = this;
    wx.showNavigationBarLoading() //在标题栏中显示加载
    self.setData({
      flag1: false,
      haveRefresh: true
    })
    self.onLoad()
    self.onReady()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

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
  //点击进入门店
  goToDetailPage: function (e) {
    var id = parseInt(e.currentTarget.dataset.id);
    wx.navigateTo({
      url: '/pages/restuarant/restuarant?id=' + id,
    })
  },
  //点击附近外卖
  opennearbyShops: function () {
    var self = this;
    var showNearBy = self.data.showNearBy;
    self.setData({
      showNearBy: !showNearBy
    })
  },
  markertap(e) {
    console.log("rrrrrrrrrrrrrr" + e.markerId)
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