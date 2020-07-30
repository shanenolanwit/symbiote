const assert = require('assert');

module.exports = class ReadFromFileRequest {
  constructor(event) {
    this.bucketName = event.bucketName;
    this.key = event.key || `${event.transactionID}.json`
    this.timestamp = event.timestamp || Date.now();
  }

  getBucketName() {
    return this.bucketName;
  }

  getKey() {
    return this.key;
  }
};
