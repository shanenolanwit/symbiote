# symbiote

> Noun. an organism in a partnership with another such that each profits from their being together.


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