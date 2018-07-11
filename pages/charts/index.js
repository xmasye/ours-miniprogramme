let api = require('../../common/api');
let app = getApp();

var wxCharts = require('../../common/charts');
var lineChart = null;

Page({
  onLoad: function (params) {
    this.allScheduleCharts(parseInt(params.startTime), parseInt(params.endTime));
  },

  touchHandler: function (e) {
    lineChart.scrollStart(e);
  },
  moveHandler: function (e) {
    lineChart.scroll(e);
  },
  touchEndHandler: function (e) {
    lineChart.scrollEnd(e);
    lineChart.showToolTip(e, {
      format: function (item, category) {
        return category + ' ' + item.name + ':' + item.data
      }
    });
  },

  allScheduleCharts(startTime, endTime) {
    var windowWidth = 520;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }

    // 横轴数据
    var categories = [];
    // 竖轴数据，可以多个
    var data = {};

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
          var category = 1;
          var allTask = new Set();

          // 先找出所有任务
          for (var curDay = startTime; curDay <= endTime; curDay += 60 * 60 * 24 * 1000) {
            categories.push(category++);
            let curDayData = respData.data[curDay];
            if (!curDayData){
              continue;
            }
            let records = curDayData.records;

            if (records && records.length > 0) {
              for (var index = 0; index < records.length; index++) {
                let record = records[index];
                allTask.add(record.taskName);
                data[record.taskName] = [];
              }
            }
          }

          // 这个月没有任务
          if (allTask.size == 0){
            wx.showToast({
              title: '咦，空空如也，快去加任务吧~',
              icon: 'none',
              duration: 1000
            })
            return;
          }

          // 循环
          for (var curDay = startTime; curDay <= endTime; curDay += 60 * 60 * 24 * 1000) {
            // 遍历每个任务，及对应的进度，如果没有进度，该天则为0
            for (let task of allTask.keys()) {
              let hasSchedule = false;
              // 数组
              let records = respData.data[curDay].records;

              if (records && records.length > 0) {
                for (var index = 0; index < records.length; index++) {
                  let record = records[index];
                  // 有该任务对应的进度
                  if (task == record.taskName) {
                    hasSchedule = true;
                    data[task].push(record.schedule);
                  }
                }
              }

              if (!hasSchedule) {
                // console.log("找不到任务对应进度");
                data[task].push(0);
              }
            }
          }

          var seriesData = [];
          for (var key in data) {
            seriesData.push({
              name: key,
              data: data[key],
              format: function (val, name) {
                return val;
              }
            });
          }

          lineChart = new wxCharts({
            canvasId: 'lineCanvas',
            type: 'line',
            categories: categories,
            animation: true,

            series: seriesData,

            xAxis: {
              disableGrid: true
            },
            yAxis: {
              title: '打卡任务进度 (百分比)',
              format: function (val) {
                return val.toFixed(2);
              },
              min: 0
            },
            width: windowWidth,
            height: 200,
            dataLabel: false,
            dataPointShape: true,
            enableScroll: false,
            extra: {
              lineStyle: 'curve'
            }
          });
        }
      }
    })

  }
})