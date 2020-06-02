

export default {
    /**
 * 解析url参数
 * @example ?id=12345&a=b
 * @return Object {id:12345,a:b}
 */
    urlParse (url: string): any {
        var obj: any = {};
        var reg = /[?&][^?&]+=[^?&]+/g;
        var arr = url.match(reg);
        // ['?id=12345', '&a=b']
        if (arr) {
            arr.forEach((item) => {
                var tempArr = item.substring(1).split('=');
                var key = decodeURIComponent(tempArr[0]);
                var val = decodeURIComponent(tempArr[1]);
                obj[key] = val;
            });
        }
        return obj;
    },

    /**
     * 将对象转化成url参数
     */
    objParseUrl(obj: any): any {
        let urlParams = ''
        for (let key in obj) {
            urlParams += `${key}=${obj[key]}&`
        }
        if (urlParams !== '') {
            urlParams = urlParams.substr(0, urlParams.length - 1)
            urlParams = `?${urlParams}`
        }
        return urlParams;
    }
}

