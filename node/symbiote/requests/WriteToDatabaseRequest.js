const assert = require('assert');
const DEFAULT_MESSAGE = 'na';
const DEFAULT_STRATEGY = 'default';

module.exports = class WriteToDatabaseRequest {
  constructor(event) {
    this.transactionID = event.transactionID;
    this.strategy = event.strategy || DEFAULT_STRATEGY
    this.timestamp = event.timestamp || Date.now();
    this.message = event.message || DEFAULT_MESSAGE;
    this.duplicate = event.duplicate || true
  }

  getDuplicate(){
    return this.duplicate;
  }

  setDuplicate(b){
    this.duplicate = b;
  }

  getPayload() {
    return {
      Strategy: this.strategy,
      TransactionID: this.transactionID,
      Timestamp: this.timestamp,
      Message: this.message
    };
  }
};
