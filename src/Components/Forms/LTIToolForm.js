import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import { Button, Col, Container, Form, Input, Label, Row } from "reactstrap";
import { addLTITool } from "../../Store/actions/LTIToolActions";
import { compose } from "redux";
import useFormResettable from "../../Hooks/useFormResettable";
import { useForm } from "react-hook-form";

const dummy = {
  name: "",
  description: "",
  launchURL: "",
  launchEndpoint: "",
  loginEndpoint: "",
  deeplinkingEndpoint: "",
  redirectionUris: "",
  authConfigMethod: "",
  authConfigKey: "",
  permissions_MEMBERSHIPS_READ: "",
  permissions_LINEITEMS_READ: "",
  permissions_LINEITEMS_READ_WRITE: "",
  permissions_GRADES_READ: "",
  permissions_GRADES_WRITE: "",
  personalData: "NONE",
  customParameters: "",
  active: false,
  id: "",
};

const LTIToolForm = ({ toolId, addLTITool }) => {
  let currentTool = dummy;

  const [inSubmit, setInSubmit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveComplete, setSaveComplete] = useState(false);

  const handleTool = (inputs) => {
    setInSubmit(true);
    console.log(currentTool);
    currentTool = inputs;
    addLTITool(inputs);
    setSaveComplete(true);
  };

  const fetchTool = async (toolId) => {
    setLoading(true);
    const data = {
      id: toolId
    }
    const postData = JSON.stringify(data);
    if(toolId !== "new") {
      const res = await fetch('https://us-central1-ltiaas-lms.cloudfunctions.net/getTool', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Content-Type': 'application/json'
        },
        body: postData
      })
      const result = await res.json();
      console.log(result.result)
      setValue('name', result.result.name);
      setValue('description', result.result.description);
      setValue('launchURL', result.result.launchURL);
      setValue('launchEndpoint', result.result.launchEndpoint);
      setValue('loginEndpoint', result.result.loginEndpoint);
      setValue('deeplinkingEndpoint', result.result.deeplinkingEndpoint);
      setValue('redirectionUris', result.result.redirectionUris);
      setValue('authConfigMethod', result.result.authConfig.ethod);
      setValue('authConfigKey', result.result.authConfig.key);
      /*setValue('permissions_MEMBERSHIPS_READ', result.result.);
      setValue('permissions_LINEITEMS_READ', result.result.);
      setValue('permissions_LINEITEMS_READ_WRITE', result.result.);
      setValue('permissions_GRADES_READ', result.result.);
      setValue('permissions_GRADES_WRITE', result.result.);
      setValue('personalData', result.result.);
      setValue('customParameters', result.result.customParameters.join(','));*/
      setValue('active', result.result.active);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (toolId) {
      fetchTool(toolId);
    }
  }, [toolId]);

  const { register, handleSubmit, setValue } = useForm();

  if (saveComplete) return <Redirect to={`/tools/${currentTool.id}`}></Redirect>;

  return (
    <Form onSubmit={handleSubmit(handleTool)}>
      <Container>
        <Col>
          {loading && <Row className="mt-2">
            <h3>Loading...</h3>
          </Row>}
          <Row className="mt-2">
            <Label htmlFor="name">Name</Label>
            <Input type="text" name="name" innerRef={register}></Input>
          </Row>
          <Row className="mt-2">
            <Label htmlFor="description">Description</Label>
            <Input
              type="text"
              name="description"
              innerRef={register}
            ></Input>
          </Row>
          <Row className="mt-2">
            <Label htmlFor="launchEndpoint">launchEndpoint</Label>
            <Input
              type="text"
              name="launchEndpoint"
              innerRef={register}
            ></Input>
          </Row>
          <Row className="mt-2">
            <Label htmlFor="loginEndpoint">loginEndpoint</Label>
            <Input
              type="text"
              name="loginEndpoint"
              innerRef={register}
            ></Input>
          </Row>
          <Row className="mt-2">
            <Label htmlFor="deeplinkingEndpoint">deeplinkingEndpoint</Label>
            <Input
              type="text"
              name="deeplinkingEndpoint"
              innerRef={register}
            ></Input>
          </Row>
          <Row className="mt-2">
            <Label htmlFor="redirectionUris">redirectionUris</Label>
            <Input
              type="text"
              name="redirectionUris"
              placeholder="URI1,URI2,..."
              innerRef={register}
            ></Input>
          </Row>
          <Row className="mt-2">
            <Label htmlFor="authConfigMethod">authConfig Method</Label>
            <Input
              type="select"
              name="authConfigMethod"
              innerRef={register}
            >
              <option value="JWK_KEY">JWK_KEY</option>
              <option value="JWK_SET">JWK_SET</option>
              <option value="RSA_KEY">RSA_KEY</option>
            </Input>
          </Row>
          <Row className="mt-2">
            <Label htmlFor="authConfigKey">authConfig Key</Label>
            <Input
              type="text"
              name="authConfigKey"
              innerRef={register}
            ></Input>
          </Row>
          <Row className="mt-2">
            <h5 className="table-title mt-3 mb-3 p-3">Permissions</h5>
          </Row>
          <Row className="mt-2">
            <Label htmlFor="permissions_MEMBERSHIPS_READ">
              MEMBERSHIPS_READ
            </Label>
            <Input
              type="checkbox"
              name="permissions_MEMBERSHIPS_READ"
              innerRef={register}
            ></Input>
          </Row>
          <Row className="mt-2">
            <Label htmlFor="permissions_LINEITEMS_READ">LINEITEMS_READ</Label>
            <Input
              type="checkbox"
              name="permissions_LINEITEMS_READ"
              innerRef={register}
            ></Input>
          </Row>
          <Row className="mt-2">
            <Label htmlFor="permissions_LINEITEMS_READ_WRITE">
              LINEITEMS_READ_WRITE
            </Label>
            <Input
              type="checkbox"
              name="permissions_LINEITEMS_READ_WRITE"
              innerRef={register}
            ></Input>
          </Row>
          <Row className="mt-2">
            <Label htmlFor="permissions_GRADES_READ">GRADES_READ</Label>
            <Input
              type="checkbox"
              name="permissions_GRADES_READ"
              innerRef={register}
            ></Input>
          </Row>
          <Row className="mt-2">
            <Label htmlFor="permissions_GRADES_WRITE">GRADES_WRITE</Label>
            <Input
              type="checkbox"
              name="permissions_GRADES_WRITE"
              innerRef={register}
            ></Input>
          </Row>
          <Row className="mt-2">
            <Label htmlFor="personalData">personalData</Label>
            <Input type="select" name="personalData" innerRef={register}>
              <option value="NONE">NONE</option>
              <option value="EMAIL">EMAIL</option>
              <option value="NAME">NAME</option>
              <option value="COMPLETE">COMPLETE</option>
            </Input>
          </Row>
          <Row className="mt-2">
            <Label htmlFor="customParameters">customParameters</Label>
            <Input
              type="text"
              name="customParameters"
              placeholder="key=value,key=value,..."
              innerRef={register}
            ></Input>
          </Row>
          <Row className="mt-2">
            <Label htmlFor="active">active</Label>
            <Input type="select" name="active" innerRef={register}>
              <option value="false">Disabled</option>
              <option value="true">Active</option>
            </Input>
          </Row>
        </Col>
        <Button
          color="primary"
          type="submit"
          className="mt-4"
          disabled={inSubmit}
        >
          {inSubmit ? <>Saving...</> : <>Update Tool</>}
        </Button>
      </Container>
    </Form>
  );
};

const mapStateToProps = (state) => {
  return {
    tools: state.firestore.ordered.tools,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addLTITool: (tool) => {
      dispatch(addLTITool(tool));
    },
  };
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  LTIToolForm
);
