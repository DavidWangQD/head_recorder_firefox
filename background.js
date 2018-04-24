var config = {};

//ajax方法
function ajax(options) {
    options = options || {};
    options.type = (options.type || "GET").toUpperCase();
    options.dataType = options.dataType || "json";
    var params = formatParams(options.data);

    //创建 - 非IE6 - 第一步
    if (window.XMLHttpRequest) {
        var xhr = new XMLHttpRequest();
    } else { //IE6及其以下版本浏览器
        var xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }

    //接收 - 第三步
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var status = xhr.status;
            if (status >= 200 && status < 300) {
                options.success && options.success(xhr.responseText, xhr.responseXML);
            } else {
                options.fail && options.fail(status);
            }
        }
    };

    //连接 和 发送 - 第二步
    if (options.type == "GET") {
        xhr.open("GET", options.url + "?" + params, true);
        xhr.send(null);
    } else if (options.type == "POST") {
        xhr.open("POST", options.url, true);
        //设置表单提交时的内容类型
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(params);
    }
}

//获得随机字符串（唯一标识符）
function randomString(len) {
    var timestamp = new Date().getTime();
    len = len || 32;
    var $chars = 'abcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    var maxPos = $chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return timestamp+'_'+pwd;
}

//格式化参数
function formatParams(data) {
    var arr = [];
    for (var name in data) {
        arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
    }
    //arr.push(("v=" + Math.random()).replace(".",""));
    return arr.join("&");
}

//初始化
(function () {
    //设置唯一标识符
    if (!localStorage.getItem('uniqueIdentifier')) localStorage.setItem('uniqueIdentifier', randomString(10));
    msgInit();
    monitorInit();
}());

//消息初始化
function msgInit() {
    browser.runtime.onMessage.addListener(function(msg){
        if (msg.hasOwnProperty('cmd') && msg.cmd === 'init') {
            monitorInit();
        }
    });
}
//监听事件初始化
function monitorInit() {
    if (localStorage.getItem('name') && localStorage.getItem('server')) {
        var server = localStorage.getItem('server').replace(/^(http|https):\/\//, '').replace(/\/$/, '');
        ajax({
            url: "http://"+server+"/api/config",    //请求地址
            type: "GET",                            //请求方式
            data: {},                               //请求参数
            dataType: "json",
            success: function (response, xml) {
                config = JSON.parse(response);
                browser.webRequest.onBeforeSendHeaders.addListener(
                    function (e) {
                        if (localStorage.getItem('name') && localStorage.getItem('server')) {
                            if ('requestHeaders' in e) {
                                var server = localStorage.getItem('server').replace(/^(http|https):\/\//, '').replace(/\/$/, '');
                                var params = {};
                                var requestHeadersLen = e.requestHeaders.length;
                                for (var i = 0; i < requestHeadersLen; i++) {
                                    params[e.requestHeaders[i].name] = e.requestHeaders[i].value;
                                }
                                params['userName'] = localStorage.getItem('name');
                                params['requestUrl'] = e.url;
                                params['uniqueIdentifier'] = localStorage.getItem('uniqueIdentifier');
                                ajax({
                                    url: "http://"+server+"/api/authInfo",    //请求地址
                                    type: "POST",                             //请求方式
                                    data: params,                             //请求参数
                                    dataType: "json",
                                    success: function (response, xml) {
                                        // 此处放成功后执行的代码
                                    },
                                    fail: function (status) {
                                        networkNotice();
                                    }
                                });
                            }
                        } else {
                            configNotice();
                        }
                    },
                    {urls: config['urls'], types : config['types']},
                    ["requestHeaders"]
                );
            },
            fail: function (status) {
                networkNotice();
            }
        });
    } else {
        configNotice();
    }
}

//配置提示信息
function configNotice() {
    browser.notifications.create('personal_config', {
        title: browser.i18n.getMessage("configNoticeTitle"),
        message: browser.i18n.getMessage("configNoticeMessage"),
        iconUrl: browser.extension.getURL("icons/tom-60.png"),
        type: 'basic'
    });
}

//网络错误提示信息
function networkNotice() {
    var msg = '';
    if (config.hasOwnProperty('admin') && config['admin'].hasOwnProperty('name') && config['admin'].hasOwnProperty('mobile')) {
        msg = ' ( '+config['admin']['name']+' : '+config['admin']['mobile']+' )';
    }
    browser.notifications.create('personal_config', {
        title: browser.i18n.getMessage("networkNoticeTitle"),
        message: browser.i18n.getMessage("networkNoticeMessage")+"\n"+msg,
        iconUrl: browser.extension.getURL("icons/tom-60.png"),
        type: 'basic'
    });
}