require('dotenv').config();
const logger = require('loglevel');
const shortid = require('shortid');
const fetch = require('node-fetch');
const fs = require('fs');

logger.setLevel('info')

const buildPayloadForDbWrite = (count, provider, strategy, duplicate) => {
    const txMessage = shortid.generate();
    const event = {
        provider,
        service: 'db',
        action: 'write',
        transactionID: `tx_${count}`,
        strategy,
        timestamp: Date.now(),
        message: `message ${txMessage}`,
        duplicate
    }
    return event;
}

const buildPayloadForDbRead = (count, provider) => {
    const event = {
        provider,
        service: 'db',
        action: 'read',
        transactionID: `tx_${count}`
    }
    return event;
}

const buildPayloadForIOWrite = (count, provider, strategy, duplicate) => {
    const txMessage = shortid.generate();
    const event = {
        provider,
        service: 'io',
        action: 'write',
        transactionID: `tx_${count}`,
        strategy,
        timestamp: Date.now(),
        message: `message ${txMessage}`,
        duplicate
    }
    return event;
}

const buildPayloadForIORead = (count, provider) => {
    const event = {
        provider,
        service: 'io',
        action: 'read',
        transactionID: `tx_${count}`
    }
    return event;
}

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
    const json = await res.json();
    json.status = status;
  
    return json;
  };

// async function start(){
//     // const endpoint = process.env.LAMBDA_ENDPOINT;
//     const endpoint = process.env.FUNCTION_ENDPOINT;
    
//     for(let i = 1; i < 801; i++){
//         const provider = 'aws';
//         const strategy = 'azure_cosmos_writes';
//         const dr = true;
//         const payload = buildPayloadForDbWrite(i, provider, strategy, dr);
//         const startTime = Date.now();
//         const fileName = `results/${strategy}.csv`;
//         let endTime = 0;
//         try{
//             const res = await post(endpoint, payload);
//             endTime = Date.now();
//             const csv = `${provider},${strategy},${dr},${res.status},${startTime},${endTime},${endTime-startTime}\n`
//             fs.appendFileSync(fileName, csv);
//         } catch(e) {
//             logger.error(e)
//             endTime = Date.now();
//             const status = 500;
//             const csv = `${provider},${strategy},${dr},${status},${startTime},${endTime},${endTime-startTime}\n`
//             const fileName = `results/${strategy}.csv`;
//             fs.appendFileSync(fileName, csv);
//         }
//         if(i % 50 == 0){
//             logger.info(`iteration ${i}`)
//             logger.info(`${endTime}-${startTime}=${endTime-startTime}`)
//         }
        
//     }
   
//     logger.info('done')
// }

// async function start(){
//     const endpoint = process.env.LAMBDA_ENDPOINT;
//     // const endpoint = process.env.FUNCTION_ENDPOINT;
    
//     for(let i = 771; i < 801; i++){
//         const provider = 'aws';
//         const strategy = 'aws_cosmos_reads';
//         const dr = false;
//         const payload = buildPayloadForDbRead(i, provider);
//         const startTime = Date.now();
//         const fileName = `results/${strategy}.csv`;
//         let endTime = 0;
//         try{
//             const res = await post(endpoint, payload);
//             endTime = Date.now();
//             const csv = `${provider},${strategy},${dr},${res.status},${startTime},${endTime},${endTime-startTime}\n`
//             fs.appendFileSync(fileName, csv);
//         } catch(e) {
//             logger.error(e)
//             endTime = Date.now();
//             const status = 500;
//             const csv = `${provider},${strategy},${dr},${status},${startTime},${endTime},${endTime-startTime}\n`
//             const fileName = `results/${strategy}.csv`;
//             fs.appendFileSync(fileName, csv);
//         }
//         if(i % 50 == 0){
//             logger.info(`iteration ${i}`)
//             logger.info(`${endTime}-${startTime}=${endTime-startTime}`)
//         }
        
//     }
   
//     logger.info('done')
// }

// async function start(){
//     const endpoint = process.env.FUNCTION_ENDPOINT;
    
//     for(let i = 1; i < 801; i++){
//         const provider = 'azure';
//         const strategy = 'azure_storage_reads';
//         const dr = false;
//         const payload = buildPayloadForIORead(i, provider, strategy, dr);
//         const startTime = Date.now();
//         const fileName = `results/${strategy}.csv`;
//         let endTime = 0;
//         try{
//             const res = await post(endpoint, payload);
//             endTime = Date.now();
//             const csv = `${provider},${strategy},${dr},${res.status},${startTime},${endTime},${endTime-startTime}\n`
//             fs.appendFileSync(fileName, csv);
//         } catch(e) {
//             logger.error(e)
//             endTime = Date.now();
//             const status = 500;
//             const csv = `${provider},${strategy},${dr},${status},${startTime},${endTime},${endTime-startTime}\n`
//             const fileName = `results/${strategy}.csv`;
//             fs.appendFileSync(fileName, csv);
//         }
//         if(i % 50 == 0){
//             logger.info(`iteration ${i}`)
//             logger.info(`${endTime}-${startTime}=${endTime-startTime}`)
//         }
        
//     }
   
//     logger.info('done')
// }

start();