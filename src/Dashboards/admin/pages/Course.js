import React from 'react'
import { useParams } from 'react-router'
import { Container } from 'reactstrap'
import CourseContainer from '../../../Components/Containers/CourseContainer';


const Course = (props) => {
    const {course} = useParams();
    return(
        <Container>
            <h2 className="table-title mt-3 mb-3 p-3">Course</h2>
            <CourseContainer title={course} auth={props.auth}></CourseContainer>
        </Container>
    )
}


export default Course;