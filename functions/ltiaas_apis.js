const { defineSecret } = require('firebase-functions/params');
const {onRequest, onCall, HttpsError} = require("firebase-functions/v2/https");
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const cors = require('cors')({origin: true})
const https = require('https');
var jwt = require('jsonwebtoken');
const ltiaasApiKey = defineSecret('LTIAAS_API_KEY');

const LTIAAS_HOSTNAME = "lms.test-br.ltiaas.com" // <- LTIAAS-test_brazil
const LTIAAS_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuySCG+2s7ATwK0dNwgop
MVWhs/6THqLOtRQKgY3w7UyAUXucccfOmZQi/E3PYIJN8Hx0fzk+LeRkPr1DAHrt
l7Lj1IOmwW2bXVbsQdNpIK0/ho/yJlytZQi6JFQSwNICToybUFoGzPHIbw7INaJd
OHzqUNt4593vSpxTGSG/aJOrNHTvD9Q4h4ODFD65eJg0TiCGpBh248F83s9XNnx6
+I+Lud4bQ6C+x/Bm+5saC88ZDtEmRRtOnwLvkMW4of/eW952/djSgPiVI1aoJlPR
b/HmNE1IPlSUMLoQuxOvr4cV3vbLqU5mSyvaYinxqIkclbfsWY5tPJSEuKBt2JMj
qQIDAQAB
-----END PUBLIC KEY-----`

exports.doDynamicRegistration = onRequest({ secrets: [ltiaasApiKey] }, async (req, res) => {
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
          'Authorization': `Bearer ${ltiaasApiKey.value()}`,
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

exports.getTool = onRequest({ secrets: [ltiaasApiKey] }, async (req, res) => {
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
          'Authorization': `Bearer ${ltiaasApiKey.value()}`,
        }
      }
      try {
        const result = await getPromisedApiResponse(options);
        console.log(result)
        res.status(200).send({ result: result });
      } catch(e) {
        res.send({ message: e.message }).status(500);
        throw new HttpsError('internal', e.message);
      }
    } catch (e) {
        res.send({ message: e.message }).status(500);
      throw new HttpsError('internal', e.message);
    }
  })
})

exports.deleteTool = onRequest({ secrets: [ltiaasApiKey] }, async (req, res) => {
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
          'Authorization': `Bearer ${ltiaasApiKey.value()}`,
        }
      }
      try {
        const result = await getPromisedApiResponse(options);
        console.log(result)
        res.status(200).send({ result: result });
      } catch(e) {
        res.send({ message: e.message }).status(500);
        throw new HttpsError('internal', e.message);
      }
    } catch (e) {
        res.send({ message: e.message }).status(500);
      throw new HttpsError('internal', e.message);
    }
  })
})

exports.registerTool = onRequest({ secrets: [ltiaasApiKey] }, async (req, res) => {
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
        'Authorization': `Bearer ${ltiaasApiKey.value()}`
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

exports.LTILaunch = onRequest({ secrets: [ltiaasApiKey] }, async (req, res) => {
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
          'Authorization': `Bearer ${ltiaasApiKey.value()}`,
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

exports.LTIDeepLinkingLaunch = onRequest({ secrets: [ltiaasApiKey] }, async (req, res) => {
  cors(req, res, async() => {
    try {
      const data = req.body;
      
      const postData = JSON.stringify(data);

      const options = {
        hostname: LTIAAS_HOSTNAME,
        port: 443,
        path: `/api/launch/deeplinking/form`,
        method: 'POST',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Authorization': `Bearer ${ltiaasApiKey.value()}`,
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

exports.LTIValidate = onCall({ secrets: [ltiaasApiKey] }, async (request) => {
  
  const payload = request.data.payload;
  const uid = request.auth.uid;
  try {

    let decoded = undefined;
    try {
      // Verify the JWT with the public Key given by LTIAAS
      decoded = jwt.verify(payload, LTIAAS_PUBLIC_KEY);
    } catch(err) {
      throw new HttpsError('internal', `JWT Verification Failed: ${err.message}, payload=${payload}`);
    }

    //TODO: check that front-end userid matches parameters.user
    if(decoded.parameters.user != uid) {
      throw new HttpsError('internal', `${decoded.parameters.user} does not match logged in user: ${uid}`);
    }

    // Get information about the requested launch context to send back to the learning tool via the idToken
    const doc = await getFirestore().collection('users').doc(decoded.parameters.user).get();
    const user = doc.data();
    const courseDoc = await getFirestore().collection('courses').doc(decoded.parameters.context).get();
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
        'Authorization': `Bearer ${ltiaasApiKey.value()}`,
      }
    }
    try {
      const result = await getPromisedApiResponse(options, true, postData);
      // LTIAAS sends us a self-submitting form to append to the body.
      // This form redirects to the tool launch URL
      return result;
    } catch(e) {
      throw new HttpsError('internal', e.message);
    }
  } catch (e) {
    throw new HttpsError('internal', e.message);
  }
})

exports.LTIDeepLinkingValidate = onCall({ secrets: [ltiaasApiKey] }, async (request) => {
  const payload = request.data.payload;
  const uid = request.auth.uid;
  try {

    let decoded = undefined;
    try {
      // Verify the JWT with the public Key given by LTIAAS
      decoded = jwt.verify(payload, LTIAAS_PUBLIC_KEY);
    } catch(err) {
      throw new HttpsError('internal', `JWT Verification Failed: ${err.message}, payload=${payload}`);
    }

    //TODO: check that front-end userid matches parameters.user
    if(decoded.parameters.user != uid) {
      throw new HttpsError('internal', `${decoded.parameters.user} does not match logged in user: ${uid}`);
    }

    // Get information about the requested launch context to send back to the learning tool via the idToken
    const doc = await getFirestore().collection('users').doc(decoded.parameters.user).get();
    const user = doc.data();
    const courseDoc = await getFirestore().collection('courses').doc(decoded.parameters.context).get();
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
      }
      // don't send resource ona deep-linking launch
      /*resource: {
        id: tool.id,
        title: tool.name,
        description: tool.name
      }*/
    }
    const postData = JSON.stringify(data);

    const options = {
      hostname: LTIAAS_HOSTNAME,
      port: 443,
      path: `/api/idtoken/deeplinking`,
      method: 'POST',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${ltiaasApiKey.value()}`,
      }
    }
    try {
      const result = await getPromisedApiResponse(options, true, postData);
      // LTIAAS sends us a self-submitting form to append to the body.
      // This form redirects to the tool launch URL
      return result;
    } catch(e) {
      throw new HttpsError('internal', e.message);
    }
  } catch (e) {
    throw new HttpsError('internal', e.message);
  }
})

exports.LTIServices = onRequest(async (req, res) => {
  cors(req, res, async() => {
    const payload = req.body.payload;
    let decoded = undefined;
    try {
      // Verify the JWT with the public Key given by LTIAAS
      decoded = jwt.verify(payload, LTIAAS_PUBLIC_KEY);
      if(decoded.type === "MEMBERSHIPS_GET") {
        // normally we would check `decoded.parameters.context`
        // before we select which users to send back
        const users = [];
        const docs = await getFirestore().collection('users').get();
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
        const courseDocs = await getFirestore().collection('courses').where('courseId', '==', decoded.parameters.context).get();
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
      } else if(decoded.type === "DEEP_LINKING_RESPONSE") {

        // get the tool from the DB
        const toolDocs = await getFirestore().collection('tools').where('clientId', '==', decoded.parameters.clientId).limit(1).get();
        let tool = {};
        toolDocs.forEach((doc) => {
          tool = doc.data();
        });
        if(!tool) {
          // we can't find the tool.
          // Throw an error
          res.send("LTI tool not found").status(400);
        }
        // update the default url and name of the tool before storing associating it with the course.
        tool.launchEndpoint = decoded.parameters.contentItems[0].url;
        tool.name = decoded.parameters.contentItems[0].title;
        
        const courseDocs = await getFirestore().collection('courses').where('courseId', '==', decoded.parameters.context).get();
        let courseId = {};
        courseDocs.forEach((doc) => {
          //TODO: check that we only got one doc
          courseId = doc.id;
        });

        // Add the tool ot the course
        await getFirestore().collection('courses').doc(courseId)
          .update({
              tools: FieldValue.arrayUnion(tool)
          })
        // refresh the window
        const html = `<html><head><script>
        window.parent.postMessage(
          {
            type: "deep-linking-complete"
          },
          "*"
        );
        </script></head><body><p>Deep Linking Complete</body></html>`;
        //res.content_type = 'text/html';
        res.send(html).status(200);
      } else {
        res.send({ error: "An error occurred"}).status(500);
      }

    } catch (e) {
      console.log(e)
      res.send({ error: e.message}).status(500);
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