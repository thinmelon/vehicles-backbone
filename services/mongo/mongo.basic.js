const Q = require('q');
const __UTIL__ = require('util');
const __MONGO_CLIENT__ = require('mongodb').MongoClient;
const __MONGO_CONFIG__ = require('./mongo.config');
const __LOGGER__ = require('../log4js.service').getLogger('mongo.basic.js');

/**
 * 连接 MongoDB
 * Use connect method to connect to the server
 * @param request
 * @returns {promise|jQuery.promise|*}
 */
function setupConnection(request) {
    const deferred = Q.defer();
    let url;

    __LOGGER__.debug('====== SETUP CONNECTION ======');
    url = __UTIL__.format('mongodb://%s:%s@%s:%s/%s',
        request.params.user,
        encodeURIComponent(request.params.password),
        __MONGO_CONFIG__.PARAMS.HOST,
        __MONGO_CONFIG__.PARAMS.PORT,
        request.params.authenticationDatabase
    );
    __LOGGER__.debug(url);
    __MONGO_CLIENT__.connect(url, {useNewUrlParser: request.useNewUrlParser || true}, function (err, db) {
        if (err) {
            __LOGGER__.error('Connection Error:' + err);
            deferred.reject(err);
        } else {
            // __LOGGER__.debug(db);
            deferred.resolve({
                mongo: db,
                params: request.params,
                result: request.result
            });
        }
    });

    return deferred.promise;
}

// setupConnection({
//     // params: {
//     //     user: 'root',
//     //     password: 'BigUp#888',
//     //     authenticationDatabase: 'admin'
//     // }
//     params: {
//         user: 'vehicles',
//         password: '741qaz',
//         authenticationDatabase: 'admin'
//     }
// });

/**
 * 关闭连接
 * @param request
 * @returns {promise|jQuery.promise|*}
 */
function close(request) {
    __LOGGER__.debug('====== CLOSE CONNECTION ======');
    request.mongo.close();
    return Q(request);
}

/**
 * 使用数据库
 * @param request
 * @returns {*}
 */
function useDatabase(request) {
    const name = request.params.databaseName;
    __LOGGER__.debug('DATABASE NAME  ===>  ', name);
    request.mongo.db(name);
    return Q(request);
}

/**
 * 创建集合
 * @param request
 * @returns {promise|jQuery.promise|*}
 */
function createCollection(request) {
    const deferred = Q.defer();
    const name = request.params.databaseName;
    const database = request.mongo.db(name);
    database.createCollection(request.params.collectionName, function (err, res) {
        if (err) {
            __LOGGER__.error('Create Collection Error ===> ' + err);
            deferred.reject(err);
        } else {
            __LOGGER__.debug(res);
            deferred.resolve(request);
        }
    });
    return deferred.promise;
}

/**
 *
 *      数据库操作( CURD )
 *
 */

/**
 * 插入一条数据条数据
 * @param request
 */
function insertOne(request) {
    const deferred = Q.defer();
    const name = request.params.databaseName;
    const database = request.mongo.db(name);
    __LOGGER__.debug('====== InsertOne ======');
    database
        .collection(request.params.collectionName)
        .insertOne(request.params.insertOne, function (err, res) {
            if (err) {
                __LOGGER__.error('insertOne Error ===> ' + err);
                deferred.reject(err);
            } else {
                __LOGGER__.debug('insertOne _id ===> ', res.insertedId);
                request.result = {_id: res.insertedId};
                deferred.resolve(request);
            }
        });
    return deferred.promise;
}

/**
 * 插入多条数据
 * @param request
 * @returns {promise|jQuery.promise|*}
 */
function insertMany(request) {
    const deferred = Q.defer();
    const name = request.params.databaseName;
    const database = request.mongo.db(name);
    __LOGGER__.debug('====== InsertMany ======');
    database
        .collection(request.params.collectionName)
        .insertMany(request.params.insertMany, function (err, res) {
            if (err) {
                __LOGGER__.error('insertMany Error ===> ' + err);
                deferred.reject(err);
            } else {
                request.result.insertedCount = res.insertedCount;
                request.result.insertedIds = res.insertedIds;
                deferred.resolve(request);
            }
        });
    return deferred.promise;
}

/**
 * 查询数据
 * 可以返回匹配条件的所有数据
 * 如果未指定条件，find() 返回集合中的所有数据
 * @param request
 * @returns {promise|jQuery.promise|*}
 */
function find(request) {
    const deferred = Q.defer();
    const name = request.params.databaseName;
    const database = request.mongo.db(name);
    __LOGGER__.debug('====== Find ======');
    database
        .collection(request.params.collectionName)
        .find(request.params.find || {}, request.params.findOptions || {})
        .toArray(function (err, res) {
            if (err) {
                __LOGGER__.error('find Error ===> ' + err);
                deferred.reject(err);
            } else {
                // __LOGGER__.debug(res);
                request.result = res;
                deferred.resolve(request);
            }
        });
    return deferred.promise;
}

/**
 * 查询数据
 * @param request
 * @returns {promise|jQuery.promise|*}
 */
function findOne(request) {
    const deferred = Q.defer();
    const name = request.params.databaseName;
    const database = request.mongo.db(name);
    __LOGGER__.debug('====== FindOne ======');
    database
        .collection(request.params.collectionName)
        .findOne(request.params.findOne, request.params.findOneProjection, function (err, res) {
            if (err) {
                __LOGGER__.error('findOne Error ===> ' + err);
                deferred.reject(err);
            } else {
                // __LOGGER__.debug(res);
                request.result = res;
                deferred.resolve(request);
            }
        });

    return deferred.promise;
}

/**
 * 排序 使用 sort() 方法，该方法接受一个参数，规定是升序(1)还是降序(-1)。
 * @param request
 * @returns {promise|jQuery.promise|*}
 */
function sort(request) {
    const deferred = Q.defer();
    const name = request.params.databaseName;
    const database = request.mongo.db(name);
    __LOGGER__.debug('====== Sort ======');
    database
        .collection(request.params.collectionName)
        .find(request.params.find || {})
        .sort(request.params.sort)
        .toArray(function (err, res) {
            if (err) {
                __LOGGER__.error('sort Error ===> ' + err);
                deferred.reject(err);
            } else {
                request.result = res;
                deferred.resolve(request);
            }
        });
    return deferred.promise;
}

/**
 * 查询分页
 * @param request
 * @returns {promise|jQuery.promise|*}
 */
function limit(request) {
    const deferred = Q.defer();
    const name = request.params.databaseName;
    const database = request.mongo.db(name);
    __LOGGER__.debug('====== Limit ======');
    database
        .collection(request.params.collectionName)
        .find(request.params.find || {}, request.params.findOptions || {})
        .sort(request.params.sort || {})
        .skip(parseInt(request.params.skip))
        .limit(parseInt(request.params.limit))
        .toArray(function (err, res) {
            if (err) {
                __LOGGER__.error('limit Error ===> ' + err);
                deferred.reject(err);
            } else {
                request.result = res;
                deferred.resolve(request);
            }
        });
    return deferred.promise;
}

/**
 * 结果集个数
 * @param request
 * @returns {*|promise|C}
 */
function count(request) {
    const deferred = Q.defer();
    const name = request.params.databaseName;
    const database = request.mongo.db(name);
    __LOGGER__.debug('====== Count ======');
    database
        .collection(request.params.collectionName)
        .countDocuments(request.params.count || {}, function (err, res) {
            if (err) {
                __LOGGER__.error('count Error ===> ' + err);
                deferred.reject(err);
            } else {
                request.result = res;
                deferred.resolve(request);
            }
        });
    return deferred.promise;
}

/**
 * 判断是否存在
 * @param request
 * @returns {*|C|promise}
 */
function isExist(request) {
    const deferred = Q.defer();
    const name = request.params.databaseName;
    const database = request.mongo.db(name);
    __LOGGER__.debug('====== isExist ======');
    database
        .collection(request.params.collectionName)
        .countDocuments(request.params.isExist || {}, function (err, res) {
            if (err) {
                __LOGGER__.error('isExist Error ===> ' + err);
                deferred.reject(err);
            } else {
                // __LOGGER__.debug(res);
                request.result = res;
                if (res === 1) {
                    deferred.resolve(request);
                } else {
                    deferred.reject(request);
                }
            }
        });
    return deferred.promise;
}

/**
 * 找出记录并更新
 * db.collection.findOneAndUpdate(
 * <filter>,
 * <update>,
 *    {
          * projection: <document>,
          * sort: <document>,
          * maxTimeMS: <number>,
          * upsert: <boolean>,
          * returnNewDocument: <boolean>,
          * collation: <document>,
          * arrayFilters: [ <filterdocument1>, ... ]
 *    }
 * )
 * @param request
 * @returns {promise|jQuery.promise|*}
 */
function findOneAndUpdate(request) {
    const deferred = Q.defer();
    const name = request.params.databaseName;
    const database = request.mongo.db(name);
    __LOGGER__.debug('====== FindOneAndUpdate ======');
    database
        .collection(request.params.collectionName)
        .findOneAndUpdate(request.params.findOneAndUpdateWhere, request.params.findOneAndUpdate, request.params.findOneAndUpdateOptions, function (err, res) {
            if (err) {
                __LOGGER__.error('findOnaAndUpdate Error ===> ' + err);
                deferred.reject(request);
            } else {
                request.result = res;
                deferred.resolve(request);
            }
        });
    return deferred.promise;
}

/**
 * 更新数据
 * @param request
 * @returns {promise|jQuery.promise|*}
 */
function updateOne(request) {
    const deferred = Q.defer();
    const name = request.params.databaseName;
    const database = request.mongo.db(name);
    __LOGGER__.debug('====== UpdateOne ======');
    database
        .collection(request.params.collectionName)
        .updateOne(request.params.updateOneWhere, request.params.updateOne, function (err, res) {
            if (err) {
                __LOGGER__.error('updateOne Error ===> ' + err);
                deferred.reject(err);
            } else {
                request.result = res.result;
                deferred.resolve(request);
            }
        });
    return deferred.promise;
}

/**
 * 更新多条数据
 * @param request
 * @returns {promise|jQuery.promise|*}
 */
function updateMany(request) {
    const deferred = Q.defer();
    const name = request.params.databaseName;
    const database = request.mongo.db(name);
    __LOGGER__.debug('====== UpdateMany ======');
    database
        .collection(request.params.collectionName)
        .updateMany(request.params.updateManyWhere, request.params.updateMany, function (err, res) {
            if (err) {
                __LOGGER__.error('updateMany Error ===> ' + err);
                deferred.reject(err);
            } else {
                request.result = res.result;
                deferred.resolve(request);
            }
        });
    return deferred.promise;
}

/**
 * 删除一条数据
 * @param request
 * @returns {promise|jQuery.promise|*}
 */
function deleteOne(request) {
    const deferred = Q.defer();
    const name = request.params.databaseName;
    const database = request.mongo.db(name);
    __LOGGER__.debug('====== DeleteOne ======');
    database
        .collection(request.params.collectionName)
        .deleteOne(request.params.deleteOne, function (err, res) {
            if (err) {
                __LOGGER__.error('deleteOne Error ===> ' + err);
                deferred.reject(err);
            } else {
                request.result = res.result;
                deferred.resolve(request);
            }
        });
    return deferred.promise;
}

/**
 * 删除多条数据
 * @param request
 * @returns {promise|jQuery.promise|*}
 */
function deleteMany(request) {
    const deferred = Q.defer();
    const name = request.params.databaseName;
    const database = request.mongo.db(name);
    __LOGGER__.debug('====== DeleteMany ======');
    database
        .collection(request.params.collectionName)
        .deleteMany(request.params.deleteMany, function (err, res) {
            if (err) {
                __LOGGER__.error('deleteMany Error ===> ' + err);
                deferred.reject(err);
            } else {
                request.result = res.result;
                deferred.resolve(request);
            }
        });
    return deferred.promise;
}

/**
 * 删除集合
 * @param request
 * @returns {promise|jQuery.promise|*}
 */
function drop(request) {
    const deferred = Q.defer();
    const name = request.params.databaseName;
    const database = request.mongo.db(name);
    __LOGGER__.debug('====== Drop ======');
    database
        .collection(request.params.collectionName)
        .drop(function (err, res) {
            if (err) {
                __LOGGER__.error('drop Error ===> ' + err);
                deferred.reject(err);
            } else {
                request.result = res.result;
                deferred.resolve(request);
            }
        });
    return deferred.promise;
}

/**
 *  启动批量查询
 *          -   不分执行完成的先后次序
 * @param request
 * @returns {*|C|promise}
 */
// function allInOne(request) {
//     let i, length, tasks = [], deferred = Q.defer();
//     //  将查询语句放入执行队列
//     //  由于Q.all异步启动所有任务，在放入队列前，要确认执行的语句及其参数
//     for (i = 0, length = request.params.allInOneSeeds.length; i < length; i++) {
//         tasks.push(request.params.allInOneSeeds[i](request));
//         for (const key in request.params.allInOneParams[i]) {
//             if (request.params.allInOneParams[i].hasOwnProperty(key)) {
//                 console.log("KEY: ", key)
//                 console.log("VALUE: ", request.params.allInOneParams[i][key])
//                 request.params[key] = request.params.allInOneParams[i][key];
//             }
//         }
//     }
//     console.log(request.params);
//
//     Q.all(tasks)
//     // 所有任务执行结束后，对返回结果进行修饰
//         .then(function (rawData) {
//             let j, result = {};
//             // 为按顺序返回的各个结果集添加标签
//             for (j = 0; j < rawData.length; j++) {
//                 console.log(rawData[j].result)
//             }
//             request.result = result;
//             deferred.resolve(request);
//         })
//         .catch(function (exception) {
//             __LOGGER__.error(exception);
//             deferred.reject({
//                 connection: request.connection,
//                 params: request.params,
//                 errMsg: exception
//             });
//         });
//
//     return deferred.promise;
// }

/**
 * 按任务队列顺序逐个执行
 * @param request
 * @returns {*}
 */
function oneByOne(request) {
    let i,
        promise,
        length,
        tasks = [];

    for (i = 0, length = request.params.oneByOneSeeds.length; i < length; i++) {
        tasks.push(request.params.oneByOneSeeds[i]);                  //  放进执行列表
    }

    promise = Q(request);   //  初始化

    for (i = 0, length = tasks.length; i < length; i++) {
        promise = promise.then(res => {
            "use strict";
            let index = res.params.oneByOneIndex++;                 //  任务队列索引值加一
            __LOGGER__.info('初始化第 [', index + 1, '] 个任务');
            for (const key in res.params.oneByOneParams[index]) {
                if (res.params.oneByOneParams[index].hasOwnProperty(key)) {
                    __LOGGER__.debug("KEY: ", key);
                    __LOGGER__.debug("VALUE: ", res.params.oneByOneParams[index][key]);
                    res.params[key] = res.params.oneByOneParams[index][key];
                }
            }
            return Q(res);
        }).then(tasks[i]);
    }

    return promise;
}

module.exports = {
    setupConnection: setupConnection,
    close: close,
    useDatabase: useDatabase,
    createCollection: createCollection,
    insertOne: insertOne,
    insertMany: insertMany,
    find: find,
    findOne: findOne,
    sort: sort,
    limit: limit,
    count: count,
    isExist: isExist,
    findOneAndUpdate: findOneAndUpdate,
    updateOne: updateOne,
    updateMany: updateMany,
    deleteOne: deleteOne,
    deleteMany: deleteMany,
    drop: drop,
    oneByOne: oneByOne
};

// setupConnection({
//     params: {
//         authenticationDatabase: 'admin',
//         user: 'butler',
//         password: 'BigUp@2019',
//         databaseName: 'identity',
//         collectionName: 'user',
//         find: {"session": 'eqhqq3NJoQe7ZgyEsz4z6zDKM7UXwChh'}
//     },
//     result: {}
// })
//     .then(find)
//     .then(close)
//     .then(res => {
//         "use strict";
//         console.log(res)
//     })
//     .catch(err => {
//         "use strict";
//         throw err;
//     });

// setupConnection({
//     params: {
//         authenticationDatabase: 'admin',
//         user: 'butler',
//         password: 'BigUp@2019',
//         databaseName: 'identity',
//         collectionName: 'user',
//         findOneAndUpdateWhere: {"mobile": '18159393355'},
//         findOneAndUpdate: {
//             $set: {
//                 "wechat": {
//                     appid: 'wxf0e807f315d28d5b',
//                     openid: 'ofGnF0_OMOIwp64nLoX2QYISId8M',
//                     nickname: '李云鹏',
//                     sex: 1,
//                     headimgurl: 'http://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83eohoiasD9v5My23otyGMM4IvsuxIvX5Ooa2HIdKIcicFzTGqTfaldwOv4icdrLTmpVJlX16sALuZSSIw/132',
//                     country: 'AU',
//                     province: 'Queensland',
//                     city: 'Gold Coast',
//                     unionid: 'owi_Y0cwiVxbOajv8bXJwitnxg-s'
//                 }
//             }
//         },
//         findOneAndUpdateOptions: {upsert: false}
//     },
//     result: {}
// })
//     .then(findOneAndUpdate)
//     .then(close)
//     .then(res => {
//         "use strict";
//         console.log(res)
//     })
//     .catch(err => {
//         "use strict";
//         throw err;
//     });

// const __OBJECT_ID__ = require('mongodb').ObjectID;
//
// setupConnection({
//     params: {
//         authenticationDatabase: 'admin',
//         user: 'butler',
//         password: 'BigUp@2019',
//         databaseName: 'identity',
//         collectionName: 'authorizer',
//         insertOne: {
//             _id: 'wx54710fd1373c1ce8',
//             accessToken: '13_RAWbbpt4ngevUOKYFQB9WNos1tsl2ssaLUxlHidvwhYgJdrkKG_1aR_Y0LnADJ6px7djuo2fpTvzEfafnRYL-jdTeywLD9lMdmC-Gy4Q0coIy22p6ZdJh7zSQo3m59LNyLFzyWdnrd_kurT0DEOhALDIJT',
//             expiresIn: '2018-09-05 12:52:03',
//             refreshToken: 'refreshtoken@@@29HcmTLIMIqfqXxCbu7Hv97-ju9mLf157eoMXjHnsJ4',
//             funcInfo: [17, 18, 25, 30, 31, 36, 37, 40],
//             type: 1,
//             userGroup: [__OBJECT_ID__('5bd96ae8156dc5e7eaf308f1')]
//         }
//     },
//     result: {}
// })
//     .then(insertOne)
//     .then(close)
//     .then(res => {
//         "use strict";
//         console.log(res)
//     })
//     .catch(err => {
//         "use strict";
//         throw err;
//     });