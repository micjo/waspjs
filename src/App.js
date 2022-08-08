import './App.css';
import React, {useContext, useEffect, useState} from "react";
import {
    BrowserRouter,
    NavLink,
    Route,
    Routes,
    Link
} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min';

import {RbsOverview} from './pages/rbs_overview.js'
import {Dashboard} from "./pages/dashboard";
import {Aml} from "./pages/aml";
import {Motrona} from "./pages/motrona";
import {Caen} from "./pages/caen";
import {getJson} from "./http_helper";
import {Mpa3} from "./pages/mpa3";
import {Mdrive} from "./pages/mdrive";
import {ErdOverview} from "./pages/erd_overview";
import {JobOverview} from "./pages/job_overview";
import {LogView} from "./pages/log_view";
import {RbsDetectorOverview} from "./pages/rbs_detectors_overview";
import {Accelerator} from "./pages/accelerator";

document.body.style.backgroundColor = "floralwhite";

export const HiveConfig = React.createContext({});
export const HiveUrl = React.createContext({})
export const LogbookUrl = React.createContext({})
export const ControllerContext = React.createContext({});


function useHiveUrl() {
    let hive_url;
    if (process.env.NODE_ENV === "development") {
        hive_url = "http://localhost:8000"
    } else {
        hive_url = "/hive"
    }
    return hive_url
}

function useLogbookUrl() {
    let logbook_url;
    if (process.env.NODE_ENV === "development") {
        logbook_url = "http://localhost:8001"
    } else {
        logbook_url = "/logbook"
    }
    return logbook_url
}

function useHiveConfig(hive_url) {
    const [hwConfig, setHwConfig] = useState("");
    useEffect(() => {
        const getHwConfig = async () => {
            const [, newHwConfig] = await getJson(hive_url + "/api/hive_config")
            setHwConfig(newHwConfig);
        }

        getHwConfig();
    }, [hive_url])

    return hwConfig;
}

export default function App() {
    let hiveUrl = useHiveUrl()
    let logbookUrl = useLogbookUrl()
    let hiveConfig = useHiveConfig(hiveUrl);
    return (
        <HiveUrl.Provider value={hiveUrl}>
            <LogbookUrl.Provider value={logbookUrl}>
                <HiveConfig.Provider value={hiveConfig}>
                    <div>
                        <Navigation/>
                    </div>
                </HiveConfig.Provider>
            </LogbookUrl.Provider>
        </HiveUrl.Provider>
    );
}

function NavLi(props) {
    return (
        <li className="nav-item ms-2 me-2 flex-nowrap">
            <NavLink to={props.url} className="nav-link">{props.children}</NavLink>
        </li>
    );

}

function Dropdown(props) {
    return (<li className="nav-item dropdown navbar-dark ms-1 me-1">
        <a className="nav-link dropdown-toggle" href="#" id={props.dropKey} role="button"
           data-bs-toggle="dropdown" aria-expanded="false">
            {props.dropKey[0].toUpperCase() + props.dropKey.slice(1)}
        </a>
        <ul className="dropdown-menu navbar-dark bg-dark" aria-labelledby={props.dropKey}>
            {props.elements}
        </ul>
    </li>);
}


function NavBar(props) {
    return (<nav className="navbar navbar-expand-lg navbar-dark bg-dark navbar-sm">
        <div className="container-fluid">
            <button className="navbar-toggler float-end" type="button" data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                    aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"/>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    {props.elements}
                </ul>
            </div>
        </div>
    </nav>);
}

function SomeHardware(props) {
    if (props.hardware_value.type === "aml") {
        return (<Aml hardware_value={props.hardware_value}/>)
    }
    if (props.hardware_value.type === "motrona_dx350") {
        return (<Motrona hardware_value={props.hardware_value}/>)
    }
    if (props.hardware_value.type === "caen") {
        return (<Caen hardware_value={props.hardware_value}/>)
    }
    if (props.hardware_value.type === "mpa3") {
        return (<Mpa3 hardware_value={props.hardware_value}/>)
    }
    if (props.hardware_value.type === "mdrive") {
        return (<Mdrive hardware_value={props.hardware_value}/>)
    }
    return (<>
        <h3>This hardware type has no associated UI</h3>
        Go back to the <Link to={"/"}>Dashboard</Link>
    </>)
}


function Navigation() {
    const context = useContext(HiveConfig);
    const root_url = useContext(HiveUrl);

    if (context === "") {
        return <h1></h1>
    }

    let routes = [<Route path="/" key="dashboard" element={<Dashboard/>}/>];
    let navBarElements = [<NavLi url="/" key="dashboard">Dashboard </NavLi>];

    routes.push(<Route path="/job_overview" key="job_overview" element={<JobOverview/>}/>);
    navBarElements.push(<NavLi url="/job_overview" key="job_overview">Jobs </NavLi>);

    routes.push(<Route path="/accelerator" key="accelerator" element={<Accelerator/>}/>);
    navBarElements.push(<NavLi url="/accelerator" key="accelerator">Accelerator</NavLi>);

    routes.push(<Route path="/log_view" key="log_view" element={<LogView/>}/>);
    navBarElements.push(<NavLi url="/log_view" key="log_view">Logbook</NavLi>);

    for (const [key, value] of Object.entries(context)) {
        let dropDownElements = []

        if (key === "rbs") {
            const full_key = key + "/" + "detectors"
            const path = "/" + full_key
            dropDownElements.push(<NavLi url={path} key={key + "/detectors"}>Detectors</NavLi>)
            routes.push(<Route key={full_key} path={path} element={<RbsDetectorOverview/>}/>);
        }
        //
        // if (key === "erd") {
        //     dropDownElements.push(<NavLi url={"/nectar/" + key + "/overview"} key={key + "/overview"}>Overview</NavLi>)
        //     routes.push(<Route path="/nectar/erd/overview" element={<ErdOverview/>} key={key}/>)
        // }

        for (let [hardware_key, hardware_value] of Object.entries(value.hardware)) {
            const full_key = key + "/" + hardware_key
            const path = "/" + full_key
            dropDownElements.push(<NavLi url={path} key={full_key}> {hardware_value.title} </NavLi>)
            routes.push(<Route key={full_key} path={path} element={<SomeHardware hardware_value={hardware_value}/>}/>)
        }
        navBarElements.push(<Dropdown dropKey={key} elements={dropDownElements} key={key}/>)
    }

    navBarElements.push(<li className="nav-item ms-2 me-2 flex-nowrap" key="docs">
        <a href={root_url} className="nav-link" target="_blank">Docs</a>
    </li>)

    return (
        <>
            <BrowserRouter>
                <NavBar elements={navBarElements}/>
                <div className="fluid-container mt-3 ms-3 me-3 mb-3">
                    <Routes>
                        {routes}
                        <Route path="test" element={<Dashboard/>}/>
                    </Routes>
                </div>
            </BrowserRouter>
        </>
    )
}
