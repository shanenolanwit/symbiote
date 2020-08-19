const commonHandler = require('../commonHandler');

module.exports = async function(context, req) {
    context.log('Received request via HTTP trigger');
    if (req) {
      const result = await commonHandler(req.body);
      context.log(result)
      context.res = {
        status: 200,
        headers: {
          "Access-Control-Allow-Headers" : "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body: JSON.stringify(result, null, 2)
      }
      context.done();
    } else {
      context.res = {
        status: 400,
        body: 'Request body missing.'
      };
    }
  };
  