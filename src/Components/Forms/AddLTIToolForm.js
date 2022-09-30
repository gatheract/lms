import React, { useState } from 'react'
import { Container,Row, Col, Input, Label, Button, UncontrolledTooltip } from 'reactstrap'
import { firestoreConnect } from 'react-redux-firebase'
import {storage} from "../../config/fbConfig"
import { addTool } from '../../Store/actions/courseActions'
import { connect } from 'react-redux'
import { compose } from 'redux'

const AddLTIToolForm = ({course, addTool, tools}) => {
    const [tool, setTool] = useState();

    const handleTool = (e) => {
        var foundTool = tools.find(item => item.id === e.target.value);
        setTool(foundTool)
     }

    const handleToolChoice = (course) => {
        addTool(tool, course)
    }

    return(
        <Container>
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
            <Button color="primary" className="mt-3 mb-3" onClick={() => {handleToolChoice(course)}}>Add Tool</Button>
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
