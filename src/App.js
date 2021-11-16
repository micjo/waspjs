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

export const HiveConfig = React.createContext({});

function completeProxies(root_url, hiveConfig) {
    for (let [, value] of Object.entries(hiveConfig["hw_config"]["controllers"])) {
        value["proxy"] = root_url + value["proxy"];
    }
    for (let [, value] of Object.entries(hiveConfig["rbs_config"]["hardware"])) {
        value["proxy"] = root_url + value["proxy"];
    }
}

function useHiveConfig() {
    let hive_url;
    if (process.env.NODE_ENV === "development") {
        hive_url = "http://localhost:8000"
    } else {
        hive_url = "/hive"
    }
    const [hwConfig, setHwConfig] = useState("");
    useEffect(() => {
        const getHwConfig = async () => {
            const [, newHwConfig] = await getJson(hive_url + "/api/hive_config")
            newHwConfig["hive_url"] = hive_url;
            completeProxies(hive_url,newHwConfig);
            setHwConfig(newHwConfig);
            console.log(newHwConfig);
        }

        getHwConfig();
    }, [hive_url])

    return hwConfig;
}

export default function App() {
    let hiveConfig = useHiveConfig();
    return (
        <HiveConfig.Provider value={hiveConfig}>
            <div>
                <HashRouter>
                    <NavigationBar/>
                    <PageContent/>
                </HashRouter>
            </div>
        </HiveConfig.Provider>
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
    let hiveConfig = useContext(HiveConfig);

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
                            <Link to={{pathname: hiveConfig.hive_url}} className="nav-link" target="_blank">Docs</Link>
                        </li>

                    </ul>
                </div>
            </div>
        </nav>
    )
}

export const ControllerContext = React.createContext({});

function PageContent() {

    const context = useContext(HiveConfig);

    if (context === "") {
        return <h1></h1>
    }
    let aml_x_y = context.hw_config.controllers.aml_x_y;
    let aml_phi_zeta = context.hw_config.controllers.aml_phi_zeta;
    const aml_det_theta = context.hw_config.controllers.aml_det_theta;
    const motrona_rbs = context.hw_config.controllers.motrona_rbs;
    const caen_rbs = context.hw_config.controllers.caen_rbs;

    return (
        <div className="fluid-container mt-3 ms-3 me-3 mb-3">
            <Switch>
                <Route path="/nectar/rbs"><Rbs/></Route>
                <Route path="/nectar/aml_x_y">
                    <Aml url={aml_x_y.proxy} names={aml_x_y.names} loads={aml_x_y.loads} key={1}/>
                </Route>
                <Route path="/nectar/aml_phi_zeta">
                    <Aml url={aml_phi_zeta.proxy} names={aml_phi_zeta.names} loads={aml_phi_zeta.loads} key={2}/>
                </Route>
                <Route path="/nectar/aml_det_theta">
                    <Aml url={aml_det_theta.proxy} names={aml_det_theta.names} loads={aml_det_theta.loads} key={3}/>
                </Route>
                <Route path="/nectar/motrona_rbs">
                    <Motrona url={motrona_rbs.proxy}/>
                </Route>
                <Route path="/nectar/caen_rbs">
                    <Caen url={caen_rbs.proxy}/>
                </Route>
                <Route path="/nectar/"> <Dashboard/></Route>
            </Switch>
        </div>);
}
