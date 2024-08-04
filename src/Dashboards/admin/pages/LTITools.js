import React,{useState} from 'react'
import { connect } from 'react-redux'
import { firestoreConnect } from 'react-redux-firebase'
import { compose } from 'redux'
import { Container, Row, Col, Button, Input} from 'reactstrap'
import LTIToolCard from '../../../Components/Cards/LTIToolCard'
import { doDynamicRegistration } from '../../../Store/actions/LTIToolActions'
import { Alert } from 'react-bootstrap'

const LTITools = ({tools, profile}) => {

    const admin = profile.userType  === 'Admin' ? profile : false;

    const [dynamicRegistrationUrl, setDynamicRegistrationUrl] = useState('')
    const [errorMessage, setErrorMessage] = useState(null);

    const dynamicRegistrationClick = () => doDynamicRegistration(dynamicRegistrationUrl, setErrorMessage);

    const handleChange = (e) => {
        const input = e.target.value.trim();
        setDynamicRegistrationUrl({input});
    }

    return(
        <Container className="mt-4 mb-4">
        <h1 className="table-title mt-3 mb-3">LTI Tools</h1>
        <Row className='m-3'>
            <Row>
                <Col> 
                    {admin &&
                        <>
                            Dynamic Registration URL:{" "}
                            <Input type="dynamicRegistrationUrl" name="dynamicRegistrationUrl" id="dynamicRegistrationUrl" placeholder="Dynamic Registration URL" onChange={handleChange} />
                            <Button onClick={dynamicRegistrationClick} color="primary">
                                    Add New LTI 1.3 Tool (Dynamic Registration)
                            </Button>
                            <br></br>
                            <Button color="secondary">
                                <a href="/tools/new" className="link">
                                    Add New LTI 1.3 Tool Manually
                                </a>
                            </Button>
                        </>
                    }
                </Col>
            </Row>
        </Row>
        {errorMessage && <Alert>{errorMessage}</Alert>}
        <LTIToolCard tools={tools}></LTIToolCard>
     </Container>        
    )
}


const mapStateToProps = (state) => {
    return{
        tools: state.firestore.ordered.tools,
        profile: state.firebase.profile
    }
}



export default compose(connect(mapStateToProps), firestoreConnect([
    {
        collection: 'tools'
    }
])) (LTITools);