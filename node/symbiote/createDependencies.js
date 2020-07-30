const AWS = require('aws-sdk');

const { AbortController } = require('@azure/abort-controller');
const { CosmosClient } = require('@azure/cosmos');
const {
  BlobServiceClient, StorageSharedKeyCredential
} = require('@azure/storage-blob');


const Cosmos = require('./azure/Cosmos');
const Storage = require('./azure/Storage');
const Dynamo = require('./aws/Dynamo');
const S3 = require('./aws/S3');

const ONE_MINUTE = 60 * 1000;

module.exports = (logger, env) => {
  logger.setDefaultLevel(env.LOG_LEVEL);
  logger.debug('building dependencies');
  logger.debug(env);

  const dynamoLib = new AWS.DynamoDB.DocumentClient({ 
      apiVersion: '2015-03-31', 
      region: env.DEFAULT_REGION_AWS ,
      accessKeyId: env.ACCESS_KEY_ID_AWS, 
      secretAccessKey: env.SECRET_ACCESS_KEY_AWS
    });

  const s3Lib = new AWS.S3({ 
      apiVersion: '2015-03-31', 
      region: env.DEFAULT_REGION_AWS ,
      accessKeyId: env.ACCESS_KEY_ID_AWS, 
      secretAccessKey: env.SECRET_ACCESS_KEY_AWS
    }); 

  const dynamo = new Dynamo({ logger, env, dynamoLib });
  const s3 = new S3({ logger, env, s3Lib });

  const cosmosLib = new CosmosClient(env.COSMOSDB_CONNECTION_STRING);


  const storageLib = BlobServiceClient.fromConnectionString(env.STORAGE_CONNECTION_STRING);

  const timeoutFunction = AbortController.timeout(ONE_MINUTE);
  const cosmos = new Cosmos({ logger, env, cosmosLib });
  const storage = new Storage({
    logger, env, storageLib, timeoutFunction
  });

  return {
    logger,
    cosmos,
    dynamo,
    s3,
    storage,
    env
  };
};
