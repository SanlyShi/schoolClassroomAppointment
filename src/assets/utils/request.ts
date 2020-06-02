import Vue from 'vue'
import axios from 'axios';
import QS from 'qs';
import urlParse from './urlParse';
import myVue from '../../main'
//自动切换环境
// if (process.env.NODE_ENV == 'development') { 
//     axios.defaults.baseURL = 'https://www.baidu.com';} 
// else if (process.env.NODE_ENV == 'debug') { 
//     axios.defaults.baseURL = 'https://www.ceshi.com';
// } 
// else if (process.env.NODE_ENV == 'production') { 
//     axios.defaults.baseURL = 'https://www.production.com';
// }
//设置超时时间
axios.defaults.timeout = 10000;
// post请求头
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
axios.defaults.withCredentials = true; //让ajax携带cookie
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
axios.defaults.headers.common['Access-Control-Allow-Headers'] = 'Authorization';
// axios.defaults.headers.common['Authorization'] = 'schoolId=default;userId=353568714404134912;isAdmin=false';

//对外接口
const request= (url: string, method: string = 'GET', params: any = {}):Promise<any> => {
        url = '../'+url
    // Vue.prototype.$toast.loading({
    //     message: '加载中...',
    //     forbidClick: true,
    //     loadingType: 'spinner'
    //   })
    if (method.toUpperCase() == 'GET') {
        return get(url, params);
    } else {
        return post(url, params);
    }
}
/** 
 * get方法，对应get请求 
 * @param {String} url [请求的url地址] 
 * @param {Object} params [请求时携带的参数] 
 */
function get(url: string, params?: any):Promise<any> {
    return new Promise((resolve, reject) => {
        axios.get(url+urlParse.objParseUrl(params)).then(res => {
            if (res.data.state) {
                resolve(res.data.data);
            } else {
                Vue.prototype.$toast({
                    message: res.data.message
                })
                reject(res.data)
            }
        }).catch(err => {
            if(err.isAxiosError){
                myVue.$router.push('/login')
            }
            reject(err);
        })
    });

}

/** 
 * post方法，对应post请求 
 * @param {String} url [请求的url地址] 
 * @param {Object} params [请求时携带的参数] 
 */
function post(url: string, params?: any):Promise<any> {
    return new Promise((resolve, reject) => {
        axios.post(url, QS.stringify(params)).then(res => {
            if (res.data.state) {
                resolve(res.data.data);
            } else {
                Vue.prototype.$toast({
                    message: res.data.message
                })
                reject(res.data)
            }

        }).catch(err => {
            reject(err.data);
        })

    });
}

export default request;