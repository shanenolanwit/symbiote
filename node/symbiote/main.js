const commonHandler = require('./commonHandler')

module.exports.handler = async event => {
    const payload = JSON.parse(event.body)
    const respBody = await commonHandler(payload);
    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body: JSON.stringify(respBody, null, 2) 
    };
    return response;
}