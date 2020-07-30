const assert = require('assert');

module.exports = class Dynamo {
  constructor({ logger, env, dynamoLib }) {
    assert(logger, 'logger is required');
    assert(env, 'env is required');
    assert(dynamoLib, 'dynamoLib is required');
    this.logger = logger;
    this.env = env;
    this.dynamoLib = dynamoLib;
    this.table = env.DYNAMO_TABLE_NAME;
  }

  async write(writeToDatabaseRequest) {
    const params = {
      TransactItems: [{
        Put: {
          TableName: this.table,
          Item: writeToDatabaseRequest.getPayload()
        }
      }]
    };
    console.log(JSON.stringify(params))
    return this.dynamoLib.transactWrite(params).promise();
  }

  async read(readFromDatabaseRequest) {
    const params = {
      TableName: this.table,
      Key: {
        TransactionID: readFromDatabaseRequest.getTransactionID()
      }
    };
    const tx = await this.dynamoLib.get(params).promise();
    return tx.Item;
  }
};
