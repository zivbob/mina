Page({

  /**
   * 页面的初始数据
   */
  data: {
    stateMsg : '未开始',
    initMsg: '未开始'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    var that = this;
    wx.onUserCaptureScreen(function (res) {
      wx.getSystemInfo({
        success: function (res) {
          if (res.brand != 'HONOR') {
            wx.showModal({
              title: '垃圾',
              content: '还特么截屏',
            });
          } else {
            wx.showToast({
              title: '哈哈哈',
            })
          }
        },
      });
    });
    wx.onCompassChange(function(res){
      that.setData({
        direction: res.direction
      });
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },
  testState: function () {
    var that = this;
    wx.getHCEState({
      success: function(res) {
        console.log(res);
        var msg = '';
        if(res.errCode == 0) {
          msg = '正常';
        } else if (res.errCode == 13000) {
          msg = '设备不支持';
        } else {
          msg = 'NFC开关未打开';
        }
        that.setData({
          stateMsg: msg
        });
      }
    });
  },
  initNfc: function () {
    var that = this;
    wx.startHCE({
      aid_list: ['F222222222'],
      success: function (res) {
        console.log(res);
      },
      fail: function (res) {
        console.log("失败");
        console.log(res);
        //开启屏幕最大亮度
        // wx.setScreenBrightness({
        //   value: 1,
        //   fail: function () {
        //     wx.showToast({
        //       title: '垃圾手机，屏幕都不亮',
        //     });
        //   }
        // });
        wx.vibrateLong({
          success: function () {
            that.setData({
              initMsg: '失败'
            });
          }
        });
        wx.vibrateShort({
          fail: function (res) {
            console.log(res);
            wx.showToast({
              title: '垃圾手机',
            });
          }
        })
      }
    })
  },
  getSys: function () {
    wx.getSystemInfo({
      success: function (res) {
        console.log(res);
        wx.showModal({
          title: '机型',
          content: res.brand + res.model,
        })
      },
    })
  },
  addSth: function () {
    wx.addPhoneContact({
      firstName: 'aaaaaaa',
      mobilePhoneNumber: '11122233344',
      success: function(res){
        console.log(res);
      },
      fail: function (res){
        console.log(res);
      }
    })
  }
})