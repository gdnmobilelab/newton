var namespaces = require('../util/namespaces');

module.exports = function(req, res, next) {
    var SNSNotificationRequest = req.get('x-amz-sns-message-type');

    if (!SNSNotificationRequest) {
        return next();
    }

    if (SNSNotificationRequest === 'SubscriptionConfirmation') {
        var SubscriptionConfirmationMessage = JSON.parse(req.body);
        console.log(req.body);
        return res.send({
            subscription: true
        });
    }

    if (SNSNotificationRequest === 'Notification') {
        var NotificationMessage = JSON.parse(req.body);
        console.log(`topic: ${NotificationMessage.TopicArn.split(":")[5].split('__')[1]}`);
        req.body = {
            topic: NotificationMessage.TopicArn.split(":")[5].split('__')[1],
            notification: JSON.parse(NotificationMessage.Message).payload[0].options
        };

        return next();
    }

    return next();
};