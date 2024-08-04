import React, { useState } from 'react'
import { Container,Row, Col, Input, Label, Button, UncontrolledTooltip } from 'reactstrap'
import { firestoreConnect } from 'react-redux-firebase'
import {storage} from "../../config/fbConfig"
import { addTool } from '../../Store/actions/courseActions'
import { connect } from 'react-redux'
import { compose } from 'redux'

const AddLTIToolForm = ({course, addTool, tools, userId}) => {
    const [tool, setTool] = useState();
    const [launchForm, setLaunchForm] = useState(false);

    const handleTool = (e) => {
        var foundTool = tools.find(item => item.id === e.target.value);
        setTool(foundTool)
     }

    const handleToolChoice = (course) => {
        if(tool.needsDeepLinking) {
            // open deep-linking content selection form
            deepLinkingLaunch(course, tool)
        } else {
            // no deep linking, just add the tool URL as-is
            addTool(tool, course)
        }
    }

    const deepLinkingLaunch = (course, tool) => {
        const post_data = {
            clientId: tool.id,
            context: course[0].id,
            //resource: tool.id,
            user: userId,
            launchEndpoint: tool.launchEndpoint //Optional
            //personalData` - Optional
            //customParameters` - Optional
        }
        const postData = JSON.stringify(post_data);
        //fetch('https://us-central1-ltiaas-lms.cloudfunctions.net/LTIDeepLinkingLaunch', {
        fetch('https://ltideeplinkinglaunch-ulta7xj7hq-uc.a.run.app', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'Content-Type': 'application/json'
            },
            body: postData
        }).then((res) => (res.json()))
        .then(res => {
            setLaunchForm(res.result.form);
        })
    }

    return(
        <Container>
            {!launchForm &&
            <>
                <Row md="12" className="mt-3">
                    <Col md="4">
                        <Label htmlFor="name">Choose an LTI Tool</Label>
                        <Input type="select" name="tool" id="tool" onChange={handleTool}>
                            <option value="">---</option>
                            {tools && tools.map(tool => (
                                <option key={tool.id} value={tool.id}>{tool.name}</option>
                            ))
                            }
                        </Input>
                    </Col>
                </Row>
                <Button color="primary" className="mt-3 mb-3" onClick={() => {handleToolChoice(course)}}>{tool?.needsDeepLinking ? "Select Content" : "Add Tool"}</Button>
            </>
            }
            {launchForm &&
                <Button color="warning" className="button ml-2 w-25" onClick={() => {setLaunchForm(false);}}>Cancel</Button>
            }
            {launchForm && <iframe key={tool.id} frameBorder="0" width="100%" height="600" title="LTI launch" src={"data:text/html,"+encodeURIComponent(launchForm)}>Browser not compatible with iframes.</iframe>}
        </Container>
    )
}

const mapStateToProps = (state) => {
    return {
        tools: state.firestore.ordered.tools
    }
}

const mapDispatchToProps = (dispatch) => {
    return({
        addTool: (course, title, url) => {
            dispatch(addTool(course, title, url))
        }
    })
}

export default compose(
    connect(mapStateToProps, mapDispatchToProps), 
    firestoreConnect([
        {
            collection: 'tools'
        },
    ])
)(AddLTIToolForm);
