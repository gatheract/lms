import React, { useState } from 'react'
import {Card, CardBody, CardTitle, Button, Row, Col, CardSubtitle, Container} from 'reactstrap'
import { connect } from 'react-redux'
import { firestoreConnect } from 'react-redux-firebase'
import { compose } from 'redux'
import CustomModal from '../../Components/Modal'
import { removeLTITool } from '../../Store/actions/LTIToolActions'



const LTIToolCard = ({tools, removeLTITool, admin}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [working, setWorking] = useState(false)
    const LTIAAS_HOSTNAME = "lms.test-br.ltiaas.com";
    
    const handleLTIToolRemoval = (tool) => {
        setWorking(true);
        removeLTITool(tool);
        setIsOpen(false);
        setWorking(false);
    }

    const toggle = () => setIsOpen(!isOpen)

    return(
        <React.Fragment>
        <Row md="12">
            {tools && tools.map((c) =>
                <Col md='6' key={c.id}>
                    <Card className="course-card">
                        <CardBody>
                            <CardTitle className="course-t"><strong>{c.name}</strong></CardTitle>
                            <CardSubtitle className="mb-4 subtitle">{c.description}</CardSubtitle>
                            <CardSubtitle className="mb-2 subtitle">ClientId: <pre>{c.clientId}</pre></CardSubtitle>
                            <CardSubtitle className="mb-2 subtitle">url: <pre>https://{LTIAAS_HOSTNAME}</pre></CardSubtitle>
                            <CardSubtitle className="mb-2 subtitle">authenticationEndpoint: <pre>https://{LTIAAS_HOSTNAME}/lti/authenticate</pre></CardSubtitle>
                            <CardSubtitle className="mb-2 subtitle">accesstokenEndpoint: <pre>https://{LTIAAS_HOSTNAME}/lti/authorize</pre></CardSubtitle>
                            <CardSubtitle className="mb-2 subtitle">authorizationServer: <pre>https://{LTIAAS_HOSTNAME}/lti/authorize</pre></CardSubtitle>
                            <CardSubtitle className="mb-2 subtitle">authConfig Method: <pre>JWK_SET</pre></CardSubtitle>
                            <CardSubtitle className="mb-2 subtitle">authConfig Key: <pre>https://{LTIAAS_HOSTNAME}/lti/keys</pre></CardSubtitle>
                            <Button  color="primary" className="mr-3">
                                <a href={`/tools/${c.id}`} className="link">
                                    Edit
                                </a>
                            </Button>
                            <Button onClick={toggle} color="danger">Delete</Button>
                        </CardBody>
                    </Card> 
                    <CustomModal toggle={toggle} modal={isOpen} title="Remove LTITool">
                        <Container>
                            <h4>Are you sure?</h4>
                            <Button disabled={working} color="danger" className="card-button w-25" onClick={() => handleLTIToolRemoval(c)}>Yes</Button>
                            <Button color="primary" className="card-button w-25 ml-2 mr-2" onClick={toggle}>No</Button>
                        </Container>
                    </CustomModal>
                </Col>
            )}
        </Row>
        </React.Fragment>
    )
}


const mapStateToProps = (state) => {
    return{
        tools: state.firestore.ordered.tools,
    }   
}

const mapDispatchToProps = (dispatch) => {
    return({
        removeLTITool: (tool) => {
            dispatch(removeLTITool(tool))
        }
    })
}


export default compose(connect(mapStateToProps, mapDispatchToProps), firestoreConnect((props) => [
    {
        collection: 'tools',
        storeAs: 'tools'
    }
]))(LTIToolCard);
