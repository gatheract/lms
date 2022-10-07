import React, { useState } from 'react'
import { Button, Card, CardTitle, Col, Row} from 'reactstrap'
import { removeTool } from '../../Store/actions/courseActions';
import { connect } from 'react-redux'

const CourseToolCard = ({resources, course, userId, profile, removeTool}) => {

    const resourceList = resources || [];

    const handleDelete = (course, title, url) => {
        removeTool(course,title, url)
    }

    const [loading, setLoading] = useState(false);
    const [launchForm, setLaunchForm] = useState(false);

    const launchTool = (course, tool) => {
        const post_data = {
            clientId: tool.id,
            context: course[0].id,
            resource: tool.id,
            user: userId
            //launchEndpoint` - Optional
            //personalData` - Optional
            //customParameters` - Optional
        }
        console.log(post_data)
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
            setLaunchForm(res.result.form);
        })
    }

    return(
        <Row>
            {resourceList.map((r) => (
                <React.Fragment key={r.id}>
                    <Col>
                        <Card className="video-card mb-3">
                            <CardTitle className="video-title">{r.name}
                            {!launchForm &&
                            <>
                                <Button className="button w-25 ml-2 view-button" disabled={loading === r.id} onClick={() => launchTool(course, r)}>
                                    {loading === r.id ? "Loading..." : "View"}
                                </Button>
                                { profile.userType === "Student" ? null : 
                                    <Button color="danger" className="button ml-2 w-25" onClick={() => handleDelete(course, r)}>Remove</Button>
                                }
                            </>
                            }
                            {launchForm &&
                                    <Button color="warning" className="button ml-2 w-25" onClick={() => {setLaunchForm(false);setLoading(false)}}>Close Tool</Button>
                            }
                            </CardTitle>
                            {launchForm && <iframe frameBorder="0" width="100%" height="600" title="LTI launch" src={"data:text/html,"+encodeURIComponent(launchForm)}>Browser not compatible with iframes.</iframe>}
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