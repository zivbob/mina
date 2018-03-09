Page({

  /**
   * 页面的初始数据
   */
  data: {
    
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
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    wx.stopWifi();//关闭wifi模块
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
  startWifi: function () {
    console.log(11);
    wx.startWifi({
      success: function () {
        console.log("success");
      }
    });
  },
  getWifi: function () {
    var that = this;
    wx.getConnectedWifi({
      success: function (res) {
        console.log(res);
        that.setData({
          mywifi: res.wifi
        });
      }
    });
  },
  getList: function () {
    var that = this;
    wx.getSystemInfo({
      success: function(res) {
        console.log(res);
      },
    })
    wx.onGetWifiList(function (res) {
        console.log(res);
        that.setData({
          wifiList : res.wifiList
        });
      },{
        success: function(res) {
          wx.setWifiList({
            wifiList : res.wifiList
          });
        }
      }
    );
    wx.getWifiList();
  }
})