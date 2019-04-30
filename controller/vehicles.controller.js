const Q = require('q');
const __LOGGER__ = require('../services/log4js.service').getLogger('vehicles.controller.js');
const __HELPER__ = require('../utility/helper');

/**
 *      MONGO
 */
const __MONGO_CONFIG__ = require('../services/mongo/mongo.config');
const __IDENTITY_DATABASE__ = require('../database/identity.api');
const __VEHICLES_DATABASE__ = require('../database/vehicles.api');

/**
 *      获取车辆的实时状态
 *
 * @param request
 * @param response
 */
function getVehicleStatus(request, response) {
    const params = JSON.parse(__HELPER__.privateDecrypt(decodeURIComponent(request.query.session)));    //  解析参数
    __IDENTITY_DATABASE__.findUser({
        session: params.session
    })
        .then(result => {
            __LOGGER__.debug(result);
            response({
                code: result.code,
                data: result.data.vehicle
            });
        })
        .catch(exception => {
            __LOGGER__.error(exception);
            response(exception);
        });
}

/**
 *      添加操作记录
 *
 * @param request
 * @param response
 */
function recordAction(request, response) {
    const params = JSON.parse(__HELPER__.privateDecrypt(decodeURIComponent(request.query.session)));    //  解析参数

    __IDENTITY_DATABASE__.findUser({
        session: params.session
    })
        .then(user => {
            console.log(user);
            return Q({
                authenticationDatabase: __MONGO_CONFIG__.PARAMS.DATABASE_NAME_ADMIN,
                user: __MONGO_CONFIG__.PARAMS.USER_ADMIN,
                password: __MONGO_CONFIG__.PARAMS.PASSWORD_ADMIN,
                action: request.body.action,
                remark: request.body.remark,
                operator: user.data._id
            });
        })
        .then(__VEHICLES_DATABASE__.recordAction)
        .then(() => {
            return Q({
                session: params.session,
                action: request.body.action,
                remark: request.body.remark
            })
        })
        .then(__IDENTITY_DATABASE__.updateVehiclesStatus)
        .then(result => {
            // __LOGGER__.debug(result);
            response(result);
        })
        .catch(exception => {
            __LOGGER__.error(exception);
            response(exception);
        });
}

/**
 *      查询操作记录
 *
 * @param request
 * @param response
 */
function queryRecord(request, response) {
    const params = JSON.parse(__HELPER__.privateDecrypt(decodeURIComponent(request.query.session)));    //  解析参数

    __IDENTITY_DATABASE__.findUser({
        session: params.session
    })
        .then(user => {
            console.log(user);
            return Q({
                authenticationDatabase: __MONGO_CONFIG__.PARAMS.DATABASE_NAME_ADMIN,
                user: __MONGO_CONFIG__.PARAMS.USER_ADMIN,
                password: __MONGO_CONFIG__.PARAMS.PASSWORD_ADMIN,
                skip: request.query.offset,
                limit: request.query.amount,
                operator: user.data._id
            });
        })
        .then(__VEHICLES_DATABASE__.queryRecord)
        .then(result => {
            // __LOGGER__.debug(result);
            response(result);
        })
        .catch(exception => {
            __LOGGER__.error(exception);
            response(exception);
        });
}

module.exports = {
    getVehicleStatus: getVehicleStatus,
    recordAction: recordAction,
    queryRecord: queryRecord
};
