import React from "react";
import { functions } from "../config/fbConfig";
import { withRouter } from "react-router";

class LTIDeepLinkingValidate extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      lti_target: "",
      lti_state: "",
      lti_id_token: ""
    };
  }

  componentWillMount() {
    const querys = this.props.location.search.split("=");
    const payload = querys[1];
    this.sendPost(payload);
  }

  async sendPost(payload) {
    console.log("starting");
    console.log(this.props);
    const Validate = functions.httpsCallable("LTIDeepLinkingValidate");
    const res = await Validate({
      uid: this.props.uid,
      payload: payload,
    });
    this.setState(
      {
        lti_target: res.data.target,
        lti_state: res.data.state,
        lti_id_token: res.data.idtoken
      },
      this.submitForm
    );
    
  }

  submitForm() {
    document.getElementById("ltiaas_idtoken").submit();
  }

  render() {
    return (
      <form
        id="ltiaas_idtoken"
        style={{display: "none"}}
        action={this.state.lti_target}
        method="POST"
      >
        <input
          type="hidden"
          name="state"
          value={this.state.lti_state}
        />
        <input
          type="hidden"
          name="id_token"
          value={this.state.lti_id_token}
        />
      </form>
    );
  }
}

export default withRouter(LTIDeepLinkingValidate);
