/*************************************

 项目名称：波点音乐
 下载地址：https://t.cn/A6NLgAZW
 更新日期：2025-02-11
 脚本作者：@ddm1023
 电报频道：https://t.me/ddm1023
 使用声明：⚠️仅供参考，🈲转载与售卖！

 **************************************

 [rewrite_local]
 ^https:\/\/bd-api\.kuwo\.cn\/api\/(ucenter\/users|play\/listening\/user|service\/(home\/index|banner\/myPage|advert\/watch)) url script-response-body https://raw.githubusercontent.com/chxm1023/Rewrite/main/bodian.js
 response-header Content-Length (\d+) --> Content-Length 0

 [mitm]
 hostname = bd-api.kuwo.cn

 *************************************/

var body = $response.body;

// 处理 `chunked` 传输，去除 `chunk size` 和结尾的 `0`
if (body.includes("\r\n")) {
    let lines = body.split("\r\n");

    // 过滤掉 chunked 头部 (如 `3CA`) 和 结束标志 (`0`)
    lines = lines.filter(line => !/^[0-9A-Fa-f]+$/.test(line) && line !== "0");

    body = lines.join("\r\n");
}

// 解析 JSON
var chxm1023 = JSON.parse(body);
const vipa = /api\/(ucenter\/users|play\/listening\/user)/;
const ad = /api\/service\/(home\/index|banner\/myPage)/;
const advert = /api\/service\/advert\/watch/;

// 修改 VIP 信息（仅当 `payInfo` 存在时）
if (vipa.test($request.url) && chxm1023.data.hasOwnProperty("payInfo")) {
    chxm1023.data.payInfo = {
        "redFlower": 99,
        "expireDate": 4092599349000,
        "actExpireDate": 4092599349000,
        "isSigned": 1,
        "isVip": 1,
        "lastPayType": 1,
        "payExpireDate": 4092599349000
    };

    // 修改用户信息（仅当 `userInfo` 存在时）
    if (chxm1023.data.hasOwnProperty("userInfo")) {
        chxm1023.data.userInfo = {
            ...chxm1023.data.userInfo,
            "isVip": 1,
            "authType": 3,
            "headImg": "https://bodiancdn.kuwo.cn/file/bc92ceb2fb555e34246cdf4f558015ec.gif",
            "status": 1
        };
    }

    // 修改权益信息（仅当 `payRights` 存在时）
    if (chxm1023.data.hasOwnProperty("payRights")) {
        chxm1023.data.payRights = {
            "headPendant": {
                "id": 11,
                "name": "音波",
                "pic": "https://bodiancdn.kuwo.cn/file/bc92ceb2fb555e34246cdf4f558015ec.gif"
            }
        };
    }
}

// 处理广告（仅当 `bannerList` 或 `moduleList` 存在时）
if (ad.test($request.url) && chxm1023.data.hasOwnProperty("bannerList")) {
    chxm1023.data.bannerList = [];
}
if (ad.test($request.url) && chxm1023.data.hasOwnProperty("moduleList")) {
    chxm1023.data.moduleList = chxm1023.data.moduleList.filter(item => item.name !== "轮播图" && item.name !== "波点实验室");
}

// 处理广告观看
if (advert.test($request.url) && chxm1023.data) {
    chxm1023.data = {
        "mvGuide": "看广告，解锁所有VIP歌曲\n解锁后可畅听%s",
        "expireTime": 0,
        "mvDuration": 0
    };
}

// 确保返回的 JSON 格式正确
body = JSON.stringify(chxm1023).trim();
$done({ body });
