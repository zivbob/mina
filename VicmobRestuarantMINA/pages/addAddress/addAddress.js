// addAddress.js
var app = getApp();
var server = require('../../utils/server');
var config = require('../../utils/config/config.js');
var configUrl = require('../../utils/config/configUrl.js');
var Slider = require('../../template/slider/slider.js');
var cityList = require('../../utils/cityList').cityList;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    fansId: 0,//粉丝id
    minaId: 0,//minaId
    //选择地址用到的
    deliveryAddress: '',//地址
    contactMan: '',//联系人
    contactWay: '',//联系方式
    sex: 0,//性别（0：男，1：女）
    addressesId: 0,
    hasEdit: false,//是否是编辑
    sexes: [
      { name: '0', value: '先生' },
      { name: '1', value: '女士' }
    ],//radio选择男士/女士
    //选择地址用到的
    address: {},

    showArea: false,
    currentTab: 1,
    country: [],
    residecity: [],
    resideprovince: [],

    curr_pro: '',
    curr_cit: '',
    curr_cou: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    var addresId = options.id;//带过来的地址主键id
    //调用模本页的检查网络连接
    this.slider = new Slider(this);
    this.slider._goCheckout();
    if (addresId == null || addresId == '') {

    } else {
      wx.setNavigationBarTitle({
        title: '编辑收货地址',
      })
      if (app.globalData.fansId == null || app.globalData.fansId == '' || app.globalData.fansId == 'undefined') {
        wx.showModal({
          title: '提示',
          content: '页面数据异常，请重新进入',
          showCancel: false,
        })
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
            for (var i = 0; i < res.data.length; i++) {
              if (res.data[i].addressesId == addresId) {//判断是否是编辑
                if (res.data[i].sex == 0) {
                  self.data.sexes = [
                    { name: '0', value: '先生', checked: 'true' },
                    { name: '1', value: '女士' }
                  ]
                } else {
                  self.data.sexes = [
                    { name: '0', value: '先生' },
                    { name: '1', value: '女士', checked: 'true' }
                  ]
                }
                //上方导航标题
                wx.setNavigationBarTitle({
                  title: "编辑收货地址",
                })
                //编辑时对省市区进行赋值
                self.data.address.resideprovince = res.data[i].province;
                self.data.address.residecity = res.data[i].city;
                self.data.address.country = res.data[i].country;
                self.setData({
                  hasEdit: true,
                  contactMan: res.data[i].contactMan,
                  deliveryAddress: res.data[i].deliveryAddress,
                  contactWay: res.data[i].contactWay,
                  sex: res.data[i].sex,
                  addressesId: addresId,
                  sexes: self.data.sexes,
                  address: self.data.address
                })
              }
            }
          },
          fail: function (res) {

          }
        })
      }
    }
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
  //选择地址区域
  choosearea: function () {

    let result = this.data.address;
    var currentTab = 1;
    if (result.country) {
      currentTab = 3;
    } else if (result.residecity) {
      currentTab = 3;
    } else if (result.resideprovince) {
      currentTab = 1;
    } else {
      currentTab = 1;
    }

    let resideprovince = [];
    let residecity = [];
    let country = [];

    cityList.forEach((item) => {
      resideprovince.push({
        name: item.name
      });
      if (item.name == result.resideprovince) {
        item.city.forEach((item) => {
          residecity.push({
            name: item.name
          });
          if (item.name == result.residecity) {
            item.area.forEach((item) => {
              country.push({
                name: item.name
              });
            });
          }
        });
      }
    });

    this.setData({
      showArea: true,
      resideprovince: resideprovince,
      residecity: residecity,
      country: country,

      currentTab: currentTab,
      curr_pro: result.resideprovince || '请选择',
      curr_cit: result.residecity || '请选择',
      curr_cou: result.country || '请选择',
    });
  },

  //关闭选择
  areaClose: function () {
    this.setData({
      showArea: false
    });
  },
  //点击省选项卡
  resideprovince: function (e) {
    this.setData({
      currentTab: 1
    });
  },
  //点击市选项卡
  residecity: function () {
    this.setData({
      currentTab: 2
    });
  },
  country: function () {
    this.setData({
      currentTab: 3
    });
  },
  //点击选择省
  selectResideprovince: function (e) {
    let residecity = [];
    let country = [];
    let name = e.currentTarget.dataset.itemName;

    cityList.forEach((item) => {
      if (item.name == name) {
        item.city.forEach((item, index) => {
          residecity.push({
            name: item.name
          });
          if (index == 0) {
            item.area.forEach((item) => {
              country.push({
                name: item.name
              });
            });
          }
        });
      }
    });

    this.setData({
      currentTab: 2,
      residecity: residecity,
      country: country,
      curr_pro: e.currentTarget.dataset.itemName,
      curr_cit: '请选择',
      curr_cou: '',
    });
  },
  //点击选择市
  selectResidecity: function (e) {
    let country = [];
    let name = e.currentTarget.dataset.itemName;
    cityList.forEach((item) => {
      if (item.name == this.data.curr_pro) {
        item.city.forEach((item, index) => {
          if (item.name == name) {
            item.area.forEach((item) => {
              country.push({
                name: item.name
              });
            });
          }
        });
      }
    });

    this.setData({
      currentTab: 3,
      country: country,
      curr_cit: e.currentTarget.dataset.itemName,
      curr_cou: '请选择',
    });
  },
  //点击选择区
  selectCountry: function (e) {
    this.data.curr_cou = e.currentTarget.dataset.itemName;

    this.data.address.resideprovince = this.data.curr_pro;
    this.data.address.residecity = this.data.curr_cit;
    this.data.address.country = this.data.curr_cou;
    this.setData({
      showArea: false,
      curr_cou: this.data.curr_cou,
      address: this.data.address
    });
  },
  // 滑动切换tab
  bindChange: function (e) {
    var that = this;
    that.setData({
      currentTab: e.detail.current + 1
    });
  },
  //监听radio状态改变
  radioChange: function (e) {
    var index = parseInt(e.detail.value)
    var self = this;
    self.setData({
      sex: parseInt(self.data.sexes[index].name)
    })
    console.log("cscscs", e.detail.value)
  },

  //提交
  formSubmit: function (e) {
    var self = this;
    var province = self.data.curr_pro;//省
    var city = self.data.curr_cit;//市
    var country = self.data.curr_cou;//区
    var deliveryAddress = e.detail.value.address.trim();
    var contactMan = e.detail.value.name.trim()
    var contactWay = e.detail.value.phone;
    if (deliveryAddress == '' || contactMan == '' || province == '' || province == null || deliveryAddress == null || contactMan == null || deliveryAddress.replace(/(^s*)|(s*$)/g, "").length == 0 || contactMan.replace(/(^s*)|(s*$)/g, "").length == 0) {
      wx.showToast({
        title: '请填写正确',
      })
      return;
    }
    if (contactWay.length != 11) {
      wx.showToast({
        title: '手机号长度有误！',
      })
      return;
    }
    var myreg = /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (!myreg.test(contactWay)) {
      wx.showToast({
        title: '手机号有误！',
      })
      return;
    }

    self.setData({
      fansId: app.globalData.fansId,//粉丝id
      minaId: config.minaId,//minaId
      deliveryAddress: deliveryAddress,//地址
      contactMan: contactMan,//联系人
      contactWay: contactWay,//联系方式
    })
    //上传地址信息
    wx.request({
      url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/addresses/message/saveAddress',
      method: 'POST',
      data: {
        fansId: self.data.fansId,//粉丝id
        minaId: self.data.minaId,//minaId
        appId: config.appId,
        province: province,//省
        city: city,//市
        country: country,//区
        deliveryAddress: self.data.deliveryAddress,//地址 
        contactMan: self.data.contactMan,//联系人
        contactWay: self.data.contactWay,//联系方式
        sex: self.data.sex,//性别（0：男，1：女）
        addressesId: self.data.addressesId,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.showToast({
          title: '地址保存成功',
        })
        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1];   //当前页面
        var prevPage = pages[pages.length - 2];  //上一个页面
        //直接调用上一个页面的onLoad()方法，把数据存到上一个页面中去
        prevPage.setData({
          showAddress: true,
        })
        wx.navigateBack({
        })
      }
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