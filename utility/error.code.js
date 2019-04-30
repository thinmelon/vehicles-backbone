module.exports = {
    /**
     * 成功
     */
    success: 0,
    /**
     * 执行任务失败
     */
    failed: -100,
    badParameter: -101,
    /**
     * 数据库连接失败
     */
    databaseConnectError: -200,
    /**
     * 短信校验失败
     */
    smsCheckError: -300,
    smsTimeoutError: -301,
    /**
     * 查询结果不存在
     */
    notFoundError: -400,
    /**
     * 重复提交
     */
    resubmitError: -500,
    /**
     * 出现未知错误
     */
    unknownError: -600
};
