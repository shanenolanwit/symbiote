const commonHandler = require('./commonHandler')

module.exports.handler = async event => {
    const payload = JSON.parse(event.body)
    const respBody = await commonHandler(payload);
    return { "statusCode": 200, "body": JSON.stringify(respBody, null, 2) }
}