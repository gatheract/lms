import React, { useState } from 'react'
import { Button, Card, CardTitle, Col, Row} from 'reactstrap'
import { removeTool } from '../../Store/actions/courseActions';
import { connect } from 'react-redux'



const CourseToolCard = ({resources, course, userId, profile, removeTool}) => {

    const resourceList = resources || [];

    const handleDelete = (course, title, url) => {
        removeTool(course,title, url)
    }

    const [loading, setLoading] = useState(false)

    const launchTool = (course, tool) => {
        const post_data = {
            clientId: tool.id,
            context: course.id,
            resource: tool.url,
            user: userId
            //launchEndpoint` - Optional
            //personalData` - Optional
            //customParameters` - Optional
        }
        const postData = JSON.stringify(post_data);
        setLoading(tool.id);
        fetch('https://us-central1-ltiaas-lms.cloudfunctions.net/LTILaunch', {
            method: 'POST',
            headers: {
            'Accept': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'Content-Type': 'application/json'
            },
            body: postData
        }).then((res) => (res.json()))
        .then(res => {
            console.log(res)
            document.write(res.result.form);
        })
    }

    return(
        <Row>
            {resourceList.map((r) => (
                <React.Fragment key={r.id}>
                    <Col md="5">
                        <Card className="video-card mb-3">
                            <CardTitle className="video-title">{r.name}</CardTitle>
                            <Button className="button w-25 mb-2 view-button" disabled={loading === r.id} onClick={() => launchTool(course, r)}>
                                {loading === r.id ? "Loading..." : "View"}
                            </Button>
                            { profile.userType === "Student" ? null : 
                            <Button color="danger" className="button w-25" onClick={() => handleDelete(course, r)}>Remove</Button>
                            }                               
                        </Card>
                    </Col>
                </React.Fragment>
            ))}
        </Row>
    )
}


const mapStateToProps = (state) => {
    return{
        profile: state.firebase.profile
    }
}



const mapDispatchToProps = (dispatch) => {
    return{
        removeTool: (course, tool) => {
            dispatch(removeTool(course, tool))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseToolCard);