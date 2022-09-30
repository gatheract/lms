const functions = require("firebase-functions");
const cors = require('cors')({origin: true})
const https = require('https');

const LTIAAS_HOSTNAME = "test-consumer.ltiaas.com" // <- AWS: LTIAAS-test_brazil
const LTIAAS_ACCOUNT = "consumer"

exports.doDynamicRegistration = functions.https.onRequest(async (req, res) => {
  cors(req, res, async() => {
    try {
      const data = {
        url: req.body.url
      }

      const postData = JSON.stringify(data);
      const options = {
        hostname: LTIAAS_HOSTNAME,
        port: 443,
        path: `/register`,
        method: 'POST',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${functions.config().env.ltiaas_api_key}`,
          'Content-Length': Buffer.byteLength(postData)
        }
      }
      try {
        await getPromisedApiResponse(options, true, postData);
        res.send.status(200)({ result: 'Ok' });
      } catch(e) {
        res.send({ message: e.message }).status(500);
      }
    } catch (e) {
      res.send({ message: e.message }).status(500);
    }
  })
})

exports.getTool = functions.https.onRequest(async (req, res) => {
  cors(req, res, async() => {
    try {

      const data = req.body;

      const options = {
        hostname: LTIAAS_HOSTNAME,
        port: 443,
        path: `/account/${LTIAAS_ACCOUNT}/tools/${data.id}`,
        method: 'GET',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${functions.config().env.ltiaas_account_api_key}`,
        }
      }
      try {
        const result = await getPromisedApiResponse(options);
        res.status(200).send({ result: result });
      } catch(e) {
        res.send({ message: e.message }).status(500);
        throw new functions.https.HttpsError('internal', e.message);
      }
    } catch (e) {
        res.send({ message: e.message }).status(500);
      throw new functions.https.HttpsError('internal', e.message);
    }
  })
})

exports.registerTool = functions.https.onRequest(async (req, res) => {
  cors(req, res, async() => {
    const data = req.body;
    /*
    {
      "name":"Tool",
      "launchEndpoint":"https://test-ltiaas.ltiaas.com/lti/launch",
      "loginEndpoint":"https://test-ltiaas.ltiaas.com/lti/login",
      "deeplinkingEndpoint":"https://test-ltiaas.ltiaas.com/lti/launch",
      "redirectionUris": ["https://test-ltiaas.ltiaas.com/lti/launch"],
      "authConfig":{
          "method":"RSA_KEY",
          "key":"https://test-ltiaas.ltiaas.com/lti/keys"
      },
      "permissions": [],
      "personalData":"EMAIL",
      "customParameters": {},
      "active": true
    }
    */
    const postData = JSON.stringify(data);

    let path = `/account/${LTIAAS_ACCOUNT}/tools`
    if(data.id !== "new") {
      path = `/account/${LTIAAS_ACCOUNT}/tools/${data.id}`
    }

    const options = {
      hostname: LTIAAS_HOSTNAME,
      port: 443,
      path: path,
      method: 'POST',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${functions.config().env.ltiaas_account_api_key}`
      }
    }
    try {
      const result = await getPromisedApiResponse(options, true, postData);
      res.status(200).send({ id: result.id });
    } catch(e) {
      res.send({ message: e.message }).status(500);
    }
  })
})

exports.LTILaunch = functions.https.onRequest(async (req, res) => {
  cors(req, res, async() => {
    try {
      const data = req.body;
      
      const postData = JSON.stringify(data);

      const options = {
        hostname: LTIAAS_HOSTNAME,
        port: 443,
        path: `/api/launch/core`,
        method: 'POST',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Authorization': `Bearer ${functions.config().env.ltiaas_api_key}`,
        }
      }
      try {
        const result = await getPromisedApiResponse(options, true, postData);
        res.send({ result: result }).status(200);
        return { result: result };
      } catch(e) {
        res.send({ message: e.message }).status(500);
      }
    } catch (e) {
      res.send({ message: e.message }).status(500);
    }
  })
})

exports.LTIValidate = functions.https.onRequest(async (req, res) => {
  cors(req, res, async() => {
    try {

      const data = req.body;
      // This is just an example, normally we would validate the user has permission to launch the tool
        /*
            user = db.users.where('uid' == auth.uid).get()
            courses = db.get(courses)
            course = courses.find(c => c.branch == user.branch)
            tool = course.tools.find(t => t.id == THIS_LTI_CONTEXT.toolId)
            if(!tool) return(<Redirect to="/login"></Redirect>)
        */
      const postData = JSON.stringify(data);
      /* should be:
        { metadata, parameters: { user, context, resource } }
      */

      const options = {
        hostname: LTIAAS_HOSTNAME,
        port: 443,
        path: `/api/idtoken/core`,
        method: 'POST',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Authorization': `Bearer ${functions.config().env.ltiaas_api_key}`,
        }
      }
      try {
        const result = await getPromisedApiResponse(options, true, postData);
        res.send(result).status(200);
      } catch(e) {
        res.send({ message: e.message }).status(500);
      }
    } catch (e) {
      res.send({ message: e.message }).status(500);
    }
  })
})


const getPromisedApiResponse = (options, json=true, postData=null) => {
	return new Promise((resolve, reject) => {
        
    const req = https.request(options, (res) => {
      let chunks_of_data = [];

			res.on('data', (fragments) => {
				chunks_of_data.push(fragments);
			});

      res.on('end', () => {
				const response_body = Buffer.concat(chunks_of_data);
        const response_string = response_body.toString();
        try {
          if(json) {
            const json_result = JSON.parse(response_string);
            resolve(json_result);
          } else {
            resolve(response_string);
          }
        } catch {
          resolve({"result": response_string});
        }
			});

    });

    // use its "timeout" event to abort the request
    req.on('timeout', () => {
      req.abort();
      reject("Request timed out.");
    });
    
    req.on('error', error => {
      reject(error);
    });

    if(postData) {
      req.write(postData);
    }
    
    req.end();
	});
}