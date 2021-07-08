// import logo from './logo.svg';
import './App.css';
import React, {useContext} from "react";
import {BrowserRouter as Router, NavLink, Route, Switch} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min';

import {Rbs} from './pages/rbs.js'
import {Dashboard} from "./pages/dashboard";
import {Aml} from "./pages/aml";
import {Motrona} from "./pages/motrona";

document.body.style.backgroundColor = "floralwhite";

export const Controllers = React.createContext({});

const controllerConfig =
    {
        aml_x_y: {
            url: "http://localhost:8000/api/aml_x_y",
            names: ["X", "Y"],
            loads: [10, 10]
        },
        aml_phi_zeta: {
            url: "http://localhost:8000/api/aml_phi_zeta",
            names: ["Phi", "Zeta"],
            loads: [0, 1]
        },
        aml_det_theta: {
            url: "http://localhost:8000/api/aml_det_theta",
            names: ["Detector", "Theta"],
            loads: [170, 0]
        },
        motrona_rbs: {url: "http://localhost:8000/api/motrona_rbs"},
    };

export default function App() {
    return (
        <Controllers.Provider value={controllerConfig}>
            <div>
                <Router>
                    <NavigationBar/>
                    <PageContent/>
                </Router>
            </div>
        </Controllers.Provider>
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
                        <NavLi url="/aml_x_y" body="AML X Y"/>
                        <NavLi url="/aml_phi_zeta" body="AML Phi Zeta"/>
                        <NavLi url="/aml_det_theta" body="AML Det Theta"/>
                        <NavLi url="/motrona_rbs" body="Motrona RBS"/>

                    </ul>
                </div>
            </div>
        </nav>
    )
}

export const ControllerContext = React.createContext({});

function PageContent() {

    const context = useContext(Controllers);
    const aml_x_y = context.aml_x_y;
    const aml_phi_zeta = context.aml_phi_zeta;
    const aml_det_theta = context.aml_det_theta;
    const motrona_rbs = context.motrona_rbs;

    return (
        <div className="fluid-container mt-3 ms-3 me-3 mb-3">
            <Switch>
                <Route path="/rbs"><Rbs/></Route>
                <Route path="/aml_x_y">
                    <Aml url={aml_x_y.url} names={aml_x_y.names} loads={aml_x_y.loads}/>
                </Route>
                <Route path="/aml_phi_zeta">
                    <Aml url={aml_phi_zeta.url} names={aml_phi_zeta.names}loads={aml_phi_zeta.loads}/>
                </Route>
                <Route path="/aml_det_theta">
                    <Aml url={aml_det_theta.url} names={aml_det_theta.names} loads={aml_det_theta.loads}/>
                </Route>
                <Route path="/motrona_rbs">
                    <Motrona url={motrona_rbs.url}/>
                </Route>
                <Route path="/"> <Dashboard/></Route>
            </Switch>
        </div>);
}
