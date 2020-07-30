const assert = require('assert');

class Aws {
    constructor(deps) {
        const { dynamo, s3 } = deps;
        this.dynamo = dynamo;
        this.s3 = s3;
    }

    getService(s) {
        const service = s.toLowerCase();
        if (service === 'db') {
            return this.dynamo;
        } else if (service === 'io') {
            return this.s3;
        }
    }
}

class Azure {
    constructor(deps) {
        const { cosmos, storage } = deps;
        this.cosmos = cosmos;
        this.storage = storage;
    }

    getService(s) {
        const service = s.toLowerCase();
        if (service === 'db') {
            return this.cosmos;
        } else if (service === 'io') {
            return this.storage;
        }
    }
}

module.exports = class Switchboard {
    constructor(event, deps) {
        const { provider, service } = event;
        assert(provider, 'provider is required');
        assert(service, 'service is required');
        if (provider.toLowerCase() === 'aws') {
            this.primaryProvider = new Aws(deps);
            this.secondaryProvider = new Azure(deps);
        } else {
            this.primaryProvider = new Azure(deps);
            this.secondaryProvider = new Aws(deps);
        }
        this.primaryService = this.primaryProvider.getService(service);
        this.secondaryService = this.secondaryProvider.getService(service);
    }

    getPrimaryService() {
        return this.primaryService;
    }

    getSecondaryService() {
        return this.secondaryService;
    }
};
