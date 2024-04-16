import React, { useState } from 'react'
import { Button, Card, CardTitle} from 'reactstrap'
import { removeTool } from '../../Store/actions/courseActions';
import { connect } from 'react-redux'

const CourseToolViewer = ({tool, course, userId, profile, removeTool}) => {


    const handleDelete = (course, tool) => {
        removeTool(course, tool)
    }

    const [loading, setLoading] = useState(false);
    const [launchForm, setLaunchForm] = useState(false);

    const launchTool = (course, tool) => {
        const post_data = {
            clientId: tool.id,
            context: course[0].id,
            resource: tool.id,
            user: userId,
            launchEndpoint: tool.launchEndpoint //Optional
            //personalData` - Optional
            //customParameters` - Optional
        }
        const postData = JSON.stringify(post_data);
        setLoading(true);
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
            
        <Card className="video-card mb-3">
            <CardTitle className="video-title">{tool.name}
            {!launchForm &&
            <>
                <Button className="button w-25 ml-2 view-button" disabled={loading} onClick={() => launchTool(course, tool)}>
                    {loading ? "Loading..." : "View"}
                </Button>
                { profile.userType === "Student" ? null : 
                    <Button color="danger" className="button ml-2 w-25" onClick={() => handleDelete(course, tool)}>Remove</Button>
                }
            </>
            }
            {launchForm &&
                <Button color="warning" className="button ml-2 w-25" onClick={() => {setLaunchForm(false);setLoading(false)}}>Close Tool</Button>
            }
            </CardTitle>
            {launchForm && <iframe key={tool.id} frameBorder="0" width="100%" height="600" title="LTI launch" src={"data:text/html,"+encodeURIComponent(launchForm)}>Browser not compatible with iframes.</iframe>}
        </Card>
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

export default connect(mapStateToProps, mapDispatchToProps)(CourseToolViewer);