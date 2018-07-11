let domain = "https://xmasye.top";
let loginApi = domain + "/user/login";
let cardInfoApi = domain + "/card/info";
let modCardRecordApi = domain + "/card/record/mod";
let oneSentenceApi = domain + "/card/sentence";

module.exports.apiSuccess = apiSuccess
exports.loginApi = loginApi
exports.cardInfoApi = cardInfoApi
exports.modCardRecordApi = modCardRecordApi
exports.oneSentenceApi = oneSentenceApi

// 判断api接口返回是否成功，如果没登录态则登录
function apiSuccess(res) {
  if (res.errcode == 0) {
    return true;
  } else if (res.errcode == 3) { // 没有登录态
    getApp().login();

    wx.showToast({
      title: '哎哟，你好像没登录，刷新试试~',
      icon: 'none',
      duration: 2000
    })

    return false;
  }
  return false;
};

