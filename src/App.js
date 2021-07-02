// import logo from './logo.svg';
import './App.css';
import React from "react";
import { BrowserRouter as Router, Switch, Route, NavLink} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min';

import {Rbs} from './pages/rbs.js'
import {Dashboard} from "./pages/dashboard";

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
                        <li className="nav-item ms-2 me-2 flex-nowrap">
                            <NavLink exact to="/" href="/" className="nav-link">Dashboard</NavLink>
                        </li>
                        <li className="nav-item ms-2 me-2 flex-nowrap">
                            <NavLink exact to="/rbs" href="/rbs" className="nav-link">RBS</NavLink>
                        </li>
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
                <Route path="/"> <Dashboard /></Route>
            </Switch>
        </div>);
}
