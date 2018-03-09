var server = require('./utils/server');
var config = require('./utils/config/config.js');
var configUrl = require('./utils/config/configUrl.js');

App({
  onLaunch: function () {
    console.log('App Launch')
    var self = this;
    var rd_session = wx.getStorageSync('rd_session');
    console.log('rd_session', rd_session)
    if (!rd_session) {
      self.login();
    } else {
      wx.checkSession({
        success: function () {
          // 登录态未过期
          console.log('登录态未过期')
          self.rd_session = rd_session;
          self.getUserInfo();
        },
        fail: function () {
          //登录态过期
          self.login();
        }
      })
    }
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },

  //全局变量
  globalData: {
    userInfo: null,
    hasLogin: false,
    shops: [
    ],
    around: {
      latitude: 31.49117,
      longitude: 120.31191,
    },
    fansId: null,
    rd_code: null,
  },
  rd_session: null,
  //登录
  login: function () {
    var self = this;
    wx.login({
      success: function (res) {
        var rd_code = res.code;
        console.log('wx.login', res);

        self.getFansId(rd_code);
      }
    });
  },
  //获取用户的基本信息
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo;
              typeof cb == "function" && cb(that.globalData.userInfo);
            }
          })
        }
      })
    }
  },

  //获取粉丝Id
  getFansId: function (rd_code) {
    var that = this;
    wx.request({
      url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/user/message',
      data: {
        minaType: 1,//微餐饮对应的序列
        code: rd_code,
        minaId: config.minaId,
        appId: config.appId,
      },
      method: 'post',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var fansId = res.data
        that.globalData.fansId = fansId;//赋值给globalData里的fansId
        console.log("======fansId======" + that.globalData.fansId);
        if (that.globalData.userInfo) {
          typeof cb == "function" && cb(that.globalData.userInfo)
        } else {
          //调用登录接口
          wx.login({
            success: function () {
              wx.getUserInfo({
                success: function (res) {
                  var userInfo = res.userInfo;
                  typeof cb == "function" && cb(that.globalData.userInfo);
                  that.updataUserMessage(fansId, userInfo);
                }
              })
            }
          })
        }
      }
    });

  },
  //更新以后信息(头像，昵称，性别)
  updataUserMessage: function (fansId, userInfo) {
    var that = this;
    console.log(userInfo);
    wx.request({
      url: configUrl.httpsUrl + '/VicmobMINA/minaAPI/restaurant/user/updateFans',
      data: {
        fansId: fansId,
        nickName: userInfo.nickName,
        gender: userInfo.gender,
        avatarUrl: userInfo.avatarUrl
      },
      method: 'post',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data == 1) {
          console.log("登录成功！");

        } else {
          console.log("登录失败！");
        }
      }
    });
  }
})
