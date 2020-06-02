import App from './App.vue'
import echart from 'echarts'
import router from './router'
import md5 from 'js-md5'
import store from './store'
import Vue from 'vue'
import utils from './assets/utils/util'
import VueCookies from 'vue-cookies'
import VueLazyLoad from 'vue-lazyload'
import VNavBar from './components/vNavBar.vue'
import Detection from './components/personalDetection.vue'
// import './assets/utils/rem.js'
import 'swiper/dist/css/swiper.css' //注意这里 
import './registerServiceWorker'
import 'lib-flexible'

Vue.prototype.$echarts = echart
Vue.prototype.$utils = utils
Vue.prototype.$md5 = md5
Vue.prototype.imageUrlPrefix = '/downloads/storage/images/' // 图片下载前缀
Vue.prototype.fileUrlPrefix = '/downloads/storage/files/' // 文件下载前缀
Vue.prototype.uploadImage = '/upload/storage/images' // 图片上传地址
Vue.prototype.uploadFile = '/upload/storage/files' // 文件上传地址
Vue.prototype.uploadBase64 = '/api/storage/base64Images' // base64上传地址
Vue.prototype.deleteFile = '/api/storage/deleteFiles'

import {
  Button,
  Cell, 
  CellGroup,
  Col,
  Dialog,
  Divider,
  Icon,
  Image,
  Lazyload,
  List,
  Loading,
  NavBar,
  Pagination,
  Popup,
  Progress,
  PullRefresh,
  Row,
  Skeleton,
  Swipe, 
  SwipeItem,
  Switch,
  SwitchCell,
  Tab,
  Tabs,
  DropdownMenu,
  DropdownItem,
  DatetimePicker,
  Picker,
  Tabbar,
  TabbarItem,
  Toast
} from 'vant'

Vue
  .use(Button)
  .use(Cell)
  .use(CellGroup)
  .use(Col)
  .use(Dialog)
  .use(Divider)
  .use(Icon)
  .use(Image)
  .use(Lazyload)
  .use(List)
  .use(Loading)
  .use(NavBar)
  .use(Pagination)
  .use(Popup)
  .use(Progress)
  .use(PullRefresh)
  .use(Row)
  .use(Skeleton)
  .use(Swipe)
  .use(SwipeItem)
  .use(Switch)
  .use(SwitchCell)
  .use(Tab)
  .use(Tabs)
  .use(Toast)
  .use(DropdownMenu)
  .use(DropdownItem)
  .use(DatetimePicker)
  .use(Picker)
  .use(Tabbar)
  .use(TabbarItem)
Vue.use(VueCookies)
Vue.use(VueLazyLoad,{

})
Vue.component('detect', Detection)
Vue.component('v-nav-bar', VNavBar)

Vue.config.productionTip = false

router.beforeEach((to, from, next) => {
  if (to.name === 'login' || (Vue.prototype.$cookies.get("SAAS_S_ID")&&Vue.prototype.$cookies.get("SAAS_U"))) {  
      next();
  }
  else {
    window.location.href = '../index'
    // if(window.location.host.indexOf(':')!==-1){//说明有端口号 用base64加密,
    //   let href = `${window.location.href.split(':')[0]}:${window.location.href.split(':')[1]}:3031/school/default?IDS_URL=${window.btoa(window.location.host)}#`
    //   window.location.href = href
    // }else{
    //   window.location.href = `${window.location.href.split(':')[0]}://${window.location.host}/school/default?IDS_URL=${window.btoa(window.location.host)}`
    // }
     
  }
})

let myVue = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
export default myVue