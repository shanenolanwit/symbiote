
const assert = require('assert');

const queryLib = {
  TRANSACTION_BY_ID: 'SELECT * FROM c where c.TransactionID = @TransactionID'
};

module.exports = class Cosmos {
  constructor({
    logger, env, cosmosLib
  }) {
    assert(logger, 'logger is required');
    assert(env, 'env is required');
    assert(cosmosLib, 'cosmosLib is required');
    this.logger = logger;
    this.env = env;
    this.cosmosLib = cosmosLib;
    this.database = env.COSMOS_DATABASE;
    this.table = env.COSMOS_TABLE_NAME;
  }

  async write(writeToDatabaseRequest) {
    return this.cosmosLib
      .database(this.database)
      .container(this.table)
      .items.upsert(writeToDatabaseRequest.getPayload());
  }

  async read(readFromDatabaseRequest) {
    const querySpec = {
      query: queryLib.TRANSACTION_BY_ID,
      parameters: [
        {
          name: '@TransactionID',
          value: readFromDatabaseRequest.getTransactionID()
        }
      ]
    };

    const tx = await this.cosmosLib
      .database(this.database)
      .container(this.table)
      .items.query(querySpec)
      .fetchAll();
    let record = null;
    if (tx.resources && tx.resources.length > 0) {
      record = tx.resources[0];
    }
    return record;
  }
};

