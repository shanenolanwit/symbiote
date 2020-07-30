const assert = require('assert');

module.exports = class ReadFromDatabaseRequest {
  constructor(event) {
   this.transactionID = event.transactionID;
  }

  getTransactionID() {
    return this.transactionID;
  }
};
