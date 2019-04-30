const __LOGGER__ = require('../services/log4js.service').getLogger('user.controller.js');

/**
 *      MONGO
 */
const __MONGO_CONFIG__ = require('../services/mongo/mongo.config');
const __IDENTITY_DATABASE__ = require('../database/identity.api');

/**
 * 以测试账号的方式进入
 * @param request
 * @param response
 */
function testLogin(request, response) {
    if (request.body.hasOwnProperty('account') && request.body.account
        && request.body.hasOwnProperty('password') && request.body.password) {
        __IDENTITY_DATABASE__.testLogin({
            authenticationDatabase: __MONGO_CONFIG__.PARAMS.DATABASE_NAME_ADMIN,
            user: __MONGO_CONFIG__.PARAMS.USER_ADMIN,
            password: __MONGO_CONFIG__.PARAMS.PASSWORD_ADMIN,
            account: request.body.account,
            pwd: request.body.password
        })
            .then(result => {
                __LOGGER__.debug(result);
                response(result);
            })
            .catch(exception => {
                __LOGGER__.error(exception);
                response(exception.errmsg || exception);
            });
    } else {
        response('非法入侵');
    }
}

/**
 * 注册测试账号
 * @param request
 * @param response
 */
function testRegister(request, response) {
    if (request.body.hasOwnProperty('account') && request.body.account
        && request.body.hasOwnProperty('password') && request.body.password) {
        __IDENTITY_DATABASE__.testRegister({
            authenticationDatabase: __MONGO_CONFIG__.PARAMS.DATABASE_NAME_ADMIN,
            user: __MONGO_CONFIG__.PARAMS.USER_ADMIN,
            password: __MONGO_CONFIG__.PARAMS.PASSWORD_ADMIN,
            account: request.body.account,
            pwd: request.body.password
        })
            .then(result => {
                __LOGGER__.debug(result);
                response(result);
            })
            .catch(exception => {
                __LOGGER__.error(exception);
                response(exception.errmsg || exception);
            });
    } else {
        response('提供非法的注册参数');
    }
}

module.exports = {
    testLogin: testLogin,
    testRegister: testRegister
};