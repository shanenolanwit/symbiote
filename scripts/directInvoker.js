require('dotenv').config();
const commonHandler = require('./commonHandler');


const start = async(event) => {
    try {
        const payload = event.body;
        const respBody = await commonHandler(payload);
        return { "statusCode": 200, "body": JSON.stringify(respBody, null, 2) }
    } catch(e){
        console.log(e);
        return { "statusCode": 200, "body": JSON.stringify(respBody, null, 2) }
    }  
}