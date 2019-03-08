import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { notify } from "react-notify-toast";
import Ratings from "react-rating";
import LaddaButton, { L, SLIDE_UP } from "react-ladda";
import { Meteor } from "meteor/meteor";
import "./Profile_client.scss";
import { S } from "react-ladda/dist/constants";

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = { value: "", avgUserRating: 0, avgRating: 0 };
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
                        this.setState(driverData);
                    }
                );
            } else {
                this.setState(data);
            }
        });
    };

    handleClickAction = () => {
        this.setState({ update_loader: true });
        Meteor.call(
            "changeName",
            Meteor.userId(),
            this.state.name,
            (err, data) => {
                if (err) {
                    this.setState({ update_loader: false });

                    return notify.show("unable to update", "error");
                }
                this.setState({ update_loader: false });

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
    handleAvatarChange = e => {
        this.setState({
            avatar: URL.createObjectURL(e.target.files[0]),
            fileName: e.target.files[0].name
        });
    };
    render() {
        return (
            <div
                className=""
                style={{
                    height: "100%"
                }}
            >
                <div className="padding">
                    <h3 className="padding">
                        <i className="fa fa-user" aria-hidden="true" /> Profile
                    </h3>
                </div>

                <div className="padding-left padding-bottom padding-right">
                    <div className="list">
                        {!this.isDriver && (
                            <div className="item item-avatar item-button-right">
                                <img
                                    src={
                                        this.state.avatar
                                            ? this.state.avatar
                                            : "/images/profile.png"
                                    }
                                />

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
                            </div>
                        )}
                        <div className="item item-avatar item-icon-left item-button-right">
                            {!this.isDriver && (
                                <i
                                    className="icon fa fa-user"
                                    aria-hidden="true"
                                />
                            )}{" "}
                            {this.isDriver && (
                                <img
                                    src={
                                        this.state.avatar
                                            ? this.state.avatar
                                            : "/images/profile.png"
                                    }
                                />
                            )}
                            {!this.isDriver && " Name"}
                            <span className="item-note">
                                {this.state.name || "Loading..."}
                            </span>
                            <button
                                className="button button-positive"
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
                                <i className="fa fa-edit" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="item item-icon-left">
                            <i
                                className="icon fa fa-phone"
                                aria-hidden="true"
                            />{" "}
                            Phone
                            <span className="item-note">
                                {this.state.phone || "Loading..."}
                            </span>
                        </div>
                        {this.isDriver && (
                            <div className="item item-icon-left">
                                <i
                                    className="icon fa fa-user"
                                    aria-hidden="true"
                                />{" "}
                                User Type
                                <span className="item-note">Driver</span>
                            </div>
                        )}
                        {this.isDriver && (
                            <div className="item item-icon-left">
                                <i
                                    className="icon fa fa-car"
                                    aria-hidden="true"
                                />{" "}
                                Car Model
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
                                Car Number
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
                                Avg Ratings as Driver
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
                        )}

                        <div className="item item-icon-left">
                            <i className="icon fa fa-star" aria-hidden="true" />{" "}
                            Avg Ratings as User
                            <span className="item-note">
                                <Ratings
                                    start={0}
                                    stop={5}
                                    emptySymbol="fa fa-star-o fa-2x empty"
                                    fullSymbol="fa fa-star fa-2x full"
                                    initialRating={Number(this.state.avgRating)}
                                    readonly
                                    style={{
                                        fontSize: "10px"
                                    }}
                                />
                            </span>
                        </div>
                    </div>
                    {this.state.isEdit && (
                        <div className="list">
                            <labl>{this.state.placeholder}</labl>
                            <span className="item item-input">
                                <input
                                    type="text"
                                    name={this.state.name_input}
                                    placeholder={this.state.placeholder}
                                    defaultValue={this.state.value}
                                    onChange={e => {
                                        if (e.target.value.length > 0) {
                                            this.setState({
                                                [e.target.name]: e.target.value
                                            });
                                        }
                                    }}
                                />
                            </span>
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
                                <i className="icon fa fa-check" /> Update
                            </LaddaButton>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
export default withRouter(Profile);
