import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { notify } from "react-notify-toast";
import Ratings from "react-rating";
import LaddaButton, { L, SLIDE_UP } from "react-ladda";
import { Meteor } from "meteor/meteor";
import "./Profile_client.scss";
import localizationManager from "../../localization";
import CarLoader from "../../components/CarLoader/CarLoader";

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: "",
            avgUserRating: 0,
            avgRating: 0,
            loader: true
        };
        this.isDriver = false;
    }

    componentDidMount = () => {
        Meteor.call("riderDetails", Meteor.userId(), (err, data) => {
            if (err) {
                return notify.show("unable to get details", "error");
            }
            if (data.userType == "Driver") {
                this.isDriver = true;
                Meteor.call(
                    "driverDetails",
                    Meteor.userId(),
                    (err, driverData) => {
                        if (err) {
                            return notify.show(
                                "unable to get details",
                                "error"
                            );
                        }
                        this.setState({
                            ...data,
                            ...driverData,
                            riderEmail: data.riderEmail,
                            loader: false
                        });
                    }
                );
            } else {
                this.setState({ ...data, loader: false });
            }
        });
    };

    handleClickAction = () => {
        this.setState({ update_loader: true });
        Meteor.call(
            "changeNameAndEmail",
            Meteor.userId(),
            this.state.name,
            this.state.riderEmail,
            (err, data) => {
                if (err) {
                    this.setState({ update_loader: false });

                    return notify.show("unable to update", "error");
                }
                this.setState({ update_loader: false, isEdit: false });

                return notify.show("Updated successfully", "success");
            }
        );
    };

    getSignedUrl = (file, callback) => {
        console.log("here you go");
        const params = {
            objectName: file.name,
            contentType: file.type
        };
        Meteor.call("uploadProfilePic", file.name, (err, data) => {
            if (err) {
                return notify.show("unable to process", "error");
            }
            return callback(null, data);
        });
    };
    getBase64 = file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    tryToUpload = () => {
        this.setState({
            change_loader: true
        });
        var userId = Meteor.user()._id;

        document.getElementById("avatar").click();
    };
    handleAvatarChange = e => {
        this.setState({
            avatar: URL.createObjectURL(e.target.files[0]),
            fileName: e.target.files[0].name
        });

        var userId = Meteor.user()._id;

        var file = document.getElementById("avatar").files[0];
        this.getBase64(file)
            .then(fileBase => {
                const fileName =
                    userId +
                    "." +
                    document.getElementById("avatar").files[0].name.split(".")[
                        document
                            .getElementById("avatar")
                            .files[0].name.split(".").length - 1
                    ];

                Meteor.call("uploadeFile", fileBase, fileName, (err, data) => {
                    if (err) {
                        this.setState({
                            change_loader: false
                        });
                        console.log(err);
                        notify.show(
                            "Upload failed,please try again after sometime.",
                            "error"
                        );
                        return false;
                    }
                    console.log(data.Location);
                    Meteor.users.update(Meteor.userId(), {
                        $set: { "profile.avatar": data.Location }
                    });
                    this.setState({
                        change_loader: false,
                        avatar: data.Location
                    });

                    notify.show("Profile Picture Updated", "success");
                });
            })
            .catch(err => {
                this.setState({
                    change_loader: false
                });
                notify.show(
                    "Upload failed,please try again after sometime.",
                    "error"
                );
            });
    };
    render() {
        console.log(this.state.isEdit)
        return (
            <div
                className=""
                style={{
                    height: "100%"
                }}
            >
                <div className="padding">
                    <h3 className="padding">
                        <i className="fa fa-user" aria-hidden="true" />{" "}
                        {localizationManager.strings.profile}
                    </h3>
                </div>
                {this.state.loader && <CarLoader />}
                {!this.isDriver && !this.state.loader && (
                    <div
                        style={{
                            textAlign: "center"
                        }}
                    >
                        <img
                            style={{
                                height: "120px",
                                borderRadius: "120px",
                                width: "120px"
                            }}
                            src={
                                this.state.avatar
                                    ? this.state.avatar
                                    : "/images/profile.png"
                            }
                        />
                        <br />
                        <u>
                            <a
                                href="javascript:void(0);"
                                onClick={this.tryToUpload}
                            >
                                <i className="fa fa-edit" aria-hidden="true" />{" "}
                                {localizationManager.strings.edit}
                            </a>
                        </u>
                        <br />
                        <input
                            type="file"
                            accept="image/*"
                            name="avatar"
                            id="avatar"
                            className="custom-file-input"
                            onChange={this.handleAvatarChange}
                            hidden={true}
                        />
                        <div style={{ marginBottom: "16px" }} />
                        {/*<div className="item item-avatar item-button-right">
                            <label className="custom-file-input">
                                {this.state.fileName
                                    ? "  " + this.state.fileName
                                    : "  Browse"}
                                <input
                                    type="file"
                                    accept="image/*"
                                    name="avatar"
                                    id="avatar"
                                    className="custom-file-input"
                                    onChange={this.handleAvatarChange}
                                    hidden={true}
                                />
                            </label>

                            <LaddaButton
                                loading={this.state.change_loader}
                                data-color="##FFFF00"
                                data-size={S}
                                data-style={SLIDE_UP}
                                data-spinner-size={30}
                                data-spinner-color="#ddd"
                                data-spinner-lines={12}
                                className="button button-positive"
                                onClick={this.tryToUpload}
                            >
                                Change
                            </LaddaButton>
                        </div>*/}
                    </div>
                )}

                {!this.state.loader && (
                    <div className="padding-left padding-bottom padding-right">
                        {!this.state.isEdit &&
                            <div className="list">
                                <div className="item item-icon-left">
                                    <i
                                        className="icon fa fa-user"
                                        aria-hidden="true"
                                    />{" "}
                                    {localizationManager.strings.name}
                                    <span className="item-note">
                                        {this.state.name || "Loading..."}
                                    </span>
                                </div>
                                <div className="item item-icon-left">
                                    <i
                                        className="icon fa fa-phone"
                                        aria-hidden="true"
                                    />{" "}
                                    {localizationManager.strings.phone}
                                    <span className="item-note">
                                        {this.state.phone || "Loading..."}
                                    </span>
                                </div>
                                <div className="item item-icon-left">
                                    <i
                                        className="icon fa fa-at"
                                        aria-hidden="true"
                                    />{" "}
                                    {localizationManager.strings.email}
                                    <span className="item-note">
                                        {this.state.riderEmail
                                            ? this.state.riderEmail
                                            : this.state.riderEmail == null
                                            ? "-"
                                            : "Loading..."}
                                    </span>
                                </div>
                                {this.isDriver && (
                                    <div className="item item-icon-left">
                                        <i
                                            className="icon fa fa-user"
                                            aria-hidden="true"
                                        />{" "}
                                        {localizationManager.strings.userType}
                                        <span className="item-note">
                                            {localizationManager.strings.userType}
                                        </span>
                                    </div>
                                )}
                                {this.isDriver && (
                                    <div className="item item-icon-left">
                                        <i
                                            className="icon fa fa-car"
                                            aria-hidden="true"
                                        />{" "}
                                        {localizationManager.strings.carModel}
                                        <span className="item-note">
                                            {this.state.carModel || "Loading..."}
                                        </span>
                                    </div>
                                )}
                                {this.isDriver && (
                                    <div className="item item-icon-left">
                                        <i
                                            className="icon fa fa-text-width"
                                            aria-hidden="true"
                                        />{" "}
                                        {localizationManager.strings.carNumber}{" "}
                                        <span className="item-note">
                                            {this.state.carNumber || "Loading..."}
                                        </span>
                                    </div>
                                )}

                                {this.isDriver && (
                                    <div className="item item-icon-left">
                                        <i
                                            className="icon fa fa-star"
                                            aria-hidden="true"
                                        />{" "}
                                        {localizationManager.strings.arad}
                                        <span className="item-note">
                                            <Ratings
                                                start={0}
                                                stop={5}
                                                emptySymbol="fa fa-star-o fa-2x empty"
                                                fullSymbol="fa fa-star fa-2x full"
                                                initialRating={this.state.avgRating}
                                                readonly
                                                style={{
                                                    fontSize: "10px"
                                                }}
                                            />
                                        </span>
                                    </div>
                                )}

                                <div className="item item-icon-left">
                                    <i
                                        className="icon fa fa-star"
                                        aria-hidden="true"
                                    />{" "}
                                    {localizationManager.strings.arau}
                                    <span className="item-note">
                                        <Ratings
                                            start={0}
                                            stop={5}
                                            emptySymbol="fa fa-star-o fa-2x empty"
                                            fullSymbol="fa fa-star fa-2x full"
                                            initialRating={Number(
                                                this.state.avgUserRating
                                            )}
                                            readonly
                                            style={{
                                                fontSize: "10px"
                                            }}
                                        />
                                    </span>
                                </div>
                            </div>
                        }
                        

                        {!this.state.isEdit && (
                            <button
                                className="button button-block button-positive"
                                onClick={() => {
                                    if (this.state.isEdit) {
                                        this.setState({ isEdit: false });
                                    } else {
                                        this.setState({
                                            isEdit: true,
                                            placeholder: "name",
                                            name_input: "name",
                                            value: this.state.name
                                        });
                                    }
                                }}
                            >
                                <i className="fa fa-edit" aria-hidden="true" />{" "}
                                {localizationManager.strings.editProfile}
                            </button>
                        )}

                        {this.state.isEdit && (
                            <div>
                                <span className="seperator padding-left padding-right padding-bottom">
                                    &nbsp;&nbsp;
                                    {localizationManager.strings.editInfo}
                                    &nbsp;&nbsp;
                                </span>
                                <div
                                    style={{
                                        marginBottom: "8px"
                                    }}
                                />
                                <label className="item item-input item-stacked-label">
                                    <span className="input-label">
                                        {localizationManager.strings.name}
                                    </span>
                                    <input
                                        type="text"
                                        name={this.state.name_input}
                                        placeholder={this.state.placeholder}
                                        defaultValue={this.state.value}
                                        onChange={e => {
                                            if (e.target.value.length > 0) {
                                                this.setState({
                                                    [e.target.name]:
                                                        e.target.value
                                                });
                                            }
                                        }}
                                    />
                                </label>
                                <label className="item item-input item-stacked-label">
                                    <span className="input-label">
                                        {localizationManager.strings.email}
                                    </span>
                                    <input
                                        type="text"
                                        name="riderEmail"
                                        placeholder="User Email"
                                        defaultValue={this.state.riderEmail}
                                        onChange={e => {
                                            if (e.target.value.length > 0) {
                                                this.setState({
                                                    [e.target.name]:
                                                        e.target.value
                                                });
                                            }
                                        }}
                                    />
                                </label>
                                <LaddaButton
                                    className="button button-block button-balanced"
                                    loading={this.state.update_loader}
                                    onClick={this.handleClickAction}
                                    data-color="##FFFF00"
                                    data-size={L}
                                    data-style={SLIDE_UP}
                                    data-spinner-size={30}
                                    data-spinner-color="#ddd"
                                    data-spinner-lines={12}
                                >
                                    <i className="icon fa fa-check" />{" "}
                                    {localizationManager.strings.update}
                                </LaddaButton>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
}
export default withRouter(Profile);
