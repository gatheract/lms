import React, { useState } from 'react'
import { connect } from 'react-redux'
import { firestoreConnect } from 'react-redux-firebase'
import { Button, Col, Row } from 'reactstrap'
import { compose } from 'redux'
import ResourceCard from '../Cards/ResourceCard'
import CourseToolCard from '../Cards/CourseToolCard'
import VideoCard from '../Cards/VideoCard'
import AddResourcesForm from '../Forms/AddResourceForm'
import AddVideoForm from '../Forms/AddVideoForm'
import AddLTIToolForm from '../Forms/AddLTIToolForm'
import CustomModal from '../Modal'


const dummy = {
    title: 'Test Course',
    branch: 'CSE',
    teacher: 'John Doe',
    courseId: ''
}


const CourseContainer = ({course, profile, auth}) => {

    const currentCourse = course ? course[0] : dummy
    const isStudent = profile.userType === 'Student' ? true :  false;

    const [isVideoFormOpen, setIsVideoFormOpen] = useState(false);
    const [isResourcesFormOpen, setIsResourcesFormOpen] = useState(false);
    const [isToolsFormOpen, setIsToolsFormOpen] = useState(false);

    const videoFormToggle = () => setIsVideoFormOpen(!isVideoFormOpen);
    const resourceFormToggle = () =>  setIsResourcesFormOpen(!isResourcesFormOpen);
    const toolFormToggle = () =>  setIsToolsFormOpen(!isToolsFormOpen);

    return(
        <Col>
            <Row>
                <Col md="4">
                    <h5 className="course-title">Course Title: <span className="c-title">{currentCourse.title || dummy.title}</span></h5>
                    <h5 className="course-title">Branch: <span className="c-title">{currentCourse.branch || dummy.branch}</span></h5>
                    <h5 className="course-title">Course Id: <span className="c-title">{currentCourse.courseId || dummy.courseId}</span></h5>
                    {isStudent ? ''  :<Button onClick={toolFormToggle} className="button mt-2 navy " color="primary">Add LTI Tool</Button>}
                    {isStudent ? ''  : <Button onClick={videoFormToggle} className="button mt-2" color="primary">Add Video</Button>}
                    {isStudent ? ''  :<Button onClick={resourceFormToggle} className="button mt-2" color="primary">Add Resource</Button>}
                </Col>
            </Row>
            <Row className="mt-3 mb-3">
                <Col>
                    <div className="mt-2 mb-3">
                        <h4 className="title">Course LTI Tools</h4>
                    </div>
                    
                    {currentCourse.tools === undefined || currentCourse.tools.length === 0? 
                    <div className="w-100 mb-2 empty-div" style={{"padding":"8px"}}>
                        <p className="center-text">No Course LTI Tools yet!</p>
                    </div>
                    : <CourseToolCard resources={currentCourse.tools} course={course} userId={auth.uid}></CourseToolCard>}
                </Col>
            </Row>
            <Row className="mt-3 mb-3">
                <Col>
                    <div className="mt-2 mb-3">
                        <h4 className="title">Course Videos</h4>
                    </div>
                    {currentCourse.videos === undefined || currentCourse.videos.length === 0 ? 
                    <div className="w-100 mb-2 empty-div" style={{"padding":"8px"}}>
                        <p className="center-text">No Videos yet!</p>
                    </div>
                    :
                    <VideoCard videos={currentCourse.videos} course={course}></VideoCard>
                    }
                </Col>
            </Row>
            <Row className="mt-3 mb-3">
                <Col>
                    <div className="mt-2 mb-3">
                        <h4 className="title">Course Resources</h4>
                    </div>
                    
                    {currentCourse.references === undefined || currentCourse.references.length === 0 ? 
                    <div className="w-100 mb-2 empty-div" style={{"padding":"8px"}}>
                        <p className="center-text">No Course Resources yet!</p>
                    </div>
                    : <ResourceCard resources={currentCourse.references} course={course}></ResourceCard>}
                </Col>
            </Row>
            <CustomModal modal={isVideoFormOpen} title="Add New Video" toggle={videoFormToggle}>
                <AddVideoForm course={course}></AddVideoForm>
            </CustomModal>  
            <CustomModal modal={isResourcesFormOpen} title="Add New Resource" toggle={resourceFormToggle}>
                <AddResourcesForm course={course}></AddResourcesForm>
            </CustomModal>
            <CustomModal modal={isToolsFormOpen} title="Add New LTI Tool" toggle={toolFormToggle}>
                <AddLTIToolForm course={course}></AddLTIToolForm>
            </CustomModal>
        </Col>
  )
}

const mapStateToProps = (state) =>{
    return{
        profile: state.firebase.profile,
        course: state.firestore.ordered.course,
    }
}


export default compose(connect(mapStateToProps), firestoreConnect(
    (props) => [
        {
            collection: 'courses',
            where: ['title', '==', `${props.title}`],
            storeAs: 'course'
        }
    ]    
))(CourseContainer);