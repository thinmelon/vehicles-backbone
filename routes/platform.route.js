const express = require('express');
const router = express.Router();
const __LOGGER__ = require('../services/log4js.service').getLogger('platform.route.js');
/**
 *  CONTROLLER
 */
const __CONTROLLER_USER__ = require('../controller/user.controller');

/**
 *  测试账号登录
 */
router.post('/dev/login', function (req, res, next) {
    __LOGGER__.info('========================== TEST LOGIN ==========================');
    __LOGGER__.info(req.body);
    __CONTROLLER_USER__.testLogin(req, function (request) {
        res.json(request);
        __LOGGER__.info('========================== END ==========================');
    });
});

/**
 *  测试账号注册
 */
router.post('/dev/register', function (req, res, next) {
    __LOGGER__.info('========================== TEST REGISTER ==========================');
    __LOGGER__.info(req.body);
    __CONTROLLER_USER__.testRegister(req, function (request) {
        res.json(request);
        __LOGGER__.info('========================== END ==========================');
    });
});

module.exports = router;