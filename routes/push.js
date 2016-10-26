var express = require('express');
var router = express.Router();
var CONFIG = require('../config');
var namespaces = require('../util/namespaces');
var apn = require('apn');
var redis = require('promise-redis')(),
    redisClient = redis.createClient({
        host: CONFIG.REDIS_HOST,
        port: CONFIG.REDIS_PORT
    });

var options = {
    token: {
        key: CONFIG.APNS_KEY_PATH,
        keyId: CONFIG.APNS_KEY_ID,
        teamId: CONFIG.APNS_TEAM_ID
    },
    production: false
};

var apnProvider = new apn.Provider(options);

router.post('/notify', function(req, res, next) {
    console.log(`Message from push endpoint: ${JSON.stringify(req.body)}`);
    var body = req.body,
        namespacedTopic = namespaces.topic(body.topic),
        note = new apn.Notification();

    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.title = body.notification.title;
    note.body = body.notification.options.body;
    note.topic = 'com.guardianmobilelab.GDNMobileLab';
    note.collapseId = body.notification.options.tag;
    note.category = 'gdnRichNotification';
    note.mutableContent = 1;
    note.payload = { data: {
        'image-url': body.notification.options.icon
    } };

    console.log(`Sending to topic: ${namespacedTopic}`);
    redisClient.zrangebyscore(namespacedTopic, '-inf', '+inf')
        .then((results) => {
            console.log(`Sending to total devices: ${results.length}`);
            Promise.all(results.map((deviceString) => {
                var device = JSON.parse(deviceString);
                return apnProvider.send(note, device.deviceToken)
            })).then((results) => {
                console.log(results);
            })
        });

    res.send({success: true});
});

module.exports = router;
