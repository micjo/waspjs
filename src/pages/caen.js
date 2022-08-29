import {usePollData} from "../components/generic_control";
import React, {useContext, useEffect, useState} from "react";
import {useSendRequest} from "../http_helper";
import {HiveUrl} from "../App";
import {LoadButton, SwitchInput, WideProgressButton} from "../components/elements";
import {GridHeader, GridTemplate} from "../components/grid_helper";
import {ButtonGroup, Grid} from "@mui/material";

export function Caen(props) {

    const root_url = useContext(HiveUrl);
    const url = root_url + props.hardware_value.proxy;

    const [data, setData, error, setError] = usePollData(url)
    const [open, setOpen] = useState(false)
    const [text, setText] = useState("")
    const sendRequest = useSendRequest(url, setData, setError)
    const [ignoreDisabled, setIgnoreDisabled] = useState(true)

    useEffect(() => {
        if (data?.error) {
            setIgnoreDisabled(data?.error === "Success")
        }
    }, [data])
    useEffect(() => {
        if (error) {
            setText(error)
            setOpen(true)
        }
    }, [error])

    let basicControl = [
        ["Request Acknowledge", data?.request_id, ""],
        ["Request Finish", data?.request_finished ? "true" : "false", ""],
        ["Acquiring", data?.acquisition_active ? "true" : "false",
            <ButtonGroup fullWidth>
                <LoadButton text={"Start"} callback={async () => await sendRequest({"start": true})}/>
                <LoadButton text={"Stop"} callback={async () => await sendRequest({"stop": true})}/>
                <LoadButton text={"Clear"} callback={async () => await sendRequest({"clear": true})}/>
            </ButtonGroup>

        ],
        ["Error", data?.error,
            <WideProgressButton disabled={ignoreDisabled} text={"Ignore"}
                                callback={async () => await sendRequest({"ignore_error": true})}/>],
        ["", "",
            <ButtonGroup fullWidth>
                <LoadButton text={"Upload Registry"} callback={async () => await sendRequest({"upload_all_registry": true})}/>
                <LoadButton text={"Connect"} callback={async () => await sendRequest({"open_connection": true})}/>
            </ButtonGroup>

        ]
    ]

    let debugControl = [
        ["Debug event loop", data?.loggers?.event_loop?.toString(),
            <SwitchInput checked={data?.loggers?.event_loop === "debug"} callback={async (checkRequest) => {
                let request = {"log": {"name": "event_loop", "debug": checkRequest}};
                await sendRequest(request)
            }}/>],
        ["Debug Library calls", data?.loggers?.caen_lib?.toString(),
            <SwitchInput checked={data?.loggers?.caen_lib === "debug"} callback={async (checkRequest) => {
                let request = {"log": {"name": "caen_lib", "debug": checkRequest}};
                await sendRequest(request)
            }}/>],
        ["Debug Commands", data?.loggers?.caen_command?.toString(),
            <SwitchInput checked={data?.loggers?.caen_command === "debug"} callback={async (checkRequest) => {
                let request = {"log": {"name": "caen_command", "debug": checkRequest}};
                await sendRequest(request)
            }}/>],
        ["Debug events", data?.loggers?.caen_events?.toString(),
            <SwitchInput checked={data?.loggers?.caen_events === "debug"} callback={async (checkRequest) => {
                let request = {"log": {"name": "caen_events", "debug": checkRequest}};
                await sendRequest(request)
            }}/>],
    ]

    return (
        <>
            <h1>{props.hardware_value.title}</h1>
            <Grid container>
                <GridHeader header={["Identifier", "Value", "Control"]}/>
                <GridTemplate rows={basicControl}/>
                <GridHeader header={["Debug Control", "Value", "Control"]}/>
                <GridTemplate rows={debugControl}/>
            </Grid>
        </>
    );
}