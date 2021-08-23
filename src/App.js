import './App.css';
import React, {useContext, useEffect, useState} from "react";
import {BrowserRouter as HashRouter, Link, NavLink, Route, Switch} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min';

import {Rbs} from './pages/rbs.js'
import {Dashboard} from "./pages/dashboard";
import {Aml} from "./pages/aml";
import {Motrona} from "./pages/motrona";
import {Caen} from "./pages/caen";
import {getJson} from "./http_helper";

document.body.style.backgroundColor = "floralwhite";

export const HiveData = React.createContext({});

let hive_url;

if (process.env.NODE_ENV === "development") {
    hive_url = "http://localhost:8000"
} else {
    hive_url = "/hive"
}


function redirectCallsToHive(hwConfig) {
    for (const [, value] of Object.entries(hwConfig)) {
        value.url = hive_url  + value["proxy"]
    }
}

export default function App() {

    const [hwConfig, setHwConfig] = useState("");
    const getHwConfig = async () => {
        const [, newHwConfig] = await getJson(hive_url + "/api/rbs/hw_config");
        redirectCallsToHive(newHwConfig);
        setHwConfig(newHwConfig);
    }
    useEffect(() => {
        getHwConfig();
    }, [])


    return (
        <HiveData.Provider value={hwConfig}>
            <div>
                <HashRouter>
                    <NavigationBar/>
                    <PageContent/>
                </HashRouter>
            </div>
        </HiveData.Provider>
    );
}

function NavLi(props) {
    return (
        <li className="nav-item ms-2 me-2 flex-nowrap">
            <NavLink exact to={"/nectar/" + props.url} href={props.url} className="nav-link">{props.body}</NavLink>
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
                    <span className="navbar-toggler-icon"/>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <NavLi url="" body="Dashboard"/>
                        <NavLi url="rbs" body="RBS"/>
                        <NavLi url="aml_x_y" body="AML X Y"/>
                        <NavLi url="aml_phi_zeta" body="AML Phi Zeta"/>
                        <NavLi url="aml_det_theta" body="AML Det Theta"/>
                        <NavLi url="motrona_rbs" body="Motrona RBS"/>
                        <NavLi url="caen_rbs" body="Caen RBS"/>
                        <li className="nav-item ms-2 me-2 flex-nowrap">
                            <Link to={{pathname: hive_url + "/"}} className="nav-link" target="_blank">Docs</Link>
                        </li>

                    </ul>
                </div>
            </div>
        </nav>
    )
}

export const ControllerContext = React.createContext({});

function PageContent() {

    const context = useContext(HiveData);

    if (context === "") {
        return <></>
    }
    const aml_x_y = context.aml_x_y;
    const aml_phi_zeta = context.aml_phi_zeta;
    const aml_det_theta = context.aml_det_theta;
    const motrona_rbs = context.motrona_rbs;
    const caen_rbs = context.caen_rbs;

    return (
        <div className="fluid-container mt-3 ms-3 me-3 mb-3">
            <Switch>
                <Route path="/nectar/rbs"><Rbs/></Route>
                <Route path="/nectar/aml_x_y">
                    <Aml url={aml_x_y.url} names={aml_x_y.names} loads={aml_x_y.loads} key={1}/>
                </Route>
                <Route path="/nectar/aml_phi_zeta">
                    <Aml url={aml_phi_zeta.url} names={aml_phi_zeta.names} loads={aml_phi_zeta.loads} key={2}/>
                </Route>
                <Route path="/nectar/aml_det_theta">
                    <Aml url={aml_det_theta.url} names={aml_det_theta.names} loads={aml_det_theta.loads} key={3}/>
                </Route>
                <Route path="/nectar/motrona_rbs">
                    <Motrona url={motrona_rbs.url}/>
                </Route>
                <Route path="/nectar/caen_rbs">
                    <Caen url={caen_rbs.url}/>
                </Route>
                <Route path="/nectar/"> <Dashboard/></Route>
            </Switch>
        </div>);
}
