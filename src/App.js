// import logo from './logo.svg';
import './App.css';
import React from "react";
import { BrowserRouter as Router, Switch, Route, NavLink} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min';

import {Rbs} from './pages/rbs.js'
import {Dashboard} from "./pages/dashboard";
import {Aml} from "./pages/aml";

document.body.style.backgroundColor = "floralwhite";

export default function App() {
    return (
        <div>
        <Router>
            <NavigationBar />
            <PageContent />
        </Router>
        </div>
    );
}

function NavLi(props) {
    return (
        <li className="nav-item ms-2 me-2 flex-nowrap">
            <NavLink exact to={props.url} href={props.url} className="nav-link">{props.body}</NavLink>
        </li>
    );
}

function NavigationBar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark navbar-sm">
            <div className="container-fluid">
                <button className="navbar-toggler float-end" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                        aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <NavLi url="/" body="Dashboard"/>
                        <NavLi url="/rbs" body="RBS"/>
                        <NavLi url="/aml" body="AML"/>
                    </ul>
                </div>
            </div>
        </nav>
    )
}

function PageContent() {
    return (
        <div className="fluid-container ms-3 me-3 mb-3">
            <Switch>
                <Route path="/rbs"><Rbs /></Route>
                <Route path="/aml"><Aml
                    url="http://localhost:8000/api/aml_x_y"
                    names={["X", "Y"]}

                /></Route>
                <Route path="/"> <Dashboard /></Route>
            </Switch>
        </div>);
}
