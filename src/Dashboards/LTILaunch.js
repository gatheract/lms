import React from 'react'
import { Container } from 'reactstrap'
import {Redirect} from 'react-router-dom'
import {connect} from 'react-redux';
import CustomAlert from '../Components/Alert';

class LTILaunch extends React.Component{

    render(){
        const {auth, authError} = this.props;
        if(!auth.uid) return (<Redirect to="/login"></Redirect>)
        
        fetch('https://us-central1-ltiaas-lms.cloudfunctions.net/LTILaunch', {
            method: 'POST',
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            //data: post_data
        }).then(response => {
            document.write(response.form);
        })

              

        return(
            <Container className="mt-4 mb-4">
                <h1 className="table-title mt-3 mb-3">Loading...</h1>
                {authError && <CustomAlert color="danger" alert={authError} authError></CustomAlert>}
            </Container>        
        )
    }
}

const mapStateToProps = (state) =>{
    return{
        auth : state.firebase.auth,
        authError: state.auth.authError,
    }
}

export default connect(mapStateToProps,null)(LTILaunch);
