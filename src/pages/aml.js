import {ProgressButton, NumberInput, SwitchInput, WideProgressButton} from "../components/elements";
import React, {useContext, useEffect, useState} from "react";
import {usePollData} from "../components/generic_control";
import {HiveUrl} from "../App";
import {Grid} from "@mui/material";
import {ToastPopup} from "../components/toast_popup";
import {GridHeader, GridTemplate} from "../components/grid_helper";
import {useSendRequest} from "../http_helper";

export function Aml(props) {
    const root_url = useContext(HiveUrl);
    const url = root_url + props.hardware_value.proxy;
    const names = props.hardware_value.names;

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
        if (error !== "Connected") {
            setText(error)
            setOpen(true)
        }
    }, [error])

    let basicControl = [
        ["Request Acknowledge", data?.request_id, ""],
        ["Request Finish", data?.request_finished ? "true" : "false", ""],
        ["Expiry Date", data?.expiry_date, ""],
        ["Error", data?.error,
            <WideProgressButton disabled={ignoreDisabled} text={"Ignore"}
                            callback={async () => await sendRequest({"ignore_error": true})}/>],
        [`${names?.[0]} Position`, data?.motor_1_position,
            <NumberInput key={names?.[0]} inputLabel={`Move to ${names?.[0]} Position`} buttonLabel={"go"}
                         callback={async (input) => await sendRequest({"set_m1_target_position": input})}/>],
        [`${names?.[1]} Position`, data?.motor_2_position,
            <NumberInput key={names?.[1]} inputLabel={`Move to ${names?.[1]} Position`} buttonLabel={"go"}
                         callbak={async (input) => await sendRequest({"set_m2_target_position": input})}/>],
        [`Load Position`, `(${data?.motor_1_load_position}, ${data?.motor_2_load_position})`,
            <WideProgressButton text={"Load"}
                            callback={async () => await sendRequest({"m1_load": true, "m2_load":true})} />],
    ]

    let advancedFirstControl = [
        ["Temperature", data?.motor_1_temperature,
            <WideProgressButton callback={async () =>
                await sendRequest({"get_m1_temperature": true})} text={"Get Temperature"}/>],
        ["Position", data?.motor_1_position,
            <WideProgressButton callback={async () =>
                await sendRequest({"get_m1_position": true})} text={"Get Position"}/>],
        ["Step Counter", data?.motor_1_steps,
            <NumberInput key={names?.[0]} inputLabel={"New Step Counter"} buttonLabel={"Redefine"}
                         callback={async (input) => await sendRequest({"set_m1_step_counter": input})}/>],
        ["Offset", data?.motor_1_offset,
            <NumberInput key={names?.[0]} inputLabel={"New Offset"} buttonLabel={"Redefine"}
                         callback={async (input) => await sendRequest({"set_m1_offset": input})}/>],
        ["Load Position", data?.motor_1_load_position,
            <NumberInput key={names?.[0]} inputLabel={"New Load Position"} buttonLabel={"Redefine"}
                         callback={async (input) => await sendRequest({"set_m1_load_position": input})}/>],
        ["Motor Position", data?.motor_1_position,
            <NumberInput key={names?.[0]} inputLabel={"New Motor Position"} buttonLabel={"Redefine"}
                         callback={async (input) => await sendRequest({"set_m1_position": input})}/>],
        ["Updating Position", data?.motor_1_updating_position?.toString(),
            <SwitchInput checked={data?.motor_1_updating_position} callback={async (checkRequest) =>
                await sendRequest({"toggle_get_m1_position": checkRequest})}/>],
        ["Updating Temperature", data?.motor_1_updating_temperature?.toString(),
            <SwitchInput checked={data?.motor_1_updating_temperature} callback={async (checkRequest) =>
                await sendRequest({"toggle_get_m1_temperature": checkRequest})}/>]
    ]

    let advancedSecondControl = [
        ["Temperature", data?.motor_2_temperature,
            <WideProgressButton callback={async () =>
                await sendRequest({"get_m2_temperature": true})} text={"Get Temperature"}/>],
        ["Position", data?.motor_2_position,
            <WideProgressButton callback={async () =>
                await sendRequest({"get_m2_position": true})} text={"Get Position"}/>],
        ["Step Counter", data?.motor_2_steps,
            <NumberInput key={names?.[1]} inputLabel={"New Step Counter"} buttonLabel={"Redefine"}
                         callback={async (input) => await sendRequest({"set_m2_step_counter": input})}/>],
        ["Offset", data?.motor_2_offset,
            <NumberInput key={names?.[1]} inputLabel={"New Offset"} buttonLabel={"Redefine"}
                         callback={async (input) => await sendRequest({"set_m2_offset": input})}/>],
        ["Load Position", data?.motor_2_load_position,
            <NumberInput key={names?.[1]} inputLabel={"New Load Position"} buttonLabel={"Redefine"}
                         callback={async (input) => await sendRequest({"set_m2_load_position": input})}/>],
        ["Motor Position", data?.motor_2_position,
            <NumberInput key={names?.[1]} inputLabel={"New Motor Position"} buttonLabel={"Redefine"}
                         callback={async (input) => await sendRequest({"set_m2_position": input})}/>],
        ["Updating Position", data?.motor_2_updating_position?.toString(),
            <SwitchInput checked={data?.motor_2_updating_position} callback={async (checkRequest) =>
                await sendRequest({"toggle_get_m2_position": checkRequest})}/>],
        ["Updating Temperature", data?.motor_2_updating_temperature?.toString(),
            <SwitchInput checked={data?.motor_2_updating_temperature} callback={async (checkRequest) =>
                await sendRequest({"toggle_get_m2_temperature": checkRequest})}/>]
    ]

    let debugControl = [
        ["Debug Event Loop", data?.loggers?.event_loop?.toString(),
            <SwitchInput checked={data?.loggers?.event_loop === "debug"} callback={async (checkRequest) => {
                let request = {"log": {"name": "event_loop", "debug": checkRequest}};
                await sendRequest(request) }}/>],
        ["Debug Aml", data?.loggers?.aml?.toString(),
            <SwitchInput checked={data?.loggers?.aml === "debug"} callback={async (checkRequest) => {
                let request = {"log": {"name": "aml", "debug": checkRequest}};
                await sendRequest(request)}}/>],
        ["Debug rs232", data?.loggers?.rs232?.toString(),
            <SwitchInput checked={data?.loggers?.rs232 === "debug"} callback={async (checkRequest) => {
                let request = {"log": {"name": "rs232", "debug": checkRequest}};
                await sendRequest(request)}}/>],
    ]

    return (
        <>
            <Grid container>
                <GridHeader header={["Identifier", "Value", "Control"]}/>
                <GridTemplate rows={basicControl}/>
                <GridHeader header={[`${names?.[0]} Control`, "Value", "Control"]}/>
                <GridTemplate rows={advancedFirstControl}/>
                <GridHeader header={[`${names?.[1]} Control`, "Value", "Control"]}/>
                <GridTemplate rows={advancedSecondControl}/>
                <GridHeader header={[`Debug Control`, "Value", "Control"]}/>
                <GridTemplate rows={debugControl}/>
            </Grid>

            <ToastPopup text={text} open={open} setOpen={setOpen} severity={"error"}/>
        </>);
}