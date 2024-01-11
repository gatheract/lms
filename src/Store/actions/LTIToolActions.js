import { Tools16 } from '@carbon/icons-react';
import { uid } from 'uid';

export const addLTITool = (tool) => {
    return (dispatch, getState, {getFirestore, getFirebase}) => {

        const permissionsArray = []
        if(tool.permissions_MEMBERSHIPS_READ) {
            permissionsArray.push("MEMBERSHIPS_READ")
        }
        if(tool.permissions_LINEITEMS_READ) {
            permissionsArray.push("LINEITEMS_READ")
        }
        if(tool.permissions_LINEITEMS_READ_WRITE) {
            permissionsArray.push("LINEITEMS_READ_WRITE")
        }
        if(tool.permissions_GRADES_READ) {
            permissionsArray.push("GRADES_READ")
        }
        if(tool.permissions_GRADES_WRITE) {
            permissionsArray.push("GRADES_WRITE")
        }

        const params = tool.customParameters.split(',');
        const customParametersMap = {};
        for (let i = 0; i < params.length; i++) {
            var parts = params[i].split('=');
            if(params[i].length === 2) {
                customParametersMap[parts[0]] = parts[1].substr(1, parts[1].length - 2);
            }
        }

        const post_data = {
            id: tool.id || "new",
            name: tool.name,
            launchEndpoint: tool.launchEndpoint,
            loginEndpoint: tool.loginEndpoint,
            deeplinkingEndpoint: tool.deeplinkingEndpoint,
            redirectionUris: tool.redirectionUris.split(','),
            authConfig:{
                method: tool.authConfigMethod,
                key: tool.authConfigKey
            },
            permissions: permissionsArray,
            personalData: tool.personalData,
            //key-value, via key=value,key=value
            customParameters: customParametersMap,
            active: tool.active
        }
        const postData = JSON.stringify(post_data);
        return fetch('https://us-central1-ltiaas-lms.cloudfunctions.net/registerTool', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'Content-Type': 'application/json'
            },       
            body: postData
        })
        .then((res) => (res.json()))
        .then((result) => {
            const firestore = getFirebase().firestore();
            firestore.collection('tools').add(
            {
                id: result.id,
                name: tool.name,
                description: tool.description,
                launchEndpoint: tool.launchEndpoint,
                clientId: result.clientId
            }).then((result)=>{
                dispatch({type:'CREATE_TOOL'});
            }).catch((err)=>{
                console.log(err);
                dispatch({type:'CREATE_TOOL_ERROR'});
            });   
        }).catch((err)=>{
            console.log(err);
            dispatch({type:'CREATE_TOOL_ERROR'});
        }); 
    }
}

export const removeLTITool = (tool) => {
    return (dispatch, getState, {getFirebase}) => {
        const postData =  JSON.stringify({id: tool.id});
        return fetch('https://us-central1-ltiaas-lms.cloudfunctions.net/deleteTool', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'Content-Type': 'application/json'
            },       
            body: postData
        })
        .then((res) => (res.json()))
        .then((res) => {
            const firestore = getFirebase().firestore();
            firestore.collection('tools')
            .where("id", "==", tool.id).get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    doc.ref.delete();
                });
            })
            .then(() => {
                dispatch({
                    type: 'REMOVED_TOOL'
                })
            })
            .catch((err) => {
                dispatch({
                    type: 'REMOVE_TASK_ERR',
                    err
                })
            })
        });
    }
}

export const doDynamicRegistration = (url, setErrorMessage) => {
    return fetch('https://us-central1-ltiaas-lms.cloudfunctions.net/doDynamicRegistration', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },       
            body: JSON.stringify({
                url: url
            })
        })
        .then((res) => (res.json()))
        .then((result) => {
            setErrorMessage(result)
        }).catch(err => {
            setErrorMessage(err)
        })
}