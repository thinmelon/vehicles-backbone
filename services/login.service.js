const __MOMENT__ = require('moment');
const __IDENTITY_DATABASE__ = require('../database/identity.api');
const __LOGGER__ = require('./log4js.service').getLogger('login.service.js');
const __HELPER__ = require('../utility/helper');

/**
 *  登录服务
 */
function authorize(req, res, next) {
    __LOGGER__.info('========================== LOGIN SERVICE ==========================');
    __LOGGER__.info(req.params);
    __LOGGER__.info(req.body);
    __LOGGER__.info(req.query);

    if (!req.query.hasOwnProperty('session') || !req.query.session) {
        res.sendStatus(403);
        return;
    }

    try {
        const params = JSON.parse(__HELPER__.privateDecrypt(decodeURIComponent(req.query.session)));    //  解析参数
        let startTime = __MOMENT__(Date.now()).subtract(5, 'seconds').format('YYYY-MM-DD HH:mm:ss');    //  预计请求开始时间
        let endTime = __MOMENT__(Date.now()).add(5, 'seconds').format('YYYY-MM-DD HH:mm:ss');           //  当前时间
        let requestTime = __MOMENT__(params.timestamp);                                                 //  实际请求时间
        __LOGGER__.debug('【 LOGIN RANGE 】 START TIME ==> ', startTime);
        __LOGGER__.debug('【 LOGIN RANGE 】 END TIME ==> ', endTime);
        __LOGGER__.debug('【 LOGIN 】 REQUEST TIME ==> ', requestTime.format('YYYY-MM-DD HH:mm:ss'));
        //  如果客户端请求时间（已计入初次登录时与系统时间的预估误差）与当前系统时间的误差范围在上下5秒，则算合理请求
        if (requestTime.isBetween(startTime, endTime, 'second')) {
            __IDENTITY_DATABASE__
                .checkIdentity({
                    session: params.session
                })
                .then(res => {
                    "use strict";
                    if (res.code === 0) {
                        //  校验通过，移交下一步
                        next()
                    } else {
                        //  403错误
                        res.sendStatus(403);
                    }
                })
                .catch(err => {
                    "use strict";
                    __LOGGER__.error(err);
                    //  500错误
                    res.sendStatus(500);
                });
        } else {
            //  403错误
            res.status(403).end('Oops, bad request for timestamp');
        }
    } catch (err) {
        //  403错误
        __LOGGER__.error(err);
        res.sendStatus(403);
    }
}

module.exports = {
    authorize: authorize
};
