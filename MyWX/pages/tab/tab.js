Page({

  /**
   * 页面的初始数据
   */
  data: {
    current : 0,
    info : [
      "table1",
      "table2",
      "table3",
      "table4",
      "table5",
      "table6",
      "table7",
      "table8"
    ]
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
    console.log("success");
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
  tabchange: function(e) {
    console.log(e);
    var that = this;
    that.setData({
      current : e.detail.current
    });
  },
  changeTab: function(e) {
    console.log(e.currentTarget.dataset.current);
    var that = this;
    that.setData({
      current: e.currentTarget.dataset.current
    });
  },
  del: function () {
    var that = this;
    var info = that.data.info;
    info.shift();
    that.setData({
      info: info
    });
  },
  change: function () {
    var that = this;
    var info = that.data.info;
    info[3] = 'change'
    that.setData({
      info: info
    });
  }
})