const { getFirestore, FieldValue } = require('firebase-admin/firestore');

/*
Lineitems take the form:
{
    id: 'internalGradeLineID',
    label: 'gradeLineLabel',
    scoreMaximum: 100,
    resourceLinkId: 'resource1', // Optional, if grade line should be attached to a recource
    tag: 'tag1' // Optional, if grade line should be attached to tag
}
*/

/*
Get all lineitems for a given context and optional filter
{
	type: 'LINEITEMS_GET',
	parameters: { 
		context: 'courseID',
		clientId: 'toolID',
		filters: { // Optional filters
			resourceLinkId: 'resource1',
			tag: 'tag1'
		}
	}
}
*/
exports.lineitems_get = async (decoded) => {
    const status = 200;
    let lineitems = [];
    const querySnapshot = await getFirestore().collection('lineitems')
        .where("context", "==", decoded.parameters.context)
        .where("clientId", "==", decoded.parameters.clientId).get();
    querySnapshot.forEach((doc) => {
        const item = doc.data().lineItem;
        item.id = doc.id;
        lineitems.push(item);
    });
    //TODO: filter out all of the clientId's that the requested context has access to.
    if(decoded.parameters?.filters?.resourceLinkId) {
        // filter out items that do not have this resourceLinkId
        lineitems = lineitems.filter((item) => item.resourceLinkId === decoded.parameters.filters.resourceLinkId);
    }
    if(decoded.parameters?.filters?.tag) {
        // filter out items that do not have this tag
        lineitems = lineitems.filter((item) => item.tag === decoded.parameters.filters.tag);
    }
    const message = lineitems;
    return {message, status};
}

/*
{
	type: 'LINEITEM_GET',
	parameters: { 
		context: 'courseID',
		clientId: 'toolID',
		lineItemId: 'internalGradeLineID'
    }
}
*/
exports.lineitem_get = async (decoded) => {
    let status = 200;
    let message = {};
    const doc = await getFirestore().collection('lineitems').doc(decoded.parameters.lineItemId).get();
    //TODO: make sure the context and clientId match the ones in the stored line item
    //TODO: filter out all of the clientId's that the requested context has access to.
    if (doc.exists) {
        const lineitem = doc.data().lineItem;
        lineitem.id = doc.id;
        message = lineitem;
    } else {
        status = 404;
        message = "Lineitem not found";
    }
    return {message, status};
}

/*
{
	type: 'LINEITEMS_POST',
	parameters: {
		context: 'courseID',
		clientId: 'toolID',
		lineItem: {
			label: 'gradeLineLabel',
            scoreMaximum: 100,
            resourceLinkId: 'resource1', // Optional, if grade line should be attached to a recource
            tag: 'tag1' // Optional, if grade line should be attached to tag
	   }
	}
}
*/
exports.lineitems_post = async (decoded) => {
    const status = 200;
    const message = decoded.parameters.lineItem;
    //TODO: make sure the context and clientId exist first
    //TODO: filter out all of the clientId's that the requested context has access to.
    // add the lineitem to the DB (along with the context and clientId)
    const doc = await getFirestore().collection('lineitems').add(decoded.parameters);
    // give the lineitem it's new ID before returning
    message.id = doc.id;
    return {message, status};
}

/*
{
	type: 'LINEITEM_PUT',
	parameters: { 
		context: 'courseID',
		clientId: 'toolID',
		lineItemId: 'internalGradeLineID',
		lineItem: {
			label: 'gradeLineLabel',
            scoreMaximum: 100,
            resourceLinkId: 'resource1', // Optional, if grade line should be attached to a recource
            tag: 'tag1' // Optional, if grade line should be attached to tag
	   }
	}
}
*/
exports.lineitem_put = async (decoded) => {
    let status = 200;
    let message = {};
    const docId = decoded.parameters.lineItemId;
    const doc = await getFirestore().collection('lineitems').doc(docId).get();
    if (doc.exists) {
        // TODO: make sure the context and clientId match the ones in the stored line item
        const dataToSave = decoded.parameters;
        const doc2 = await getFirestore().collection('lineitems').doc(docId).update(dataToSave);
        message = dataToSave.lineItem;
        message.id = docId;
    } else {
        status = 404;
        message = "Lineitem not found";
    }
    return {message, status};
}

/*
{
	type: 'LINEITEM_DELETE',
	parameters: { 
		context: 'courseID',
		clientId: 'toolID',
		lineItemId: 'internalGradeLineID'
    }
}
*/
exports.lineitem_delete = async (decoded) => {
    let status = 200;
    let message = null;
    const doc = await getFirestore().collection('lineitems').doc(decoded.parameters.lineItemId).get();
    if (doc.exists) {
        //TODO: filter out all of the clientId's that the requested context has access to.
        // TODO: make sure the context and clientId match the ones in the stored line item
        await getFirestore().collection('lineitems').doc(decoded.parameters.lineItemId).delete();
    } else {
        status = 404;
        message = "Lineitem not found";
    }
    return {message, status};
}

/*
{
	type: 'SCORE_POST',
	parameters: { 
		context: 'courseID',
		clientId: 'toolID',
		lineItemId: 'internalGradeLineID',
		score: {
			userId: 'userID',
            activityProgress: 'activityProgress', // I'll add validation on these
            gradingProgress: 'gradingProgress', // I'll add validation on these
            scoreGiven: 100, // Optional
            scoreMaximum: 100 // Required only if score given is present
	   }
	}
}
*/
exports.score_post = async (decoded) => {
    let status = 204;
    let message = {};
    //TODO: make sure the context and clientId exist first
    //TODO: filter out all of the clientId's that the requested context has access to.

    const score = decoded.parameters.score;
    // we store the date created so that we can keep a history of grade submissions
    score.created = FieldValue.serverTimestamp()
    try {
        // add the grade line to the DB (along with the context and clientId)
        const doc = await getFirestore().collection('lineitems').doc(decoded.parameters.lineItemId).collection("grades").add(score);
    } catch(e) {
        status = 404;
        message = "Lineitem not found";
    }
    return {message, status};
}

/*
{
	type: 'RESULTS_GET',
	parameters: { 
		context: 'courseID',
		clientId: 'toolID',
		lineItemId: 'internalGradeLineID',
		filters: { // Optional filters
			userId: 'userID'
		}
	}
}
*/
exports.score_get = async (decoded) => {
    let status = 200;
    const message = [];
    const scoreMap = new Map();
    //TODO: make sure the context and clientId exist first
    //TODO: filter out all of the clientId's that the requested context has access to.
    let querySnapshot = null;
    if(decoded.parameters?.filters?.userId) {
        querySnapshot = await getFirestore().collection('lineitems').doc(decoded.parameters.lineItemId).collection("grades")
            .where("userId", "==", decoded.parameters.filters.userId)
            .orderBy("created", "desc").orderBy("userId") // the first record per userId will be the oldest
            .get();
    } else {
        querySnapshot = await getFirestore().collection('lineitems').doc(decoded.parameters.lineItemId).collection("grades")
            .orderBy("created") // the first record will be the oldest
            .get();
    }
    querySnapshot.forEach((doc) => {
        const item = {
            id: doc.id,
            userId: doc.data().userId,
            resultMaximum: doc.data().scoreMaximum,
            resultScore: doc.data().scoreGiven,
            comment: doc.data()?.comment || null
        }
        // overwrite any old score for the user if it is there
        scoreMap.set(item.userId, item);
    });
    console.log(scoreMap)
    
    // convert to array
    scoreMap.forEach((value) => message.push(value));
    return {message, status};
}