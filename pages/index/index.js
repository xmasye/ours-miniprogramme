let api = require('../../common/api');
let chooseYear = null;
let chooseMonth = null;
let app = getApp();

const conf = {
  data: {
    hasEmptyGrid: false,
    showPicker: false
  },

  onLoad() {
    const date = new Date();
    const curYear = date.getFullYear();
    const curMonth = date.getMonth() + 1;
    const weeksCh = ['日', '一', '二', '三', '四', '五', '六'];
    this.setData({
      curYear, // 日历上选择的年份
      curMonth, // 日历上选择的月份
      weeksCh
    });

    this.calculateEmptyGrids(curYear, curMonth);
    this.calculateDays(curYear, curMonth);
    
    this.getOneSentenceWhenStart();
  },

  getThisMonthDays(year, month) {
    return new Date(year, month, 0).getDate();
  },
  getFirstDayOfWeek(year, month) {
    return new Date(Date.UTC(year, month - 1, 1)).getDay();
  },

  // 空白格子
  calculateEmptyGrids(year, month) {
    const firstDayOfWeek = this.getFirstDayOfWeek(year, month);
    let empytGrids = [];
    if (firstDayOfWeek > 0) {
      for (let i = 0; i < firstDayOfWeek; i++) {
        empytGrids.push(i);
      }
      this.setData({
        hasEmptyGrid: true,
        empytGrids
      });
    } else {
      this.setData({
        hasEmptyGrid: false,
        empytGrids: []
      });
    }
  },

  // 构造某个月的日期数组
  calculateDays(year, month) {
    let days = [];

    const thisMonthDays = this.getThisMonthDays(year, month);
    const today = new Date();

    for (let i = 1; i <= thisMonthDays; i++) {
      // 如果是今天，也显示背景
      const isToday = today.getFullYear() == year && today.getMonth() + 1 == month && today.getDate()==i;
      days.push({
        day: i,
        choosed: isToday,
      });
    }

    // console.log("当月第一天：" + new Date(year, month-1, 1));
    // console.log("当月最后一天：" + new Date(year, month-1, days.length));

    let thisMonthFirstDay = new Date(year, month - 1, 1).getTime();
    let thisMonthLastDay = new Date(year, month - 1, days.length).getTime();

    this.setData({
      days,
      thisMonthFirstDay,
      thisMonthLastDay
    });
  },

  // 切换月份的时候 
  handleCalendar(e) {
    const handle = e.currentTarget.dataset.handle;
    const curYear = this.data.curYear;
    const curMonth = this.data.curMonth;
    if (handle === 'prev') {
      let newMonth = curMonth - 1;
      let newYear = curYear;
      if (newMonth < 1) {
        newYear = curYear - 1;
        newMonth = 12;
      }

      this.setData({
        curYear: newYear,
        curMonth: newMonth
      });

      console.log("newYear：" + newYear + ", newMonth:" + newMonth);
      this.calculateDays(newYear, newMonth);
      this.calculateEmptyGrids(newYear, newMonth);
    } else {
      let newMonth = curMonth + 1;
      let newYear = curYear;
      if (newMonth > 12) {
        newYear = curYear + 1;
        newMonth = 1;
      }
      this.setData({
        curYear: newYear,
        curMonth: newMonth
      });

      console.log("newYear：" + newYear + ", newMonth:" + newMonth);
      this.calculateDays(newYear, newMonth);
      this.calculateEmptyGrids(newYear, newMonth);
    }
  },

  // 点击某天后，刷新是否被选择
  tapDayItem(e) {
    const idx = e.currentTarget.dataset.idx;
    const curDate = new Date(this.data.curYear, this.data.curMonth-1, idx+1);
    const days = this.data.days;
    for (let i = 0; i < days.length; i++) {
      if (i == idx) {
        days[i].choosed = 1;
      } else {
        days[i].choosed = 0;
      }
    }
    this.setData({
      days,
    });

    // 跳转到打卡进度页面
    wx.navigateTo({
      url: '/pages/cardsinfo/index?curDay=' + curDate.getTime()
    })

  },

  tapMonthFinishInfo(){
    // 跳转到图表页面
    wx.navigateTo({
      url: '/pages/charts/index?startTime=' + this.data.thisMonthFirstDay + '&endTime=' + this.data.thisMonthLastDay
    })
  },

  chooseYearAndMonth() {
    const curYear = this.data.curYear;
    const curMonth = this.data.curMonth;
    let pickerYear = [];
    let pickerMonth = [];
    for (let i = 1900; i <= 2100; i++) {
      pickerYear.push(i);
    }
    for (let i = 1; i <= 12; i++) {
      pickerMonth.push(i);
    }
    const idxYear = pickerYear.indexOf(curYear);
    const idxMonth = pickerMonth.indexOf(curMonth);
    this.setData({
      pickerValue: [idxYear, idxMonth],
      pickerYear,
      pickerMonth,
      showPicker: true,
    });
  },
  pickerChange(e) {
    const val = e.detail.value;
    chooseYear = this.data.pickerYear[val[0]];
    chooseMonth = this.data.pickerMonth[val[1]];
  },
  tapPickerBtn(e) {
    const type = e.currentTarget.dataset.type;
    const o = {
      showPicker: false,
    };
    if (type === 'confirm') {
      o.curYear = chooseYear;
      o.curMonth = chooseMonth;
      this.calculateEmptyGrids(chooseYear, chooseMonth);
      this.calculateDays(chooseYear, chooseMonth);
    }

    this.setData(o);
  },
  onShareAppMessage() {
    return {
      title: '小程序日历',
      desc: '还是新鲜的日历哟',
      path: 'pages/index/index'
    };
  },

  // 在启动的时候获取一句话，可能是心灵鸡汤，可能是想说的话
  getOneSentenceWhenStart() {
    wx.request({
      url: api.oneSentenceApi,
      data: {
        accessToken: app.globalData.accessToken
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        let respData = res.data;
        if (api.apiSuccess(respData) == true) {
          let sentence = respData.data[sentence];
          if (!sentence) {
            wx.showToast({
              title: sentence,
              icon: 'none',
              duration: 1500
            });
            return;
          }
        }
      }
    })
  }


};

Page(conf);
