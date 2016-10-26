module.exports = {
    topic: (topic) => `${process.env.NODE_ENV}:topic:subscriptions::${topic}`
};
