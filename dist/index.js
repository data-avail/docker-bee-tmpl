/// <reference path="../typings/tsd.d.ts" />
var pubSub = require("da-helpers").pubSub;
var logger = require("da-helpers").logger;
var tn = require("trader-net");
var rabbitUrl = process.env.RABBITMQ_PORT_5672_TCP_ADDR ? "amqp://#{process.env.RABBITMQ_PORT_5672_TCP_ADDR}:#{process.env.RABBITMQ_PORT_5672_TCP_PORT}" : process.env.RABBITMQ_URI;
var rabbitQueue = process.env.RABBITMQ_QUEUE;
var mongoUrl = process.env.MONGO_PORT_27017_TCP_ADDR ? "mongodb://#{process.env.MONGO_PORT_27017_TCP_ADDR}:#{process.env.MONGO_PORT_27017_TCP_PORT}" : process.env.MONGO_LOG_URI;
var tnUrl = process.env.TRADERNET_URL;
var tnAuth = {
    apiKey: process.env.TRADERNET_API_KEY,
    securityKey: process.env.TRADERNET_SEC_KEY
};
var subHub = new pubSub.PubSubRabbit();
var traderNet = new tn.TraderNet(tnUrl);
var log = new logger.LoggerCompose({ pack: require("../package.json"), tags: ["trader"] }, {
    loggly: { token: process.env.LOGGLY_KEY, subdomain: process.env.LOGGLY_SUBDOMAIN },
    mongo: { connection: mongoUrl, collection: process.env.MONGO_LOG_COLLECTION },
    console: true
});
log.write({ oper: "app_start", status: "success" });
function onExit(res) {
    log.write({ oper: "app_stop", status: "success", res: res });
    subHub.close();
}
function onHandle(cmd) {
    if (cmd.extit)
        onExit(cmd);
    log.write({ oper: "on_handle", status: "success", cmd: cmd });
}
traderNet.connect(tnAuth).then(function () {
    log.write({ oper: "trader_connected", status: "success", url: tnUrl });
}, function (err) {
    log.write({ oper: "trader_connected", status: "error", error: err, url: tnUrl });
}).then(function () {
    subHub.connect({
        uri: rabbitUrl,
        queue: rabbitQueue,
        type: pubSub.PubSubTypes.sub,
        onSub: onHandle
    });
}).then(function () {
    log.write({ oper: "amqp_connected", status: "success", queue: rabbitQueue });
}, function (err) {
    log.write({ oper: "amqp_connected", status: "error", error: err, queue: rabbitQueue });
});
