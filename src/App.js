import './App.css';
import React, {useCallback, useContext, useEffect, useState} from "react";
import {
    BrowserRouter,
    NavLink,
    Route,
    Routes,
    Link as RouterLink,
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
import {Trends} from "./pages/trends";
import CssBaseline from "@mui/material/CssBaseline";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {blue, yellow} from '@mui/material/colors';
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
import {
    MonitorHeart,
    Timeline,
    Menu,
    Work,
    Notes,
    Dashboard as DashboardIcon,
    Bolt,
    Memory,
    ContentPasteSearch,
    MenuBook, Settings
} from "@mui/icons-material";
import {RbsOverview} from "./pages/rbs_overview";
import {DayBook} from "./pages/daybook";
import {RecipeMetaConfig} from "./pages/recipe_meta_config";
import {ErdOverview} from "./pages/erd_overview";

export const MillConfig = React.createContext({});
export const HiveUrl = React.createContext({});
export const DocsUrl = React.createContext({});
export const LogbookUrl = React.createContext({});
export const NectarTitle = React.createContext({
    title: "", setTitle: (title) => {
    }
});


export const BackEndConfig = React.createContext( {});

const devMode = process.env.NODE_ENV

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: blue[500]
        },
        secondary: {
            main: yellow[500]
        },
        background: {
            default: "#f8f8f8",
            paper: '#ffffff'
        }
    }
});

function useBackEndConfig() {
    let config = {}
    config["urls"] = {}
    if (devMode === "development") {
        config["urls"]["mill"] ="http://localhost:8000"
        config["urls"]["db"] ="http://localhost:8001"
        config["urls"]["docs"] ="http://localhost:2000"
    }
    else {
        config["urls"]["mill"] = "https://mill.capitan.imec.be"
        config["urls"]["db"] = "https://db.capitan.imec.be"
        config["urls"]["docs"] = "https://wiki.capitan.imec.be"
    }

    // const [hwConfig, setHwConfig] = useState("");
    useEffect(() => {
        const getHwConfig = async () => {
            const [, newHwConfig] = await getJson(config.urls.mill + "/api/config")
            config.mill = newHwConfig;
        }
        getHwConfig().then();
    }, [config, config.urls.mill])

    return config;
}

function useMillUrl() {
    let hive_url;
    if (devMode === "development") {
        hive_url = "http://localhost:8000"
    } else {
        hive_url = "https://mill.capitan.imec.be"
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

function useDbUrl() {
    let logbook_url;
    if (devMode === "development") {
        logbook_url = "http://localhost:8001"
    } else {
        logbook_url = "https://db.capitan.imec.be"
    }
    return logbook_url
}

function useMillConfig(hive_url) {
    const [hwConfig, setHwConfig] = useState("");
    useEffect(() => {
        const getHwConfig = async () => {
            const [, newHwConfig] = await getJson(hive_url + "/api/config")
            setHwConfig(newHwConfig);
        }

        getHwConfig();
    }, [hive_url])

    return hwConfig;
}

export default function App() {
    let millUrl = useMillUrl()
    let docsUrl = useDocsUrl()
    let dbUrl = useDbUrl()
    let millConfig = useMillConfig(millUrl);
    const [title, setTitle] = useState("");

    let backendConfig = useBackEndConfig()

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <HiveUrl.Provider value={millUrl}>
                <NectarTitle.Provider value={{title, setTitle}}>
                    <BackEndConfig.Provider value={backendConfig}>
                    <LogbookUrl.Provider value={dbUrl}>
                        <DocsUrl.Provider value={docsUrl}>
                            <MillConfig.Provider value={millConfig}>
                                <div>
                                    <Navigation/>
                                </div>
                            </MillConfig.Provider>
                        </DocsUrl.Provider>
                    </LogbookUrl.Provider>
                    </BackEndConfig.Provider>
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
    useEffect(() => nectarTitle.setTitle(props.hardware_value.title))

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
                <IconButton size={"small"} onClick={() => props.show()} sx={{mr: 2}}>
                    <Menu/>
                </IconButton>
                <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                    {nectarTitle.title}
                </Typography>
                <Button color="inherit" component={Link} href={docs_url}>Help</Button>
                <Button color="inherit" component={Link} href={root_url}>Mill</Button>
            </Toolbar>
        </AppBar>)

}

function Navigation() {
    const context = useContext(MillConfig);
    const [drawerVisible, setDrawerVisible] = useState(false)

    const hide = useCallback(() => setDrawerVisible(false))
    const show = useCallback(() => setDrawerVisible(true))

    if (context === "") {
        return <h1>Cannot Reach Mill. Is it running ? (<a
            href="https://mill.capitan.imec.be">https://mill.capitan.imec.be</a>)</h1>
    }

    let routes = [<Route path="/" key={"dashboard"} element={<Dashboard/>}/>];
    let navBarElements = [
        <NavLi to="/" key={"dashboard"} icon={<DashboardIcon/>} onClick={hide} label={"Dashboard"}/>
    ];

    routes.push(<Route path="/job_overview" key="job_overview" element={<JobOverview/>}/>);
    navBarElements.push(<NavLi to="/job_overview" icon={<Work/>} key="job_overview" onClick={hide} label={"Jobs"}/>)

    routes.push(<Route key={"rbs_overview"} path={"/rbs_overview"} element={<RbsOverview/>}/>);
    navBarElements.push(<NavLi to={"/rbs_overview"} key="rbs_overview" icon={<ContentPasteSearch/>} onClick={hide} label={"RBS Overview"}/>)

    routes.push(<Route key={"erd_overview"} path={"/erd_overview"} element={<ErdOverview/>}/>);
    navBarElements.push(<NavLi to={"/erd_overview"} key="erd_overview" icon={<ContentPasteSearch/>} onClick={hide} label={"ERD Overview"}/>)
    routes.push(<Route path="/daybook" key="daybook" element={<DayBook/>}/>);
    navBarElements.push(<NavLi to="/daybook" icon={<MenuBook/>} key="DayBook" onClick={hide} label={"Daybook"}/>)

    routes.push(<Route path="/recipe_meta_config" key="recipe_meta_config" element={<RecipeMetaConfig/>}/>);
    navBarElements.push(<NavLi to="/recipe_meta_config" icon={<Settings/>} key="recipe_meta_config" onClick={hide} label={"Recipe Meta Config"}/>)

    routes.push(<Route path="/trends" key="trends" element={<Trends/>}/>);
    navBarElements.push(<NavLi to="/trends" key="trends" icon={<Timeline/>} onClick={hide} label={"Trends"}/>)

    routes.push(<Route path="/log_view" key="log_view" element={<LogView/>}/>);
    navBarElements.push(<NavLi to="/log_view" key="log_view" icon={<Notes/>} onClick={hide} label={"Logbook"}/>)


    for (const [key, value] of Object.entries(context)) {
        let dropDownElements = []

        if (key === "rbs") {
            const detectors_url = key + "/detectors"
            routes.push(<Route key={detectors_url} path={"/" + detectors_url} element={<RbsDetectorOverview/>}/>);
            dropDownElements.push(<NavLi to={"/" + detectors_url} icon={<MonitorHeart/>} key={detectors_url}
                                         onClick={hide} label={"Detectors"}/>)

        }

        for (let [hardware_key, hardware_value] of Object.entries(value.drivers)) {
            const full_key = key + "/" + hardware_key
            const path = "/" + full_key
            routes.push(<Route key={full_key} path={path} element={<SomeHardware hardware_value={hardware_value}/>}/>)
            dropDownElements.push(<NavLi to={path} icon={<Memory/>} key={full_key} onClick={hide}
                                         label={hardware_value.title}/>)
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
