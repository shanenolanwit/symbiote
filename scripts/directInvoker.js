require('dotenv').config();
const commonHandler = require('../node/symbiote/commonHandler');

const lambdaUrl = "https://tyz83asrz8.execute-api.eu-west-1.amazonaws.com/test/helloworld"

const post = async (endpoint, payload) => {
  const url = new URL(endpoint);
  const { host } = url;
  const path = url.pathname

  const opts = {
    host,
    path,
    uri: url.href,
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const res = await fetch(url.href, opts);
  const { status } = res;
  if(status > 200){
      console.log('fail')
  }
  const json = await res.text();

  return json;
};

const invoke = async (event) => {
    try {
        const payload = event.body;
        const respBody = await commonHandler(payload);
        return { "statusCode": 200, "body": JSON.stringify(respBody, null, 2) }
    } catch(e){
        console.log(e);
        return { "statusCode": 500, "body": JSON.stringify(respBody, null, 2) }
    }  
}

const event = {
    body: {
        provider: 'aws',
        service: 'db',
        action: 'read',
        transactionID: 'hello'
    } 
}

async function start(){

    for(let i=0; i < 800; i++){
        const start = Date.now()
        const body = {
            name: 'Shane'
        } 
        const r = await post(lambdaUrl, body);
        // console.log(r);
        const time = Date.now() - start;
        console.log(time)
    }
    
}

start()