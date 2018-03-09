/**
 *判断网络连接组件
 *
 */
class Slider {
  //构造
  constructor(pageContext) {
    this.page = pageContext; //获取页面上下文
  }
  _goCheckout(success) {
    //判断网络连接
    wx.getNetworkType({
      success: function (res) {
        // 返回网络类型, 有效值：
        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
        var networkType = res.networkType
        if (networkType == 'unknown' || networkType == 'none') {
          wx.hideLoading();
          wx.stopPullDownRefresh();
          wx.hideNavigationBarLoading();
          wx.showModal({
            title: '提示',
            content: '暂无网络连接，请检查网络',
            showCancel: false,
          })
        }
      }
    })
  }
}
module.exports = Slider