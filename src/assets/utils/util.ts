import Vue from 'vue'

const showLoading = (duration: number = 1000, message: string = '加载中...') => {
  Vue.prototype.$toast.loading({
    message,
    forbidClick: true,
    duration,
    loadingType: 'spinner'
  })
}

const compare = (val:any) => {
  return function (before:any, after:any) {
    return before[val] - after[val];
  }
}

Date.prototype.format = function(fmt:string) :string{
  if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  let o:any = {
      'M+': this.getMonth() + 1,
      'd+': this.getDate(),
      'h+': this.getHours(),
      'm+': this.getMinutes(),
      's+': this.getSeconds()
  };
  for (let k in o) {
      if (new RegExp(`(${k})`).test(fmt)) {
          let str = o[k] + '';
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str :('00' + str).substr(str.length))
      }
  }
  return fmt;
}
export default {
  compare,
  showLoading,
} 