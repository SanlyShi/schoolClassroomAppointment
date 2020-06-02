const express = require('express')
const app = express()
const path = require('path');
const history = require('connect-history-api-fallback');
app.use(history());

// 获取系统环境变量配置，开发环境正常为undefined
let clusterIp = process.env['CLUSTER_HOST_IP']
if (undefined == clusterIp) {
    clusterIp = '192.168.9.97'
}

const proxyIp = 'http://' + clusterIp + ':3031'
const http_proxy = require('http-proxy-middleware');
const proxy = {
    '/school': {
        target: proxyIp,
        changeOrigin: true
    },
    '/system': {
        target: proxyIp,
        changeOrigin: true,
    },
    '/downloads': {
        target: proxyIp,
        changeOrigin: true,
    },
    '/upload': {
        target: proxyIp,
        changeOrigin: true,
    },
    '/api': {
        target: proxyIp,
        changeOrigin: true,
    },
    '/table-data': {
        target: proxyIp,
        changeOrigin: true,
    }
};
for (let key in proxy) {
    app.use(key, http_proxy(proxy[key]));
}
let options = {maxAge: 2592000000} //缓存30天
app.use('/jsyymobile/static/', express.static(path.join(__dirname, 'dist/static'), options))
app.use('/', express.static(path.join(__dirname, 'dist')))

app.listen(9004)
