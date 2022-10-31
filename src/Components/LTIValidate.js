import React from "react";
import { functions } from "../config/fbConfig";
import { withRouter } from "react-router";

class LTIValidate extends React.Component {
  componentWillMount() {
    const querys = this.props.location.search.split("=");
    const payload = querys[1];
    this.sendPost(payload);
  }

  async sendPost(payload) {
    console.log("starting");
    console.log(this.props);
    const Validate = functions.httpsCallable("LTIValidate");
    const res = await Validate({
      uid: this.props.uid,
      payload: payload,
    });
    const form = res.data;
    //document.body.append(form);
    document.getElementById("ltiaas_idtoken").submit();
  }

  render() {
    return (
      <form
        id="ltiaas_idtoken"
        style={{display: "none"}}
        action="https://test-ltiaas.ltiaas.com/lti/launch"
        method="POST"
      >
        <input
          type="hidden"
          name="state"
          value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzIjoialJNRmdkWi5sdGdya1dkT2RJVElEY2hrWlVFZ3R2cnUiLCJxIjoiIiwiaWF0IjoxNjY3MTY3MzgwLCJleHAiOjE2NjcxNjc5ODB9.I7psybPklQQ9Fku2Op9xaJrb0O_Zy3IbYEIU1XAgziA"
        />
        <input
          type="hidden"
          name="id_token"
          value="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlJ2Z1paODk2akRLTkkzdWtxWUFaIn0.eyJpc3MiOiJodHRwczovL3Rlc3QtY29uc3VtZXIubHRpYWFzLmNvbSIsImF1ZCI6IlJ2Z1paODk2akRLTkkzdWtxWUFaIiwic3ViIjoicVdCbkJreUU2Y1NlZnowZ0FQVjZUUEs4TlJ0MiIsIm5vbmNlIjoiaHluRUR1b2M2fkk1MVlZcFBJakpFM1VILTQ2VWJPRUIiLCJuYW1lIjoiQWRtaW4iLCJnaXZlbl9uYW1lIjoiQWRtaW4iLCJlbWFpbCI6ImFkbWluQGx0aWFhcy5jb20iLCJodHRwczovL3B1cmwuaW1zZ2xvYmFsLm9yZy9zcGVjL2x0aS9jbGFpbS9kZXBsb3ltZW50X2lkIjoiZ3IydWJoUjJoVElnTE1-TzNxT3gxVjZyZ0diNU5nUUciLCJodHRwczovL3B1cmwuaW1zZ2xvYmFsLm9yZy9zcGVjL2x0aS9jbGFpbS92ZXJzaW9uIjoiMS4zLjAiLCJodHRwczovL3B1cmwuaW1zZ2xvYmFsLm9yZy9zcGVjL2x0aS9jbGFpbS9tZXNzYWdlX3R5cGUiOiJMdGlSZXNvdXJjZUxpbmtSZXF1ZXN0IiwiaHR0cHM6Ly9wdXJsLmltc2dsb2JhbC5vcmcvc3BlYy9sdGkvY2xhaW0vdGFyZ2V0X2xpbmtfdXJpIjoiaHR0cHM6Ly90ZXN0LWx0aWFhcy5sdGlhYXMuY29tL2x0aS9sYXVuY2giLCJodHRwczovL3B1cmwuaW1zZ2xvYmFsLm9yZy9zcGVjL2x0aS9jbGFpbS9jdXN0b20iOnt9LCJodHRwczovL3B1cmwuaW1zZ2xvYmFsLm9yZy9zcGVjL2x0aS9jbGFpbS9jb250ZXh0Ijp7ImlkIjoiMjAyMkNTRWE1ZTZjNDMxYjkxIiwibGFiZWwiOiJDU0UiLCJ0aXRsZSI6IkNTIDEwMSJ9LCJodHRwczovL3B1cmwuaW1zZ2xvYmFsLm9yZy9zcGVjL2x0aS9jbGFpbS9yZXNvdXJjZV9saW5rIjp7ImlkIjoiUnZnWlo4OTZqREtOSTN1a3FZQVoiLCJ0aXRsZSI6IkxUSUFBUyBUZXN0IFRvb2wiLCJkZXNjcmlwdGlvbiI6IkxUSUFBUyBUZXN0IFRvb2wifSwiaHR0cHM6Ly9wdXJsLmltc2dsb2JhbC5vcmcvc3BlYy9sdGkvY2xhaW0vcm9sZXMiOlsiaHR0cDovL3B1cmwuaW1zZ2xvYmFsLm9yZy92b2NhYi9saXMvdjIvbWVtYmVyc2hpcCNJbnN0cnVjdG9yIl0sImlhdCI6MTY2NzE2NzM4OSwiZXhwIjoxNjY3MjUzNzg5fQ.Fel4y-CpMI1yyfPkHrt0bMs1c85g-S5MNvw8D3cyefqtmJFgUrwVOOXJaDehQ5q4_vtafeqkK5tI2L0l5b8eKdkV63toEcMIiPp7T-quaff060zs9-4Zvn1Zd_T6hFbZDiXBmlbSXzGCa2EY8ZwO2Q37yoZEdgdLD9nUDAKAnWOFlX2MoLjK1oPWn1ORijFVNDdvddQ62f4uMMkSdtiw6CdqHWCD75SO2a0LKXJgGiX5_ZErE7jzu_l3VIThqWv71MlMU_7mnmZEdHLEmaOdR-U4zfvxfSHLemJBXi4WESnBdfXPrKeCUcC1EIsnMv6tk83w36p2wIi5-I5Ic4c1kg"
        />
      </form>
    );
  }
}

export default withRouter(LTIValidate);
