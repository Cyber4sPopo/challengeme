import React, { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import { Logged } from "../context/LoggedInContext";
import AllChallenges from "../context/AllChallengesContext";
import Register from "./Authentication/Register/Register";
import Login from "./Authentication/Login";
import Cookies from "js-cookie";
import Forgot from "./Authentication/ForgotPasswordPage/Forgot";
import ValidatingMail from "./Authentication/Register/ValidatingMail";
import network from "../services/network";
import Landing from "./Authentication/Landing";
import { AnimatePresence } from "framer-motion";
import Header from "../components/Header/Header";
import ChallengeErrorBoundry from "../ErrorHandling/ChallengeErrorBoundry";
import HomeErrorBoundry from "../ErrorHandling/HomeErrorBoundry";
import AuthErrorBoundry from "../ErrorHandling/AuthErrorBoundry";
import UserInfoErrorBoundry from "../ErrorHandling/UserInfoErrorBoundry";
import Loading from "../components/Loading/Loading";

import NewChallengeForm from './NewChallenge/NewChallengeForm';

const Home = lazy(() => import("./Home/Home"));
const UserInfo = lazy(() => import("./UserInfo/UserInfo"));
const ChallengePage = lazy(() => import("./OneChallenge/ChallengePage"));

export default function Router() {
    const [darkTheme, setDarkTheme] = useState(false);
    const [logged, setLogged] = useState(false);
    const [loading, setLoading] = useState(true);
    const [challenges, setChallenges] = useState([]);
    const appBg = darkTheme
        ? { backgroundColor: "rgb(33,33,33)" }
        : { backgroundColor: "rgb(188,208,234)" };
    useEffect(() => {
        if (logged) {
            const previousTheme = localStorage.getItem("darkMode"); //get previous selected theme
            if (previousTheme === "false") {
                setDarkTheme(false);
            } else if (previousTheme === "true") {
                setDarkTheme(true);
            } else {
                if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                    //check default theme of the user
                    setDarkTheme(true);
                }
            }
        }
        (async () => {
            try {
                const { data: challengesFromServer } = await network.get("/api/v1/challenges");
                typeof challengesFromServer === "object" && setChallenges(challengesFromServer);
            } catch { }
        })();
    }, [logged]);

    useEffect(() => {
        // auth
        (async () => {
            if (Cookies.get("accessToken")) {
                try {
                    const { data } = await network.get("/api/v1/auth/validateToken");
                    setLogged(data);
                    setLoading(false);
                } catch (e) {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <BrowserRouter>
            {!loading ? (
                !logged ? (
                    <Logged.Provider value={{ logged, setLogged }}>
                        <AnimatePresence>
                            <AuthErrorBoundry>
                                <Route
                                    render={({ location }) => (
                                        <Switch location={location} key={location.pathname}>
                                            <Route exact path="/register">
                                                <Register />
                                            </Route>
                                            <Route exact path="/login">
                                                <Login />
                                            </Route>
                                            <Route exact path="/forgot">
                                                <Forgot />
                                            </Route>
                                            <Route exact path="/auth">
                                                <ValidatingMail />
                                            </Route>
                                            <Route exact path="/">
                                                <Landing />
                                            </Route>
                                            <Route path="*">
                                                <Redirect to="/" />
                                            </Route>
                                        </Switch>
                                    )}
                                />
                            </AuthErrorBoundry>
                        </AnimatePresence>
                    </Logged.Provider>
                ) : (
                        <Logged.Provider value={{ logged, setLogged }}>
                            <AllChallenges.Provider value={{ challenges }}>
                                <Header darkMode={darkTheme} setDarkMode={setDarkTheme} />
                                {/*TODO:add loading component*/}
                                <div style={appBg} className={darkTheme ? "dark" : undefined}>
                                    <Switch>
                                        <Route exact path="/add">
                                            <NewChallengeForm />
                                        </Route>
                                        <Suspense fallback={<Loading darkMode={darkTheme} />}>
                                            <ChallengeErrorBoundry>
                                                <Route exact path="/challenges/:id">
                                                    <ChallengePage darkMode={darkTheme} />
                                                </Route>
                                            </ChallengeErrorBoundry>
                                            <UserInfoErrorBoundry>
                                                <Route exact path="/user_info">
                                                    <UserInfo />
                                                </Route>
                                            </UserInfoErrorBoundry>
                                            <HomeErrorBoundry>
                                                {challenges.length > 0 ? (
                                                    <Route exact path="/">
                                                        <Home />
                                                    </Route>
                                                ) : (
                                                        <Loading darkMode={darkTheme} />
                                                    )}
                                            </HomeErrorBoundry>
                                            <HomeErrorBoundry>
                                                <Route path="*">
                                                    <Redirect to="/" />
                                                </Route>
                                            </HomeErrorBoundry>
                                        </Suspense>
                                    </Switch>
                                </div>
                            </AllChallenges.Provider>
                        </Logged.Provider>
                    )
            ) : (
                    <Loading firstLoading={true} />
                )}
        </BrowserRouter>
    );
}
