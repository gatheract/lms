const functions = require("firebase-functions");
const cors = require('cors')({origin: true})
const https = require('https');
var jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const { user } = require("firebase-functions/lib/providers/auth");

const LTIAAS_HOSTNAME = "lms.test-br.ltiaas.com" // <- LTIAAS-test_brazil
const LTIAAS_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv1ZzctvZ6NkfxetC6caM
g41IDktxMs9EK0aayZJZifTNSJNPlztZMwyF0sQgichJ+rBtEMFSFoO6m/1LRpVy
1UPpREvbCq+KPccLD9MFdNc2atwxFzehzQapmuu5mRybP9fao1nPDwKjzI3D7Ceq
8w3bfs3Lo4zs0jYKRiSGXVmuxz1mQGKaTwLonm4nwwVZ13pTCkBM4G+Vx2OPry1M
aHG/5JPjK3vgxHl5NJFsNYgm0DsPF08W6cGzafX66dWaCshEmLAB3/s0HNG8yjSc
0hMX6A2A7w7/IFbTSt2O4Z4sc4H10UmLs+Bm1HDdTQVmvFHgPTySd5zh55MaYFYC
YQIDAQAB
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
        path: `/lti/register`,
        method: 'POST',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${functions.config().env.ltiaas_api_key}`,
          'Content-Length': Buffer.byteLength(postData)
        }
      }
      try {
        const value = await getPromisedApiResponse(options, true, postData);
        res.send({ message: value.result }).status(200);
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
        path: `/admin/tools/${data.id}`,
        method: 'GET',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${functions.config().env.ltiaas_api_key}`,
        }
      }
      try {
        const result = await getPromisedApiResponse(options);
        console.log(result)
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

exports.deleteTool = functions.https.onRequest(async (req, res) => {
  cors(req, res, async() => {
    try {

      const data = req.body;

      const options = {
        hostname: LTIAAS_HOSTNAME,
        port: 443,
        path: `/admin/tools/${data.id}`,
        method: 'DELETE',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${functions.config().env.ltiaas_api_key}`,
        }
      }
      try {
        const result = await getPromisedApiResponse(options);
        console.log(result)
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

    let path = `/admin/tools`
    if(data.id !== "new") {
      path = `/admin/tools/${data.id}`
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
        'Authorization': `Bearer ${functions.config().env.ltiaas_api_key}`
      }
    }
    try {
      const result = await getPromisedApiResponse(options, true, postData);
      res.status(200).send({ id: result.id, clientId: result.clientId });
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
        path: `/api/launch/core/form`,
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

exports.LTIValidate = functions.https.onCall(async (data, context) => {
  const payload = data.payload;
  //TODO: get query parameter
  const uid = data.uid;
  try {

    let decoded = undefined;
    try {
      // Verify the JWT with the public Key given by LTIAAS
      decoded = jwt.verify(payload, LTIAAS_PUBLIC_KEY);
    } catch(err) {
      throw new functions.https.HttpsError('internal', `JWT Verification Failed: ${err.message}, payload=${payload}`);
    }

    //TODO: check that front-end userid matches parameters.user
    if(decoded.parameters.user != uid) {
      throw new functions.https.HttpsError('internal', `${decoded.parameters.user} does not match logged in user: ${uid}`);
    }

    // Get information about the requested launch context to send back to the learning tool via the idToken
    const doc = await admin.firestore().collection('users').doc(decoded.parameters.user).get();
    const user = doc.data();
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
        /*label: course.branch,
        title: course.title*/
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
      return result;
    } catch(e) {
      throw new functions.https.HttpsError('internal', e.message);
    }
  } catch (e) {
    throw new functions.https.HttpsError('internal', e.message);
  }
})

exports.LTIServices = functions.https.onRequest(async (req, res) => {
  cors(req, res, async() => {
    const payload = req.body.payload;
    try {

      let decoded = undefined;
      try {
        // Verify the JWT with the public Key given by LTIAAS
        decoded = jwt.verify(payload, LTIAAS_PUBLIC_KEY);
        if(decoded.type === "MEMBERSHIPS_GET") {
          // normally we would check `decoded.parameters.context`
          // before we select which users to send back
          const users = [];
          const docs = await admin.firestore().collection('users').get();
          docs.forEach((doc) => {
            users.push({
              id: doc.id,
              givenName: doc.data().name.split(" ")[0],
              familyName: doc.data().name.split(" ")[1],
              middleName: "",
              email: doc.data().email,
              roles: [doc.data().userType === "Admin" || doc.data().userType === "Teacher" ? "CONTEXT_INSTRUCTOR" : "CONTEXT_LEARNER"]
            });
          });
          const courseDocs = await admin.firestore().collection('courses').where('courseId', '==', decoded.parameters.context).get();
          let course = {};
          courseDocs.forEach((doc) => {
            //TODO: check that we only got one doc
            course = doc.data();
          });
          const message = {
            context: {
              id: decoded.parameters.context,
              label: course.branch,
              title: course.title
            },
            members: users
          }
          res.send(message).status(200);
        }
      } catch(err) {
        throw new functions.https.HttpsError('internal', `Service Failure: ${err.message}, payload=${payload}`);
      }

      res.send({ error: "An error occurred"}).status(500);

    } catch (e) {
      throw new functions.https.HttpsError('internal', e.message);
    }
  })
});

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