const functions = require("firebase-functions");
const cors = require('cors')({origin: true})
const https = require('https');
var jwt = require('jsonwebtoken');
const admin = require('firebase-admin');

const LTIAAS_HOSTNAME = "test-consumer.ltiaas.com" // <- AWS: LTIAAS-test_brazil
const LTIAAS_ACCOUNT = "consumer"
const LTIAAS_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuSjo0/c7
oVaXPcJfc9e2Q7/SWK/UzEBHe0AT58QOY3MVsYxMVR6I4KNSL
PdprazY+Jp4KVP2CHqzvrSqMyjy0M5VrrpRnNXF2XfeSwTOMHo
qFPIqxM67KOvjlnKVQA1S0fIegDCQ0kSapbzoKcvegnM9iCzCTwQ
Xy0wwlDIJbUm28yssPhUz326PfwNZT7QrGqOTAgMusK2pM2fBi
nP3bYfpjacbf8gsekpU85ngz6LWP8yZpcYYku27ko4IVDo++mBH
cMBZM7UyFB1wnhW1nV/Km7l4aE383S+74/X57nQdk8I4UQCSL2
EyoF9mrIKaqpxRqp7vpEmhsLyYFQH/7QIDAQAB
-----END PUBLIC KEY-----`


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

      let decoded = undefined;
      try {
        // Verify the JWT with the public Key given by LTIAAS
        decoded = jwt.verify(req.body.payload, LTIAAS_PUBLIC_KEY);
      } catch(err) {
        res.send({ message: `JWT Verification Failed: ${err.message}, payload=${req.body.payload}` }).status(400);
      }

      // Get information about the requested launch context to send back to the learning tool via the idToken
      const querySnapshot = await admin.firestore().collection('users').where('SRN', '==', decoded.parameters.user).get();
      let user = undefined;
      querySnapshot.forEach(doc => {
        user = doc.data();
      });
      const courseDoc = await admin.firestore().collection('courses').doc(decoded.parameters.context).get();
      const course = courseDoc.data();
      const tool = course.tools.find((tool) => tool.id === decoded.parameters.resource);
      const roles = [];
      if(user.userType === "Admin" || user.userType === "Teacher") {
        roles.push("CONTEXT_INSTRUCTOR")
      }
      if(user.userType === "Student") {
        roles.push("CONTEXT_LEARNER")
      }
      
      // Build the request object
      const data = {
        metadata: decoded.metadata,
        user: {
          id: decoded.parameters.user,
          name: user.name,
          email: user.email,
          givenName: user.name.split(" ")[0],
          familyName: user.name.split(" ")[1],
          roles: roles,
        },
        context: {
          id: course.courseId,
          label: course.branch,
          title: course.title
        },
        resource: {
          id: tool.id,
          title: tool.name,
          description: tool.name
        }
      }
      const postData = JSON.stringify(data);

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
        // LTIAAS sends us a self-submitting form to append to the body.
        // This form redirects to the tool launch URL
        res.send(result.form).status(200);
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