const Q = require('q');
const __MOMENT__ = require('moment');
const __HELPER__ = require('../utility/helper');
const __ERROR_CODE__ = require('../utility/error.code');
const __LOGGER__ = require('../services/log4js.service').getLogger('vehicles.api.js');
/**
 *  MongoDB
 *
 */
const __OBJECT_ID__ = require('mongodb').ObjectID;
const __MONGO_BASIC__ = require('../services/mongo/mongo.basic');
/**
 *  Vehicles Service
 */
const __VEHICLES_SERVICE__ = require('../services/vehicles.service');


/**
 * 构建传入参数
 * @param request
 * @returns {{authenticationDatabase: (string|*), user, password, databaseName: string, collectionName: string}}
 */
function constructParameter(request) {
    return {
        authenticationDatabase: request.authenticationDatabase || 'admin',              //  授权数据库
        user: request.user || 'vehicles',                                               //  角色
        password: request.password || '741qaz',                                         //  密码
        databaseName: 'vehicles',                                                       //  访问数据库
        collectionName: request.collectionName || 'record'                              //  collection
    }
}

/**
 * 添加操作记录
 *
 * @param request
 * @returns {*|promise}
 */
function recordAction(request) {
    const deferred = Q.defer();

    __LOGGER__.debug('====== addNewRecord ======');
    //  构建参数
    const __PARAMETER__ = constructParameter(request);
    __PARAMETER__.insertOne = {                                             //  前置条件
        action: request.action,                                             //  操作类型
        remark: request.remark,                                             //  备注
        createTime: __MOMENT__().format('YYYY-MM-DD HH:mm:ss'),             //  创建时间
        operator: request.operator
    };

    __MONGO_BASIC__.setupConnection({
        params: __PARAMETER__,
        result: {}
    })
        .then(__MONGO_BASIC__.insertOne)
        .then(__MONGO_BASIC__.close)
        .then(res => {
            "use strict";
            __LOGGER__.debug(res.result);
            deferred.resolve({
                code: __ERROR_CODE__.success,
                msg: '成功添加操作日志'
            })
        })
        .catch(err => {
            "use strict";
            deferred.reject(err)
        });

    return deferred.promise;
}

/**
 *  查询操作日志
 *
 * @param request
 * @returns {*|promise}
 */
function queryRecord(request) {
    const deferred = Q.defer();
    let amount;

    __LOGGER__.debug('====== queryRecord ======');
    //  构建参数
    const __PARAMETER__ = constructParameter(request);
    __PARAMETER__.count = {"operator": request.operator};           //  用户
    __PARAMETER__.find = {"operator": request.operator};            //
    __PARAMETER__.sort = {"_id": -1};                               //  按创建时间进行排序，最先发布的排在前面
    __PARAMETER__.skip = request.skip || 0;                         //  跳过的查询记录
    __PARAMETER__.limit = request.limit || 0;

    __MONGO_BASIC__.setupConnection({
        params: __PARAMETER__,
        result: {}
    })
        .then(__MONGO_BASIC__.count)
        .then(count => {
            'use strict';
            amount = count.result;
            return Q(count);
        })
        .then(__MONGO_BASIC__.limit)
        .then(__MONGO_BASIC__.close)
        .then(res => {
            "use strict";
            // __LOGGER__.debug(res.result);
            deferred.resolve({
                code: __ERROR_CODE__.success,
                data: res.result,
                amount: amount
            })
        })
        .catch(err => {
            "use strict";
            __LOGGER__.error(err);
            deferred.reject(err)
        });

    return deferred.promise;
}

module.exports = {
    recordAction: recordAction,
    queryRecord: queryRecord
};


// addNewRecord({
//     action: 0,
//     remark: '向右'
// }).then(res => {
//     console.log(res);
// }).catch(err => {
//     console.error(err)
// })

// queryRecord({})
//     .then(res => {
//         console.log(res)
//     })
//     .catch(err => {
//         console.error(err)
//     })