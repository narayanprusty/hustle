import React from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import Main from "../main/Main";
import { Meteor } from "meteor/meteor";
import Notifications from "react-notify-toast";

import Register from "../../pages/register/Register";
import EmailVerification from "../../pages/EmailVerification/EmailVerification";
import Login from "../../pages/login/Login";
import Track from "../../pages/Track/Track";
import ForgotPassword from "../../pages/ForgotPassword/ForgotPassword";

requireAuth = RouteComponent => {
    return () => {
        return Meteor.userId() ? <RouteComponent /> : <Redirect to="/login" />;
    };
};

requireNotLoggedIn = RouteComponent => {
    return () => {
        return Meteor.userId() ? (
            <Redirect
                to={
                    localStorage.getItem("driverMode")
                        ? "/app/driver/newreqs"
                        : "/app/home"
                }
            />
        ) : (
            <RouteComponent />
        );
    };
};

const App = () => (
    <BrowserRouter>
        <Switch>
            <Route exact path="/" render={() => <Redirect to="/login" />} />
            <Route
                exact
                path="/login"
                render={this.requireNotLoggedIn(Login)}
            />
            <Route exact path="/track" render={Track} />
            <Route
                exact
                path="/signup"
                render={this.requireNotLoggedIn(Register)}
            />
            <Route
                exact
                path="/forgotpassword"
                render={this.requireNotLoggedIn(ForgotPassword)}
            />
            <Route
                exact
                path="/app"
                render={() => (
                    <Redirect
                        to={
                            localStorage.getItem("driverMode")
                                ? "/app/driver/newreqs"
                                : "/app/home"
                        }
                    />
                )}
            />
            <Route exact path="/app/*" render={this.requireAuth(Main)} />
        </Switch>
    </BrowserRouter>
);

export default App;
