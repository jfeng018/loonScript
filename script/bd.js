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

 [mitm]
 hostname = bd-api.kuwo.cn

 *************************************/

var body = $response.body;

// 处理 chunked 传输，去除 `chunk size` 和尾部 `0`
if (body.includes("\r\n")) {
    let lines = body.split("\r\n");

    // 过滤掉 chunked 传输的 `size` 头部和 `0` 结束标志
    lines = lines.filter(line => !/^[0-9A-Fa-f]+$/.test(line) && line !== "0");

    body = lines.join("\r\n");
}

var chxm1023 = JSON.parse(body);
const vipa = /api\/(ucenter\/users|play\/listening\/user)/;
const ad = /api\/service\/(home\/index|banner\/myPage)/;
const advert = /api\/service\/advert\/watch/;

// 只在返回数据包含 "payInfo" 时修改 VIP 信息
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

    // 仅在返回数据包含 "userInfo" 时修改用户信息
    if (chxm1023.data.hasOwnProperty("userInfo")) {
        chxm1023.data.userInfo = {
            ...chxm1023.data.userInfo,
            "isVip": 1,
            "authType": 3,
            "headImg": "https://bodiancdn.kuwo.cn/file/bc92ceb2fb555e34246cdf4f558015ec.gif",
            "status": 1
        };
    }

    // 仅在返回数据包含 "payRights" 时修改
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

// 仅当返回数据包含 "bannerList" 或 "moduleList" 时才进行去广告
if (ad.test($request.url) && chxm1023.data.hasOwnProperty("bannerList")) {
    chxm1023.data.bannerList = [];
}
if (ad.test($request.url) && chxm1023.data.hasOwnProperty("moduleList")) {
    chxm1023.data.moduleList = chxm1023.data.moduleList.filter(item => item.name !== "轮播图" && item.name !== "波点实验室");
}

// 仅当返回数据包含广告信息时进行修改
if (advert.test($request.url) && chxm1023.data) {
    chxm1023.data = {
        "mvGuide": "看广告，解锁所有VIP歌曲\n解锁后可畅听%s",
        "expireTime": 0,
        "mvDuration": 0
    };
}

// 确保返回的 JSON 结构正确
body = JSON.stringify(chxm1023).trim();
$done({ body });
