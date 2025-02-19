const { getFirestore } = require('firebase-admin/firestore');

exports.get_memberships = async (decoded) => {
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
    console.log(message)
    return message;
}