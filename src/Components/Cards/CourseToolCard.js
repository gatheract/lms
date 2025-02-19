import React, { useState } from 'react'
import { Button, Card, CardTitle, Col, Row} from 'reactstrap'
import { removeTool } from '../../Store/actions/courseActions';
import { connect } from 'react-redux'
import CourseToolViewer from './CourseToolViewer';

const CourseToolCard = ({resources, course, userId, profile, removeTool}) => {

    const resourceList = resources || [];

    return(
        <>
            {resourceList.map((r) => (
                <Row>
                    <React.Fragment key={r.id}>
                        <Col>
                            <CourseToolViewer tool={r} course={course} userId={userId} profile={profile} removeTool={removeTool}></CourseToolViewer>
                        </Col>
                    </React.Fragment>
                </Row>
            ))}
        </>
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