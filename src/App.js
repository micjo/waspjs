import './App.css';
import React, {useCallback, useContext, useEffect, useState} from "react";
import {
    BrowserRouter,
    NavLink,
    Route,
    Routes,
    Link as RouterLink, useLocation, useParams
} from "react-router-dom";


import Link from "@material-ui/core/Link";
import {Dashboard} from "./pages/dashboard";
import {Aml} from "./pages/aml";
import {Motrona} from "./pages/motrona";
import {Caen} from "./pages/caen";
import {getJson} from "./http_helper";
import {Mpa3} from "./pages/mpa3";
import {Mdrive} from "./pages/mdrive";
import {JobOverview} from "./pages/job_overview";
import {LogView} from "./pages/log_view";
import {RbsDetectorOverview} from "./pages/rbs_detectors_overview";
import {Accelerator} from "./pages/accelerator";
import {Trends} from "./pages/trends";
import CssBaseline from "@mui/material/CssBaseline";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {blue, grey, yellow} from '@mui/material/colors';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import {AppBar, Divider, Drawer, IconButton, List, ListItem, ListItemText, MenuItem, Toolbar} from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import NestedList from "./components/nested_list";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import {MonitorHeart, Timeline, Menu, Work, Notes, Dashboard as DashboardIcon, Bolt, Memory} from "@mui/icons-material";

export const HiveConfig = React.createContext({});
export const HiveUrl = React.createContext({});
export const DocsUrl = React.createContext({});
export const LogbookUrl = React.createContext({});
export const NectarTitle = React.createContext({title: "", setTitle: (title) => {}});

const devMode = process.env.NODE_ENV

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: blue[500]
        },
        secondary: {
            main: yellow[500]
        }
    }
});

function useHiveUrl() {
    let hive_url;
    if (devMode === "development") {
        hive_url = "http://localhost:8000"
    } else {
        hive_url = "https://hive.capitan.imec.be"
    }
    return hive_url
}

function useDocsUrl() {
    let hive_url;
    if (devMode === "development") {
        hive_url = "http://localhost:2000"
    } else {
        hive_url = "https://wiki.capitan.imec.be"
    }
    return hive_url
}

function useLogbookUrl() {
    let logbook_url;
    if (devMode === "development") {
        logbook_url = "http://localhost:8001"
    } else {
        logbook_url = "https://logbook.capitan.imec.be"
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
    let docsUrl = useDocsUrl()
    let logbookUrl = useLogbookUrl()
    let hiveConfig = useHiveConfig(hiveUrl);
    const [title, setTitle] = useState("");

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <HiveUrl.Provider value={hiveUrl}>
                <NectarTitle.Provider value={{title, setTitle}}>
                    <LogbookUrl.Provider value={logbookUrl}>
                        <DocsUrl.Provider value={docsUrl}>
                        <HiveConfig.Provider value={hiveConfig}>
                            <div>
                                <Navigation/>
                            </div>
                        </HiveConfig.Provider>
                    </DocsUrl.Provider>
                    </LogbookUrl.Provider>
                </NectarTitle.Provider>
            </HiveUrl.Provider>
        </ThemeProvider>
    );
}

function NavLi(props) {
    return (
        <ListItemButton onClick={props.onClick} component={NavLink} to={props.to}>
            <ListItemIcon>
                <ListItemIcon>
                    {props.icon}
                </ListItemIcon>
            </ListItemIcon>
            <ListItemText primary={props.label}/>
        </ListItemButton>
    );

}

function SomeHardware(props) {

    const nectarTitle = useContext(NectarTitle);
    useEffect( () => nectarTitle.setTitle(props.hardware_value.title))

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
        Go back to the <Link component={RouterLink} to={"/"}>Dashboard</Link>
    </>)
}


function NectarAppBar(props) {
    const nectarTitle = useContext(NectarTitle)
    const root_url = useContext(HiveUrl);
    const docs_url = useContext(DocsUrl);
    return (
        <AppBar position={"sticky"}>
            <Toolbar>
                <IconButton size={"small"} onClick={() => props.show()} sx={{ mr: 2 }}>
                    <Menu/>
                </IconButton>
                <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                    {nectarTitle.title}
                </Typography>
                <Button color="inherit" component={Link} href={docs_url}>Help</Button>
                <Button color="inherit" component={Link} href={root_url}>Hive</Button>
            </Toolbar>
        </AppBar>)

}

function Navigation() {
    const context = useContext(HiveConfig);
    const [drawerVisible, setDrawerVisible] = useState(false)

    const hide = useCallback(() => setDrawerVisible(false))
    const show = useCallback(() => setDrawerVisible(true))

    if (context === "") {
        return <h1></h1>
    }


    let routes = [<Route path="/" key={"dashboard"} element={<Dashboard/>}/>];
    let navBarElements = [
        <NavLi to="/" key={"dashboard"} icon={<DashboardIcon/>} onClick={hide} label={"Dashboard"}/>
    ];

    routes.push(<Route path="/job_overview" key="job_overview" element={<JobOverview/>}/>);
    navBarElements.push(<NavLi to="/job_overview" icon={<Work/>} key="job_overview" onClick={hide} label={"Jobs"}/>)

    routes.push(<Route path="/accelerator" key="accelerator" element={<Accelerator/>}/>);
    navBarElements.push(<NavLi to="/accelerator" key="accelerator" icon={<Bolt/>} onClick={hide} label={"Accelerator"}/>)

    routes.push(<Route path="/trends" key="trends" element={<Trends/>}/>);
    navBarElements.push(<NavLi to="/trends" key="trends" icon={<Timeline/>} onClick={hide} label={"Trends"}/>)

    routes.push(<Route path="/log_view" key="log_view" element={<LogView/>}/>);
    navBarElements.push(<NavLi to="/log_view" key="log_view" icon={<Notes/>} onClick={hide} label={"Logbook"}/>)

    for (const [key, value] of Object.entries(context)) {
        let dropDownElements = []

        if (key === "rbs") {
            const full_key = key + "/" + "detectors"
            const path = "/" + full_key
            routes.push(<Route key={full_key} path={path} element={<RbsDetectorOverview/>}/>);
            dropDownElements.push(<NavLi to={path} icon={<MonitorHeart/>} key={key + "/detectors"} onClick={hide} label={"Detectors"}/>)
        }

        for (let [hardware_key, hardware_value] of Object.entries(value.hardware)) {
            const full_key = key + "/" + hardware_key
            const path = "/" + full_key
            routes.push(<Route key={full_key} path={path} element={<SomeHardware hardware_value={hardware_value}/>}/>)
            dropDownElements.push(<NavLi to={path} icon={<Memory/>} key={full_key} onClick={hide} label={hardware_value.title}/>)
        }
        let keyCap = key[0].toUpperCase() + key.slice(1)
        navBarElements.push(<NestedList key={key} label={keyCap} items={dropDownElements}/>)
    }


    return (
        <>
            <BrowserRouter>
                <NectarAppBar show={show}/>
                <Drawer PaperProps={{
                    sx: {width: "300px"},
                }} anchor="left" open={drawerVisible} onClose={() => {
                    setDrawerVisible(false)
                }}>
                    <List>
                        <ListItem><ListItemText>Links</ListItemText></ListItem>
                        <Divider/>
                        {navBarElements}
                    </List>
                </Drawer>
                <Box margin={2}>
                    <Routes>
                        {routes}
                    </Routes>
                </Box>
            </BrowserRouter>
        </>
    )
}
