let api = require('../../common/api');
let util = require('../../common/util');
let app = getApp();

Page({
  data: {
    day: '',
    curDayTimestamp: 0,
    saveLoading: false,
    saveDisabled: false
  },

  onLoad(params) {
    // 日期
    let curDayTimestamp = parseInt(params.curDay);
    let curDay = new Date(curDayTimestamp);

    // 考试日子
    let examDayTimestamp = 1545408000000; //2018-12-22 00:00:00
    let remainDay = (examDayTimestamp - curDay.getTime()) / (1000 * 60 * 60 * 24);
    if (remainDay < 0) {
      remainDay = 0;
    }

    this.setData({
      day: '只剩「' + remainDay + '」天啦！',
      curDayTimestamp: curDayTimestamp
    });

    this.queryCardInfo(curDayTimestamp, curDayTimestamp);
  },

  // 显示一天的打卡信息页面
  showDayCardInfo(cardRecords) {
    if (!cardRecords) {
      
    } else {
      this.setData({
        cardRecords: cardRecords
      })
    }
  },

  // 获取打卡信息
  queryCardInfo(startTime, endTime) {
    if (!startTime || !endTime) {
      return;
    }

    var that = this;
    var curDay = startTime;

    wx.request({
      url: api.cardInfoApi,
      data: {
        startTime: startTime,
        endTime: endTime,
        accessToken: app.globalData.accessToken
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        let respData = res.data;
        if (api.apiSuccess(respData) == true) {
          // console.log('获取打卡信息成功' + respData);
          let curDayData = respData.data[curDay];
          if (!curDayData) {
            wx.showToast({
              title: '咦，空空如也，快去加任务吧~',
              icon: 'none',
              duration: 1000
            })
            return;
          } else {
            let records = curDayData.records;
            that.showDayCardInfo(records);
          }
        }
      }
    })
  },

  sliderChange(e) {
    let map = this.data.schedules;
    if (!map) {
      map = {}
    }
    map[parseInt(e.target.dataset.taskid)] = e.detail.value;

    this.setData({
      schedules: map
    });
  },

  saveSchedule() {
    // 没有更新过就不用请求了
    if (!this.data.schedules) {
      wx.showToast({
        title: '打卡任务还没有更新过呢~',
        icon: 'none',
        duration: 1000
      })
      return;
    }

    this.setData({
      saveLoading: true,
      saveDisabled: true
    });

    const that = this;

    wx.request({
      url: api.modCardRecordApi,
      data: {
        day: this.data.curDayTimestamp,
        params: JSON.stringify(this.data.schedules),
        accessToken: app.globalData.accessToken
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        let respData = res.data;
        if (api.apiSuccess(respData) == true) {
          wx.showToast({
            title: '叶先生说：继续加油哦，mua~',
            icon: 'none',
            duration: 2000
          });

          // 更新成功后把数据清掉
          that.setData({
            schedules: null
          });
        } else {
          wx.showToast({
            title: '更新打卡失败，请重试',
            icon: 'none',
            duration: 1000
          })
        }
      },
      complete: function () {
        that.setData({
          saveLoading: false,
          saveDisabled: false
        });
      }
    })

  }

})

