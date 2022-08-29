import React, {useContext, useEffect, useState} from "react";
import {usePollData} from "../components/generic_control";
import {HiveUrl} from "../App";
import {WideProgressButton, NumberInput, SelectInput, SwitchInput} from "../components/elements";
import {useSendRequest} from "../http_helper";
import {Grid} from "@mui/material";
import {GridHeader, GridTemplate} from "../components/grid_helper";
import {ToastPopup} from "../components/toast_popup";

export function Mdrive(props) {
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
        ["Error", data?.error,
            <WideProgressButton disabled={ignoreDisabled} text={"Ignore"}
                                callback={async () => await sendRequest({"ignore_error": true})}/>],
        ["Position steps", data?.motor_steps, ""],
        [`Load Position`, `(${data?.load_position})`,
            <WideProgressButton text={"Load"}
                                callback={async () => await sendRequest({"load": true})}/>],
        [`Position`, data?.motor_position,
            <NumberInput key={props.hardware_value.title} inputLabel={`Move to Position`} buttonLabel={"go"}
                         callback={async (input) => await sendRequest({"set_motor_target_position": input})}/>],
    ]

    let advancedControl = [
        ["Redefine offset", data?.motor_offset,
            <NumberInput buttonLabel={"Redefine"} inputLabel={"New Offset"}
                         callback={async (input) => await sendRequest({"set_motor_offset": input})}/>],
        ["Redefine Motor Position", data?.motor_position,
            <NumberInput buttonLabel="Redefine" inputLabel={"New Motor Position"}
                         callback={async (input) => await sendRequest({"redefine_motor_position": input})}/>],
        ["Redefine Load Position", data?.load_position,
            <NumberInput buttonLabel="Redefine" inputLabel={"New Load Position"}
                         callback={async (input) => await sendRequest({"set_load_position": input})}/>],
        ["Program", ,
            <SelectInput options={["zaxis", "rotation"]}
                         selectLabel={"Program for"} buttonLabel={"Program"} callback={async (input) =>
                await sendRequest({"program": input})}/>],
    ]

    let debugControl = [
        ["Debug Event Loop", data?.loggers?.event_loop?.toString(),
            <SwitchInput checked={data?.loggers?.event_loop === "debug"} callback={async (checkRequest) => {
                let request = {"log": {"name": "event_loop", "debug": checkRequest}};
                await sendRequest(request)
            }}/>],
        ["Debug Mdrive", data?.loggers?.mdrive?.toString(),
            <SwitchInput checked={data?.loggers?.mdrive === "debug"} callback={async (checkRequest) => {
                let request = {"log": {"name": "mdrive", "debug": checkRequest}};
                await sendRequest(request)
            }}/>],
        ["Debug Rs232", data?.loggers?.rs232?.toString(),
            <SwitchInput checked={data?.loggers?.rs232 === "debug"} callback={async (checkRequest) => {
                let request = {"log": {"name": "rs232", "debug": checkRequest}};
                await sendRequest(request)
            }}/>],
    ]

    return (
        <>
            <h1>{props.hardware_value.title}</h1>
            <Grid container>
                <GridHeader header={["Identifier", "Value", "Control"]}/>
                <GridTemplate rows={basicControl}/>
                <GridHeader header={["Advanced control", "Value", "Control"]}/>
                <GridTemplate rows={advancedControl}/>
                <GridHeader header={["Debug control", "Value", "Control"]}/>
                <GridTemplate rows={debugControl}/>
            </Grid>
            <ToastPopup text={text} open={open} setOpen={setOpen} severity={"error"}/>
        </>
    );
}
