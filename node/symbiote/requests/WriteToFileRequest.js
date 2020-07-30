const assert = require('assert');

const getRandomMessage = () => {
    const min = 1000;
    const max = 9999;
    const i = Math.floor(Math.random() * (max - min + 1)) + min;
    const t = Date.now();
    const message = `generated random id ${i} at ${t}`;
    return message;
}

module.exports = class WriteToFileRequest {
  constructor(event) {
    const {
      timestamp, message, strategy, transactionID
    } = event;
    this.strategy = strategy
    this.transactionID = transactionID;
    this.key = event.key || `${event.transactionID}.json`;
    this.timestamp = timestamp || Date.now();
    this.message = message || getRandomMessage();
    this.duplicate = true;
  }

  getKey() {
    return this.key;
  }

  setDuplicate(b){
    this.duplicate = b;
  }

  getPayload() {
    return {
      Strategy: this.strategy,
      TransactionID: this.transactionID,
      Timestamp: this.timestamp,
      Message: this.message,
      BucketName: this.bucketName,
      Key: this.key
    };
  }
};
