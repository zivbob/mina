Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: [{ id: 0, info: '删除' }, { id: 1, info: '删除2' }]
  },
  tapX: 0,
  currentX: 0,
  moveX: 0,
  maxLength: -70,
  showLength: -35,
  showFlag: 0,
  currentIndex: -1,

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
  //触碰开始
  touchStart: function (e) {
    var that = this
    if (that.currentIndex >= 0){
      that.createAnimate(0, 500)
    }
    that.currentIndex = e.target.id
    if (that.moveX == that.maxLength){
      that.moveX = 0
      that.createAnimate(that.moveX, 500)
    }
    if (e.touches.length == 1){
      var tapX = e.touches[0].clientX
      that.tapX = tapX
    }
  },
  //移动
  touchMove: function (e) {
    var that = this
    var tapX = that.tapX
    if (e.touches.length == 1) {
      var currentX = e.touches[0].clientX
      var moveX = currentX - tapX
      if(moveX > 0){
        moveX = 0
      }
      if (moveX < that.maxLength){
        moveX = that.maxLength
      }
      this.createAnimate(moveX, 0)
      this.moveX = moveX
    }
  },
  touchEnd: function (e) {
    var that = this;
    if(that.moveX <= -35){
      var moveX = that.maxLength
      console.log(moveX);
      that.createAnimate(moveX, 590)
      that.moveX = moveX
    } else {
      var moveX = 0
      that.createAnimate(moveX, 500)
      that.moveX = moveX
    }
  },
  del: function(){
    console.log('sssss')
  },
  createAnimate: function (moveX, time) {
    var that = this
    var index = that.currentIndex
    var animate = wx.createAnimation({
      duration: time,
      timingFunction: 'linear',
    })
    animate.translateX(moveX).step()
    var item = that.data.info[index]
    item.animate = animate.export()
    this.setData({
      info: that.data.info
    })
  }

})