import React from 'react'
import { useParams } from 'react-router'
import { Container } from 'reactstrap'
import LTIToolForm from '../../../Components/Forms/LTIToolForm'


const LTITool = () => {
    const {tool} = useParams();

    return(
        <Container>
            <h2 className="table-title mt-3 mb-3 p-3">LTI 1.3 Tool</h2>
            <LTIToolForm toolId={tool}></LTIToolForm>
        </Container>
    )
}
/*

1. POST - Request to LTIaaS `/api/launch/core`
    1. `clientId`
    2. `context`
    3. `user`
    4. `launchEndpoint` - Optional
    5. `personalData` - Optional
    6. `customParameters` - Optional
    returns self-submitting form

*/


export default LTITool;