const express = require('express');
const router = express.Router();
const __LOGGER__ = require('../services/log4js.service').getLogger('vehicles.route.js');
/**
 *  CONTROLLER
 */
const __CONTROLLER_VEHICLES__ = require('../controller/vehicles.controller');

router.post('/record', function (req, res, next) {
    __LOGGER__.info('========================== RECORD ACTION ==========================');
    __LOGGER__.info(req.body);
    __CONTROLLER_VEHICLES__.recordAction(req, function (request) {
        res.json(request);
        __LOGGER__.info('========================== END ==========================');
    });
});

router.get('/record', function (req, res, next) {
    __LOGGER__.info('========================== QUERY RECORD ==========================');
    __LOGGER__.info(req.query);
    __LOGGER__.info(req.params);
    __CONTROLLER_VEHICLES__.queryRecord(req, function (request) {
        res.json(request);
        __LOGGER__.info('========================== END ==========================');
    });
});

router.get('/status', function (req, res, next) {
    __LOGGER__.info('========================== GET VEHICLE STATUS ==========================');
    __LOGGER__.info(req.query);
    __LOGGER__.info(req.params);
    __CONTROLLER_VEHICLES__.getVehicleStatus(req, function (request) {
        res.json(request);
        __LOGGER__.info('========================== END ==========================');
    });
});

module.exports = router;
