import React, {useContext, useEffect, useState} from "react";
import {useSendRequest} from "../http_helper";
import {usePollData} from "../components/generic_control";
import {HiveUrl} from "../App";
import {NumberInput, SelectInput, WideProgressButton, LoadButton, SwitchInput} from "../components/elements";
import {GridHeader, GridTemplate} from "../components/grid_helper";
import {ButtonGroup, Grid} from "@mui/material";
import {ToastPopup} from "../components/toast_popup";

export function Motrona(props) {
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
        if (error !== "Connected") {
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
        ["Counts", data["counts"], ""],
        ["Counting Status", data["status"], <ButtonGroup fullWidth>
            <LoadButton text={"Pause"} callback={async () => await sendRequest({"pause_counting": true})}/>
            <LoadButton text={"Clear & Start"} callback={async () =>
                await sendRequest({"clear-start_counting": true})}/>
        </ButtonGroup>],
        ["Charge (nC)", data["charge(nC)"], ""],
        ["Counting Time (msec)", data?.["counting_time(msec)"], ""],
        ["Current (nA)", data?.["current(nA)"], ""],
        ["Target Counts", data?.["target_counts"], ""],
        ["Firmware Version", data?.["firmware_version"], ""]
    ]

    let countingSettings = [
        ["Target Charge", data?.["target_charge(nC)"],
            <NumberInput inputLabel={"New Target Charge"} buttonLabel={"Set"} callback={async (input) =>
                await sendRequest({"target_charge": input})}/>],
        ["Pulses to counts factor", data?.["pulses_to_counts_factor"],
            <NumberInput inputLabel={"New Pulse To Count Factor"} buttonLabel={"Set"} callback={async (input) =>
                await sendRequest({"set_pulse_to_count_factor": input})}/>],
        ["Counts to charge factor", data?.["counts_to_nC_factor"],
            <NumberInput inputLabel={"New Counts to Charge Factor"} buttonLabel={"Set"} callback={async (input) =>
                await sendRequest({"set_count_to_charge_factor": input})}/>],
        ["Counting Mode", data?.["count_mode"],
            <SelectInput options={["a_single", "a+b", "a-b", "a/b_90_x1", "a/b_90_x2", "a/b_90_x4"]}
                selectLabel={"New Counting Mode"} buttonLabel={"Set"} callback={async (input) =>
                await sendRequest({"set_count_mode": input})}/>],
        ["Input Pulse", data?.["input_pulse_type"],
            <SelectInput options={["npn", "pnp", "namur", "tri-state"]} selectLabel={"New Input pulse type"}
                         buttonLabel={"Set"} callback={async (input) =>
                await sendRequest({"set_count_mode": input})}/>],
    ]

    let analogSettings = [
        ["Analog Start", data?.analog_start,
            <NumberInput inputLabel={"New Analog Start"} buttonLabel={"Set"}
                         callback={async (input) => await sendRequest({"set_analog_start": input})}/>],
        ["Analog End", data?.analog_end,
            <NumberInput inputLabel={"New Analog End"} buttonLabel={"Set"}
                         callback={async (input) => await sendRequest({"set_analog_end": input})}/>],
        ["Analog Gain", data?.analog_gain,
            <NumberInput inputLabel={"New Analog Gain"} buttonLabel={"Set"}
                         callback={async (input) => await sendRequest({"set_analog_gain": input})}/>],
        ["Analog Offset", data?.analog_offset,
            <NumberInput inputLabel={"New Analog Gain"} buttonLabel={"Set"}
                         callback={async (input) => await sendRequest({"set_analog_offset": input})}/>]
    ]
    let preselectionSettings = [
        ["Preselection 1", data?.preselection_1,
            <NumberInput inputLabel={"New Preselection 1"} buttonLabel={"Set"}
                         callback={async (input) => await sendRequest({"preselection_1": input})}/>],
        ["Preselection 2", data?.preselection_2,
            <NumberInput inputLabel={"New Preselection 2"} buttonLabel={"Set"}
                         callback={async (input) => await sendRequest({"preselection_2": input})}/>],
        ["Preselection 3", data?.preselection_3,
            <NumberInput inputLabel={"New Preselection 3"} buttonLabel={"Set"}
                         callback={async (input) => await sendRequest({"preselection_3": input})}/>],
        ["Preselection 4", data?.preselection_4,
            <NumberInput inputLabel={"New Preselection 4"} buttonLabel={"Set"}
                         callback={async (input) => await sendRequest({"preselection_4": input})}/>],
    ]

    let debugControl = [
        ["Debug Event Loop", data?.loggers?.event_loop?.toString(),
            <SwitchInput checked={data?.loggers?.event_loop === "debug"} callback={async (checkRequest) => {
                let request = {"log": {"name": "event_loop", "debug": checkRequest}};
                await sendRequest(request)
            }}/>],
        ["Debug Motrona", data?.loggers?.motrona?.toString(),
            <SwitchInput checked={data?.loggers?.motrona === "debug"} callback={async (checkRequest) => {
                let request = {"log": {"name": "motrona", "debug": checkRequest}};
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
                <GridHeader header={["Counting Settings", "Value", "Control"]}/>
                <GridTemplate rows={countingSettings}/>
                <GridHeader header={["Analog Settings", "Value", "Control"]}/>
                <GridTemplate rows={analogSettings}/>
                <GridHeader header={["Preselection Settings", "Value", "Control"]}/>
                <GridTemplate rows={preselectionSettings}/>
                <GridHeader header={["Debug Settings", "Value", "Control"]}/>
                <GridTemplate rows={debugControl}/>
            </Grid>
            <ToastPopup text={text} open={open} setOpen={setOpen} severity={"error"}/>
        </>
    );
}
