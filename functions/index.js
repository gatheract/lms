const functions = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const admin =  require('firebase-admin');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { doDynamicRegistration, getTool, deleteTool, registerTool, LTILaunch, LTIValidate, LTIServices, LTIDeepLinkingLaunch, LTIDeepLinkingValidate } = require("./ltiaas_apis");
const cors = require('cors')({origin: true})
initializeApp();

const createNotification = ((notification) => {
    return getFirestore().collection('notifications')
      .add(notification)
      .then(doc => console.log('notification added', doc));
  });
  

exports.newNotificationAdded = functions
    .firestore
    .document('adminnotifications/{adminnotificationId}')
    .onCreate(
    doc =>{
        const newNotification = doc.data();
        return createNotification(newNotification) 
    }
)

exports.doDynamicRegistration = doDynamicRegistration;
exports.getTool = getTool;
exports.deleteTool = deleteTool;
exports.registerTool = registerTool;
exports.LTILaunch = LTILaunch;
exports.LTIDeepLinkingLaunch = LTIDeepLinkingLaunch;
exports.LTIValidate = LTIValidate;
exports.LTIDeepLinkingValidate = LTIDeepLinkingValidate;
exports.LTIServices = LTIServices;

exports.addAdmin = onRequest(async (req, res) => {
  cors(req, res, async() => {
      try {
        const newAdmin = {
            email: req.body.email,
            password: req.body.password,
        }

        const adminRecord = await admin
            .auth()
            .createUser(newAdmin);

        const userId = adminRecord.uid;

        await getFirestore().collection("users").doc(userId).set({
          email: req.body.email,
          name: req.body.name,
          userType: 'Admin',
          password: req.body.password,
          phone: req.body.phone,
        });
  
        return { result: 'The new admin has been successfully created.' };
    } catch (error) {
      console.log(error)
    }
  })
})