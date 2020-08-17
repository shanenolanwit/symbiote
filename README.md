# symbiote

> Noun. an organism in a partnership with another such that each profits from their being together.

#### Write to AWS Dynamo and Azure Cosmos
```json
{
        "provider": "aws",
        "service": "db",
        "action": "write",
        "transactionID": "0qtpcsn00ShmhwFMb6gUQ",
        "strategy": "default_increased_memory",   //optional
        "timestamp": 1597603247045, //optional
        "message": "hello world",
        "duplicate": "true"      //optional
}
```
#### Read from Azure Storage
```json
{
        "provider": "azure",
        "service": "io",
        "action": "read",
        "timestamp": 1597603247045, //optional
        "transactionID": "jhjbKA6s4UKZZGSJDZ0_EA",
}
```








"provider": "aws",
"service": "db",
"action": "write",
"transactionID": "plez",
"strategy": "something",
"timestamp": 12425,
"message": "hello world",
"duplicate": "true"


"provider": "aws",
        "service": "db",
        "action": "read",
        "transactionID": "world"

        //     // writeToDatabaseRequest
//     // const event = {
//     //     provider: 'aws',
//     //     service: 'db',
//     //     action: 'write',
//     //     transactionID: 'hello',
//     //     strategy: 'something',
//     //     timestamp: 12425,
//     //     message: 'hello world',
//     //     duplicate: 'true'
//     // }

//     // readFromDatabaseRequest
//     // const event = {
//     //     provider: 'azure',
//     //     service: 'db',
//     //     action: 'read',
//     //     transactionID: 'shane'
//     // }
    
    
//     // writeToFileRequest
//     // const event = {
//     //     provider: 'azure',
//     //     service: 'io',
//     //     action: 'write',
//     //     transactionID: 'shane',
//     //     strategy: 'something',
//     //     timestamp: 12425,
//     //     message: 'hello world',
//     //     duplicate: 'true'
//     // }
//     //  readFromFileRequest
//      const event = {
//         provider: 'aws',
//         service: 'io',
//         action: 'read',
//         timestamp: 12345,
//         transactionID: 'hello'
//     }
    

// }

// getting a count from a cosmos db
https://microsoft.github.io/AzureTipsAndTricks/blog/tip152.html


//https://stackoverflow.com/questions/44878247/azure-function-execution-speed-is-extremely-slow-and-inconsistent