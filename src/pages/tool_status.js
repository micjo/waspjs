import React, {useContext, useEffect, useState} from "react";
import {MillConfig, HiveUrl, NectarTitle} from "../App";
import {ConditionalBadge, usePollData} from "../components/generic_control";
import {Link} from "react-router-dom";
import {ProgressButton} from "../components/elements";
import {postData} from "../http_helper";
import {ButtonGroup, Grid} from "@mui/material";
import ScrollDialog from "../components/ScrollDialog";
import LinkIcon from '@mui/icons-material/Link';
import {grey} from "@mui/material/colors";
import {GridHeader} from "../components/grid_helper";


function GridItem(props) {
    return <Grid item xs={2} sx={{backgroundColor: props.bgcolor}} pt={0.5} pb={0.5}>{props.content}</Grid>
}

export function UseStatus(props) {
    const root_url = useContext(HiveUrl);
    let url = root_url + props.value.proxy;
    const [data, , connectionStatus] = usePollData(url);
    const [text, setText] = useState("")
    const [open, setOpen] = useState(false)
    let title = props.value.title;
    let href = props.setup + "/" + props.id;

    let runningStatus = connectionStatus !== "Connected";
    let runBadge = <ConditionalBadge text={connectionStatus} error={runningStatus}/>

    let successStatus = data["error"] === "Success" || data["error"] === "No error";
    let errorBadge = <ConditionalBadge text={data["error"]} error={!successStatus}/>;

    let start_query = "?name=" + props.id + "&start=true";
    let stop_query = "?name=" + props.id + "&start=false";

    let start_stop_logs = <></>
    if (props.value.type !== "mpa3") {
        start_stop_logs =
            <ButtonGroup variant="outlined" aria-label="outlined button group" size="small">
                <ProgressButton text="Start" callback={async () => {
                    await postData(root_url + "/api/service" + start_query, "");
                }}/>
                <ProgressButton text="Stop" callback={async () => {
                    await postData(root_url + "/api/service" + stop_query, "");
                }}/>
                <ProgressButton text="Logs" callback={async () => {
                        let response = await fetch(root_url + "/api/service_log?name=" + props.id);
                        let response_text = await response.text();
                        setText(response_text)
                        setOpen(true)
                }}/>
            </ButtonGroup>
    }

    return (
        <>
            <ScrollDialog title={"Logs"} text={text} open={open} onClose={()=>{setOpen(false)}}/>
            <GridItem bgcolor={props.bgcolor} content={title}/>
            <GridItem bgcolor={props.bgcolor} content={runBadge}/>
            <GridItem bgcolor={props.bgcolor} content={errorBadge}/>
            <GridItem bgcolor={props.bgcolor} content={data["request_id"]}/>
            <GridItem bgcolor={props.bgcolor} content={start_stop_logs}/>
            <GridItem bgcolor={props.bgcolor} content={<Link to={href}><LinkIcon/></Link>}/>
        </>
    );
}

export function ToolStatus() {
    const context = useContext(MillConfig);
    const nectarTitle = useContext(NectarTitle);

    useEffect( () => nectarTitle.setTitle("Tool Status"))

    let full_page = []

    let even = true
    for (const [setup_key, setup_value] of Object.entries(context)) {
        let table = []
        for (const [hardware_key, hardware_value] of Object.entries(setup_value.drivers)) {

            let backgroundColor = even ? grey[200] : 'background.default'

            table.push(
                <UseStatus bgcolor={backgroundColor} key={hardware_key} id={hardware_key} value={hardware_value}
                           setup={setup_key}/>
            )
            even = !even;
        }
        const capitalized_key = setup_key[0].toUpperCase() + setup_key.slice(1);

        full_page.push(
            <div key={setup_key}>
                <h1>{capitalized_key}</h1>
                <Grid item={true} container columnSpacing={1} ml={0} mb={2}>
                    <GridHeader header={["Name", "Connected", "Error", "Last Request", "Control", "Go"]}/>
                    {table}
                </Grid>
            </div>

        );
    }
    return (
        <>{full_page}
        </>
    )


}
