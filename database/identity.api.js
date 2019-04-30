const Q = require('q');
const __MOMENT__ = require('moment');
const __HELPER__ = require('../utility/helper');
const __ERROR_CODE__ = require('../utility/error.code');
const __LOGGER__ = require('../services/log4js.service').getLogger('identity.api.js');
const __MONGO_BASIC__ = require('../services/mongo/mongo.basic');

/**
 * 构建传入参数
 * @param request
 * @returns {{authenticationDatabase: (string|*), user, password, databaseName: string, collectionName: string}}
 */
function constructParameter(request) {
    return {
        authenticationDatabase: request.authenticationDatabase || 'admin',          //  授权数据库
        user: request.user || 'vehicles',                                           //  角色
        password: request.password || '741qaz',                                     //  密码
        databaseName: 'identity',                                                   //  访问数据库
        collectionName: request.collectionName || 'user'                            //  collection
    }
}

/**
 *  测试账号登录
 *
 * @param request
 * @returns {*|promise|C}
 */
function testLogin(request) {
    const deferred = Q.defer();
    const nonceStr = __HELPER__.getNonceStr(32);

    __LOGGER__.debug('====== testLogin ======');
    //  构建参数
    const __PARAMETER__ = constructParameter(request);
    __PARAMETER__.findOneAndUpdateWhere = {                                      //  查找并更新条件
        account: request.account,
        password: request.pwd
    };
    __PARAMETER__.findOneAndUpdate = {
        $set: {
            "lastLogin": __MOMENT__(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
            "session": nonceStr
        }
    };
    __PARAMETER__.findOneAndUpdateOptions = {
        upsert: false,                                                          //  未找到不添加
        returnOriginal: false                                                   //  返回更新后数据集
    };

    __MONGO_BASIC__.setupConnection({
        params: __PARAMETER__,
        result: {}
    })
        .then(__MONGO_BASIC__.findOneAndUpdate)
        .then(__MONGO_BASIC__.close)
        .then(res => {
            "use strict";
            __LOGGER__.debug('testLogin ==> updatedExisting ==> ', res.result);
            if (res.result.value && res.result.lastErrorObject.updatedExisting) {
                deferred.resolve({
                    code: __ERROR_CODE__.success,
                    session: nonceStr,                                          //  SESSION
                    publicKey: __HELPER__.getPublicKey(),                       //  PUBLIC KEY
                    serverTime: Date.now()                                      //  当前时间
                })
            } else {
                deferred.reject({
                    code: __ERROR_CODE__.notFoundError,
                    msg: '非法入侵'
                })
            }
        })
        .catch(err => {
            "use strict";
            deferred.reject(err)
        });

    return deferred.promise;
}

/**
 * 注册测试账号
 *
 * @param request
 * @returns {*|promise}
 */
function testRegister(request) {
    const deferred = Q.defer();
    const nonceStr = __HELPER__.getNonceStr(32);

    __LOGGER__.debug('====== testRegister ======');
    //  构建参数
    const __PARAMETER__ = constructParameter(request);
    __PARAMETER__.findOneAndUpdateWhere = {                                      //  查找并更新条件
        account: request.account,
        password: request.pwd
    };
    __PARAMETER__.findOneAndUpdate = {
        $set: {
            "lastLogin": __MOMENT__(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
            "session": nonceStr
        }
    };
    __PARAMETER__.findOneAndUpdateOptions = {
        upsert: true,                                                           //  未找到添加
        returnOriginal: false                                                   //  返回更新后数据集
    };

    __MONGO_BASIC__.setupConnection({
        params: __PARAMETER__,
        result: {}
    })
        .then(__MONGO_BASIC__.findOneAndUpdate)
        .then(__MONGO_BASIC__.close)
        .then(res => {
            "use strict";
            __LOGGER__.debug('testRegister ==> updatedExisting ==> ', res.result);
            deferred.resolve({
                code: __ERROR_CODE__.success,
                session: nonceStr,                                          //  SESSION
                publicKey: __HELPER__.getPublicKey(),                       //  PUBLIC KEY
                serverTime: Date.now()                                      //  当前时间
            });
        })
        .catch(err => {
            "use strict";
            deferred.reject(err)
        });

    return deferred.promise;
}

/**
 *  验证用户身份信息
 *
 * @param request
 * @returns {*|promise|C}
 */
function checkIdentity(request) {
    const deferred = Q.defer();
    __LOGGER__.debug('====== checkIdentity ======', request.session);

    //  构建参数
    const __PARAMETER__ = constructParameter(request);
    __PARAMETER__.count = {                                                         //  查询条件
        'session': request.session                                                  //  session
    };

    __MONGO_BASIC__.setupConnection({
        params: __PARAMETER__,
        result: {}
    })
        .then(__MONGO_BASIC__.count)
        .then(__MONGO_BASIC__.close)
        .then(res => {
            "use strict";
            if (res.result === 1) {
                deferred.resolve({
                    code: __ERROR_CODE__.success,
                    msg: 'SUCCESS'
                });
            } else {
                deferred.reject({
                    code: __ERROR_CODE__.notFoundError,
                    msg: '登录超时'
                })
            }
        })
        .catch(err => {
            "use strict";
            deferred.reject(err)
        });

    return deferred.promise;
}

/**
 * 找到相应的账号
 * @param request
 * @returns {*|promise}
 */
function findUser(request) {
    const deferred = Q.defer();
    __LOGGER__.debug('====== findUser ======', request.session);

    //  构建参数
    const __PARAMETER__ = constructParameter(request);
    __PARAMETER__.findOne = {                                                       //  查询条件
        'session': request.session                                                  //  session
    };

    __MONGO_BASIC__.setupConnection({
        params: __PARAMETER__,
        result: {}
    })
        .then(__MONGO_BASIC__.findOne)
        .then(__MONGO_BASIC__.close)
        .then(res => {
            "use strict";
            console.log(res.result);
            if (res.result) {
                deferred.resolve({
                    code: __ERROR_CODE__.success,
                    data: res.result
                });
            } else {
                deferred.reject({
                    code: __ERROR_CODE__.notFoundError,
                    msg: '未找到相应用户'
                })
            }
        })
        .catch(err => {
            "use strict";
            deferred.reject(err)
        });

    return deferred.promise;
}

/**
 * 更新用户车辆实时状态
 *
 * @param request
 * @returns {*|promise}
 */
function updateVehiclesStatus(request) {
    const deferred = Q.defer();
    __LOGGER__.debug('====== updateVehiclesStatus ======', request.session);

    //  构建参数
    const __PARAMETER__ = constructParameter(request);
    __PARAMETER__.findOneAndUpdateWhere = {                                      //  查找并更新条件
        'session': request.session                                               //  session
    };
    let params;
    if (request.remark && request.remark.trim() !== '') {
        params = {
            'vehicle.action': request.action,
            'vehicle.remark': request.remark
        };
    } else {
        params = {
            'vehicle.action': request.action
        };
    }
    __PARAMETER__.findOneAndUpdate = {
        $set: params
    };
    __PARAMETER__.findOneAndUpdateOptions = {
        upsert: false,                                                           //  未找到添加
        returnOriginal: false                                                    //  返回更新后数据集
    };

    __MONGO_BASIC__.setupConnection({
        params: __PARAMETER__,
        result: {}
    })
        .then(__MONGO_BASIC__.findOneAndUpdate)
        .then(__MONGO_BASIC__.close)
        .then(res => {
            "use strict";
            __LOGGER__.debug('testLogin ==> updatedExisting ==> ', res.result);
            if (res.result.value && res.result.lastErrorObject.updatedExisting) {
                deferred.resolve({
                    code: __ERROR_CODE__.success,
                    msg: 'SUCCESS'
                })
            } else {
                deferred.reject({
                    code: __ERROR_CODE__.notFoundError,
                    msg: '未找到相应用户'
                })
            }
        })
        .catch(err => {
            "use strict";
            deferred.reject(err)
        });

    return deferred.promise;
}

module.exports = {
    /**
     *  登录/注册
     */
    testLogin: testLogin,
    testRegister: testRegister,
    /**
     *  有效性
     */
    findUser: findUser,
    updateVehiclesStatus: updateVehiclesStatus,
    checkIdentity: checkIdentity
};

// checkIdentity({
//     authenticationDatabase: 'admin',
//     user: 'butler',
//     password: 'BigUp@2019',
//     session: 'wXZfd8HcvKgJSX4CMTC8LZllBqvWRXq'
// })
//     .then(res => {
//         "use strict";
//         console.log(res)
//     })
//     .catch(err => {
//         "use strict";
//         console.error(err)
//     })

// testRegister({
//     account: 'tyui',
//     pwd: '123458'
// });

// findUser({
//     "session": "pJvBP7E2on0GHwQ05MhLBoqwIbdsGsPb"
// })
//     .then(res => {
//
//     })
