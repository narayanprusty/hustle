import React, { Component } from "react";
import queryString from "stringquery";
import { Link } from "react-router-dom";

import "./email_client.scss";

const LinkStatus = {
    Invalid: 1,
    Valid: 2,
    Undefined: 3,
    Redirecting: 5
};

export default class EmailVerification extends Component {
    constructor(props) {
        super(props);

        this.state = {
            linkStatus: LinkStatus.Undefined,
            disabled: false,
            showMessage: false
        };
    }

    componentDidMount() {
        const queries = queryString(this.props.location.search);
        sessionStorage.setItem("key", queries.key);
        if (history.pushState) {
            const newurl =
                window.location.protocol +
                "//" +
                window.location.host +
                window.location.pathname +
                `?action=verification&id=${btoa(
                    `${new Date().getTime()}-${queries.key}`
                )}`;
            window.history.pushState({ path: newurl }, "", newurl);
        }
        Meteor.call("emailVerification", queries.key, (err, res) => {
            if (res) {
                this.setState({
                    linkStatus: LinkStatus.Valid,
                    disabled: true,
                    showMessage: true,
                    resultMessage: (
                        <p>
                            Congrats...!!! Your email has been verified. You
                            would be automatically redirected to login page in 5
                            seconds. Else <a href="/login"> Click here </a>
                        </p>
                    )
                });
                setTimeout(() => {
                    open("/login", "_self");
                }, 2 * 1000);
            } else {
                this.setState({
                    linkStatus: LinkStatus.Invalid,
                    disabled: false,
                    showMessage: true,
                    resultMessage: (
                        <p>
                            Email id does not match or the link has expired.
                            Kindly try again...
                        </p>
                    )
                });
            }
        });
    }

    submitToVerify() {
        this.setState({
            disabled: true,
            showMessage: false
        });
    }

    render() {
        const LoadingView = (
            <div className="root">
                {/* <img src="assets/img/logo/blockcluster.png" alt="logo" width="250" /> */}
                <div id="loader" />
                <br />
                <p style={{ textAlign: "center", fontSize: "1.2em" }}>
                    Hold on... We are validating the email id...
                </p>
            </div>
        );

        const InvalidView = (
            <div className="root" style={{ textAlign: "center" }}>
                {/* <img src="assets/img/logo/blockcluster.png" alt="logo" width="250" /> */}

                <i
                    className="fa fa-warning"
                    style={{
                        color: "#d40000",
                        fontSize: "7em",
                        marginTop: "15px"
                    }}
                />

                <div
                    className="alert alert-danger"
                    style={{ textAlign: "center", marginTop: "15px" }}
                >
                    Oooppsss... <br />
                    Seems like the verification link is invalid. <br />
                </div>
            </div>
        );

        const RedirectingView = (
            <div className="root" style={{ textAlign: "center" }}>
                {/* <img src="assets/img/logo/blockcluster.png" alt="logo" width="250" /> */}

                <i
                    className="fa fa-check-circle"
                    style={{
                        color: "#34db90",
                        fontSize: "7em",
                        marginTop: "15px"
                    }}
                />

                <div
                    className="alert alert-success"
                    style={{ textAlign: "center", marginTop: "15px" }}
                >
                    Congrats...!!! Your email has been verified. Redirecting you
                    to login page...
                </div>

                <p>
                    If not redirected in 5 seconds,{" "}
                    <Link to="/login">Click here to login</Link>
                </p>
            </div>
        );

        let RenderView = LoadingView;
        if (this.state.linkStatus === LinkStatus.Valid) {
            RenderView = RedirectingView;
        } else if (this.state.linkStatus === LinkStatus.Invalid) {
            RenderView = InvalidView;
        }

        return (
            <div className="root">
                <div className="root">{RenderView}</div>
            </div>
        );
    }
}
