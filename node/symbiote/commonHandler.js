const logger = require('loglevel');
const createDependencies = require('./createDependencies');

const WriteToDatabaseRequest = require('./requests/WriteToDatabaseRequest');
const WriteToFileRequest = require('./requests/WriteToFileRequest');
const ReadFromDatabaseRequest = require('./requests/ReadFromDatabaseRequest');
const ReadFromFileRequest = require('./requests/ReadFromFileRequest');

const Switchboard = require('./common/Switchboard')

module.exports = async ( event ) => {
    const env = process.env;
    const deps = createDependencies(logger, env);
    const switchboard = new Switchboard(event, deps);
    const response = { messages: [] }
    if (event.service === 'db') {
        if (event.action === 'write') {
            const writeToDatabaseRequest = new WriteToDatabaseRequest(event)
            const azTx = await switchboard.getPrimaryService().write(writeToDatabaseRequest);
            logger.debug(azTx);
            if (event.duplicate && String(event.duplicate) === 'true') {
                writeToDatabaseRequest.setDuplicate(false);
                const awsTx = await switchboard.getSecondaryService().write(writeToDatabaseRequest);
                logger.debug(awsTx);
            }
            response.action = 'db_write';
        } else if (event.action === 'read') {
            const readFromDatabaseRequest = new ReadFromDatabaseRequest(event)
            let tx;
            try{
                tx = await switchboard.getPrimaryService().read(readFromDatabaseRequest);
            } catch(e){
                logger.error(e)
            }
           
            let record;
            if (tx) {
                record = tx
            } else {
                record = await switchboard.getSecondaryService().read(readFromDatabaseRequest);
            }
            response.action = 'db_read';
            response.record = record
        } else {
            logger.error('unknown action')
        }
    } else if(event.service === 'io'){
        if (event.action === 'write') {
            const writeToFileRequest = new WriteToFileRequest(event)
            const azTx = await switchboard.getPrimaryService().write(writeToFileRequest);
            logger.debug(azTx);
            if (event.duplicate && String(event.duplicate) === 'true') {
                writeToFileRequest.setDuplicate(false);
                const awsTx = await switchboard.getSecondaryService().write(writeToFileRequest);
                logger.debug(awsTx)
            }
            response.action = 'io_write';
        } else if (event.action === 'read') {
            const readFromFileRequest = new ReadFromFileRequest(event)
            let tx = await switchboard.getPrimaryService().read(readFromFileRequest);
            let record;
            if (tx) {
                record = tx
            } else {
                record = await switchboard.getSecondaryService().read(readFromFileRequest);
            }
            response.record = record;
            response.action = 'io_read';
        } else {
            logger.error('unknown action')
        }
    } else if(event.service === 'fn'){ 
        // used for simple performance tests
        response.record = `you executed a function on ${event.provider}`;
        response.action = 'fn_execute';
    } else {
        logger.error('unknown service')
    }
    console.log(response);
    return response;
}

