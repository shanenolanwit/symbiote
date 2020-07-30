const assert = require('assert');

const DEFAULT_ENCRYPTION_METHOD = 'AES256';
const DEFAULT_STORAGE_CLASS = 'STANDARD_IA';

module.exports = class S3 {
  constructor({ logger, env, s3Lib }) {
    assert(logger, 'logger is required');
    assert(env, 'env is required');
    assert(s3Lib, 's3Lib is required');
    this.logger = logger;
    this.env = env;
    this.s3Lib = s3Lib;
    this.bucketName = env.S3_BUCKET_NAME;
  }

  async write(writeToFileRequest) {
    const params = {
      Body: JSON.stringify(writeToFileRequest.getPayload(), null, 2),
      Bucket: this.bucketName,
      Key: writeToFileRequest.getKey(),
      ServerSideEncryption: DEFAULT_ENCRYPTION_METHOD,
      StorageClass: DEFAULT_STORAGE_CLASS
    };
    return this.s3Lib.putObject(params).promise();
  }

  async read(readFromFileRequest) {
    const params = {
      Bucket: this.bucketName,
      Key: readFromFileRequest.getKey()
    };
    try{
        const obj = await this.s3Lib.getObject(params).promise();
        return obj.Body.toString('utf-8');
    }catch(e){
        console.log('not found in aws');
        return null;
    }
    
  }
};
