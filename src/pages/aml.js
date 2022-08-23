import {TableHeader, TableRow, ToggleTableRow, ToggleTableRowLog} from "../components/table_elements";
import {
    ProgressButton,
    FloatInputButton,
    IntInputButton,
    SmallLoadButton,
    Toggle,
    ListNumberInput, ListRoItemText, ListSwitch, NumberInput, SwitchInput
} from "../components/elements";
import {getJson, sendRequest, useSendRequest} from "../http_helper";
import React, {useContext, useEffect, useState} from "react";
import {GenericControl, FailureModal, useData, useModal, PollData, usePollData} from "../components/generic_control";
import {ControllerContext, HiveUrl} from "../App";
import {
    ListSubheader,
    Accordion,
    AccordionSummary,
    Typography,
    AccordionDetails,
    Chip,
    Grid,
    TextField, Button, Paper, Stack
} from "@mui/material";
import List from '@mui/material/List';
import {ToastPopup} from "../components/toast_popup";
import {grey} from "@mui/material/colors";
import {GridHeader, GridTemplate} from "../components/grid_helper";
import Box from "@mui/material/Box";

function FirstPositionRow(props) {
    const context = useContext(ControllerContext);
    return (
        <TableRow items={
            [
                context.names[0],
                props.value,
                <FloatInputButton text="Set" value={props.target} setValue={props.setTarget}
                                  callback={async () => await context.send({"set_m1_target_position": props.target})}/>
            ]}
        />);
}

function SecondPositionRow(props) {
    const context = useContext(ControllerContext);
    return (
        <TableRow items={
            [
                context.names[1],
                props.value,
                <FloatInputButton text="Set" value={props.target} setValue={props.setTarget}
                                  callback={async () => await context.send({"set_m2_target_position": props.target})}/>
            ]}
        />);
}

function MoveButton(props) {
    const context = useContext(ControllerContext)
    return (
        <ProgressButton text="Move Both"
                        callback={
                            async () => await context.send({
                                "set_m1_target_position": props.firstTarget,
                                "set_m2_target_position": props.secondTarget
                            })
                        }/>);
}

export function SimpleButton(props) {
    const context = useContext(ControllerContext);
    return (<SmallLoadButton text={props.text} callback={async () => await context.send(props.request)}/>);
}


function SecondControl() {
    const [newStepCounter, setNewStepCounter] = useState('');
    const [newMotorPosition, setNewMotorPosition] = useState('');
    const [newOffset, setNewOffset] = useState('');
    const [newLoadPosition, setNewLoadPosition] = useState("");
    const context = useContext(ControllerContext);
    return (
        <>
            <TableRow items={["Temperature", context.data["motor_2_temperature"],
                <SmallLoadButton text="Get Temperature"
                                 callback={async () => await context.send({"get_m2_temperature": true})}/>]}/>

            <TableRow items={["Position", context.data["motor_2_position"],
                <SmallLoadButton text="Get Position"
                                 callback={async () => await context.send({"get_m2_position": true})}/>
            ]}/>
            <TableRow items={["Redefine Step Counter", context.data["motor_2_steps"],
                <IntInputButton text="Redefine" setValue={setNewStepCounter} value={newStepCounter}
                                callback={async () => await context.send({"set_m2_step_counter": newStepCounter})}/>
            ]}/>
            <TableRow items={["Redefine offset", context.data["motor_2_offset"],
                <FloatInputButton text="Redefine" setValue={setNewOffset} value={newOffset}
                                  callback={async () => await context.send({"set_m2_offset": newOffset})}/>
            ]}/>
            <TableRow items={["Redefine load position", context.data["motor_2_load_position"],
                <FloatInputButton text="Redefine" setValue={setNewLoadPosition} value={newLoadPosition}
                                  callback={async () => await context.send({"set_m2_load_position": newLoadPosition})}/>
            ]}/>
            <TableRow items={["Redefine Motor Position", context.data["motor_2_position"],
                <FloatInputButton text="Redefine" setValue={setNewMotorPosition} value={newMotorPosition}
                                  callback={async () => await context.send({"set_m2_position": newMotorPosition})}/>
            ]}/>
            <TableRow items={["Updating Position", context.data["motor_2_updating_position"] ? "True" : "False",
                <Toggle checked={context.data["motor_2_updating_position"]}
                        callback={async () =>
                            await context.send({"toggle_get_m2_position": !context.data["motor_2_updating_position"]})}/>]}/>
            <TableRow items={["Updating Temperature", context.data["motor_2_updating_temperature"] ? "True" : "False",
                <Toggle checked={context.data["motor_2_updating_temperature"]}
                        callback={async () =>
                            await context.send({"toggle_get_m2_temperature": !context.data["motor_2_updating_temperature"]})}/>]}/>
        </>
    );
}

function FirstControl() {
    const [newStepCounter, setNewStepCounter] = useState("");
    const [newMotorPosition, setNewMotorPosition] = useState("");
    const [newOffset, setNewOffset] = useState("");
    const [newLoadPosition, setNewLoadPosition] = useState("");
    const context = useContext(ControllerContext);

    return (
        <>
            <TableRow items={["Temperature", context.data["motor_1_temperature"],
                <SmallLoadButton text="Get Temperature"
                                 callback={async () => await context.send({"get_m1_temperature": true})}/>]}/>

            <TableRow items={["Position", context.data["motor_1_position"],
                <SmallLoadButton text="Get Position"
                                 callback={async () => await context.send({"get_m1_position": true})}/>
            ]}/>
            <TableRow items={["Redefine Step Counter", context.data["motor_1_steps"],
                <IntInputButton text="Redefine" setValue={setNewStepCounter} value={newStepCounter}
                                callback={async () => await context.send({"set_m1_step_counter": newStepCounter})}/>
            ]}/>
            <TableRow items={["Redefine offset", context.data["motor_1_offset"],
                <FloatInputButton text="Redefine" setValue={setNewOffset} value={newOffset}
                                  callback={async () => await context.send({"set_m1_offset": newOffset})}/>
            ]}/>
            <TableRow items={["Redefine load position", context.data["motor_1_load_position"],
                <FloatInputButton text="Redefine" setValue={setNewLoadPosition} value={newLoadPosition}
                                  callback={async () => await context.send({"set_m1_load_position": newLoadPosition})}/>
            ]}/>
            <TableRow items={["Redefine Motor Position", context.data["motor_1_position"],
                <FloatInputButton text="Redefine" setValue={setNewMotorPosition} value={newMotorPosition}
                                  callback={async () => await context.send({"set_m1_position": newMotorPosition})}/>
            ]}/>
            <TableRow items={["Updating Position", context.data["motor_1_updating_position"] ? "True" : "False",
                <Toggle checked={context.data["motor_1_updating_position"]}
                        callback={async () =>
                            await context.send({"toggle_get_m1_position": !context.data["motor_1_updating_position"]})}/>]}/>
            <TableRow items={["Updating Temperature", context.data["motor_1_updating_temperature"] ? "True" : "False",
                <Toggle checked={context.data["motor_1_updating_temperature"]}
                        callback={async () =>
                            await context.send({"toggle_get_m1_temperature": !context.data["motor_1_updating_temperature"]})}/>]}/>
        </>
    );
}


function DebugControl() {
    const context = useContext(ControllerContext);
    let debugging_event_loop = context.data?.loggers?.event_loop === "debug";
    let debugging_aml = context.data?.loggers?.aml === "debug";
    let debugging_rs232 = context.data?.loggers?.rs232 === "debug";

    return (
        <>
            <ToggleTableRowLog text={"Debugging Event Loop:"} state={debugging_event_loop} send={context.send}
                               name={"event_loop"}/>
            <ToggleTableRowLog text={"Debugging Aml:"} state={debugging_aml} send={context.send} name={"aml"}/>
            <ToggleTableRowLog text={"Debugging Rs232:"} state={debugging_rs232} send={context.send} name={"rs232"}/>
        </>
    );
}


function useStatus(data) {
    const [position, setPosition] = useState("");
    const [moving, setMoving] = useState(false);

    useEffect(() => {
        if ("motor_1_position" in data && "motor_2_position" in data) {
            setPosition(data["motor_1_position"] + ", " + data["motor_2_position"]);
        } else {
            setPosition("");
        }
        if ("request_finished" in data) {
            setMoving(!data["request_finished"]);
        } else {
            setMoving(false);
        }
    }, [data])

    return [position, moving]
}


function AdvancedControl() {
    let context = useContext(ControllerContext)
    return (
        <table className="table table-striped table-hover table-sm">
            <TableHeader items={[context.names[0] + " Control", "Value", "Control"]}/>
            <tbody><FirstControl/></tbody>
            <TableHeader items={[context.names[1] + " Control", "Value", "Control"]}/>
            <tbody><SecondControl/></tbody>
            <TableHeader items={["Debug Control", "Value", "Control"]}/>
            <tbody><DebugControl/></tbody>
        </table>);
}


export function useAml(url, names, loads, title) {
    const [modalMessage, show, setShow, cb] = useModal()
    const [data, setData, running] = useData(url, {"loggers": {}});
    const [position, moving] = useStatus(data);
    const [firstTarget, setFirstTarget] = useState("");
    const [secondTarget, setSecondTarget] = useState("");

    const config = {
        title: title,
        url: url, names: names, loads: loads,
        busy: moving, brief: position, running: running,
        data: data, popup: (message) => cb(message),
        setData: (data) => setData(data),
        send: async (request) => await sendRequest(url, request, cb, setData)
    }

    let table_extra = <>
        <TableRow items={["Expiry Date", data["expiry_date"], ""]}/>
        <FirstPositionRow value={data["motor_1_position"]} target={firstTarget}
                          setTarget={setFirstTarget}/>

        <TableRow items={
            [config.names[0] + " load (config)", data["motor_1_load_position"],
                <SimpleButton text="Load" request={{"m1_load": true}}/>]}/>
        <SecondPositionRow value={data["motor_2_position"]} target={secondTarget}
                           setTarget={setSecondTarget}/>
        <TableRow items={
            [config.names[1] + " load (config)", data["motor_2_load_position"],
                <SimpleButton text="Load" request={{"m2_load": true}}/>]}/>
    </>
    let button_extra = <>
        <MoveButton firstTarget={firstTarget} secondTarget={secondTarget}/>
    </>


    return [config, show, setShow, modalMessage, table_extra, button_extra];
}


export function Aml(props) {
    const root_url = useContext(HiveUrl);
    const url = root_url + props.hardware_value.proxy;
    const names = props.hardware_value.names;
    const [ignoreDisabled, setIgnoreDisabled] = useState(true)

    const [data, setData, error, setError] = usePollData(url)
    const [open, setOpen] = useState(false)
    const [text, setText] = useState("")
    const sendRequest = useSendRequest(url, setData, setError)

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


    let set_first_position =
        <NumberInput key={names[0]} inputLabel={`Move to ${names[0]} Position`} buttonLabel={"go"}
                     callbak={(input) => sendRequest({"set_m1_target_position": input})}/>


    let set_second_position =
        <NumberInput key={names[1]} inputLabel={`Move to ${names[1]} Position`} buttonLabel={"go"}
                     callbak={async (input) => await sendRequest({"set_m2_target_position": input})}/>

    const ignore_button = <ProgressButton disabled={ignoreDisabled}
                                          callback={async () => await sendRequest({"ignore_error": true})}
                                          text={"Ignore"}/>


    let basicControl = [
        ["Request Acknowledge", "", data?.request_id],
        ["Request Finish", data?.request_finished ? "true" : "false", ""],
        ["Expiry Date", data?.expiry_date, ""],
        ["Error", data?.error, ignore_button],
        [`${names[0]} Position`, data?.motor_1_position, set_first_position],
        [`${names[0]} Load Position`, data?.motor_1_load_position,
            <ProgressButton callback={async () => await sendRequest({"m1_load": true})} text={"Load"}/>],
        [`${names[1]} Position`, data?.motor_2_position, set_second_position],
        [`${names[1]} Load Position`, data?.motor_2_load_position,
            <ProgressButton callback={async () => await sendRequest({"m2_load": true})} text={"Load"}/>],
    ]

    let advancedFirstControl = [
        ["Temperature", data?.motor_1_temperature,
            <ProgressButton callback={async () =>
                await sendRequest({"get_m1_temperature": true})} text={"Get Temperature"}/>],
        ["Position", data?.motor_1_position,
            <ProgressButton callback={async () =>
                await sendRequest({"get_m1_position": true})} text={"Get Position"}/>],
        ["Step Counter", data?.motor_1_steps,
            <NumberInput key={names[0]} inputLabel={"New Step Counter"} buttonLabel={"Redefine"}
                         callback={async (input) => await sendRequest({"set_m1_step_counter": input})}/>],
        ["Offset", data?.motor_1_offset,
            <NumberInput key={names[0]} inputLabel={"New Offset"} buttonLabel={"Redefine"}
                         callback={async (input) => await sendRequest({"set_m1_offset": input})}/>],
        ["Load Position", data?.motor_1_load_position,
            <NumberInput key={names[0]} inputLabel={"New Load Position"} buttonLabel={"Redefine"}
                         callback={async (input) => await sendRequest({"set_m1_load_position": input})}/>],
        ["Motor Position", data?.motor_1_position,
            <NumberInput key={names[0]} inputLabel={"New Motor Position"} buttonLabel={"Redefine"}
                         callback={async (input) => await sendRequest({"set_m1_position": input})}/>],
        ["Updating Position", data?.motor_1_updating_position?.toString(),
            <SwitchInput checked={data?.motor_1_updating_position} callback={async(checkRequest) =>
                await sendRequest({"toggle_get_m1_position": checkRequest})}/>],
        ["Updating Temperature", data?.motor_1_updating_temperature?.toString(),
            <SwitchInput checked={data?.motor_1_updating_temperature} callback={async(checkRequest) =>
                await sendRequest({"toggle_get_m1_temperature": checkRequest})}/>]
    ]

    let advancedSecondControl = [
        ["Temperature", data?.motor_2_temperature,
            <ProgressButton callback={async () =>
                await sendRequest({"get_m2_temperature": true})} text={"Get Temperature"}/>],
        ["Position", data?.motor_2_position,
            <ProgressButton callback={async () =>
                await sendRequest({"get_m2_position": true})} text={"Get Position"}/>],
        ["Step Counter", data?.motor_2_steps,
            <NumberInput key={names[0]} inputLabel={"New Step Counter"} buttonLabel={"Redefine"}
                         callback={async (input) => await sendRequest({"set_m2_step_counter": input})}/>],
        ["Offset", data?.motor_2_offset,
            <NumberInput key={names[0]} inputLabel={"New Offset"} buttonLabel={"Redefine"}
                         callback={async (input) => await sendRequest({"set_m2_offset": input})}/>],
        ["Load Position", data?.motor_2_load_position,
            <NumberInput key={names[0]} inputLabel={"New Load Position"} buttonLabel={"Redefine"}
                         callback={async (input) => await sendRequest({"set_m2_load_position": input})}/>],
        ["Motor Position", data?.motor_2_position,
            <NumberInput key={names[0]} inputLabel={"New Motor Position"} buttonLabel={"Redefine"}
                         callback={async (input) => await sendRequest({"set_m2_position": input})}/>],
        ["Updating Position", data?.motor_2_updating_position?.toString(),
            <SwitchInput checked={data?.motor_2_updating_position} callback={async(checkRequest) =>
                await sendRequest({"toggle_get_m2_position": checkRequest})}/>],
        ["Updating Temperature", data?.motor_2_updating_temperature?.toString(),
            <SwitchInput checked={data?.motor_2_updating_temperature} callback={async(checkRequest) =>
                await sendRequest({"toggle_get_m2_temperature": checkRequest})}/>]
    ]

    let debugControl = [
        ["Debug Event Loop", data?.loggers?.event_loop?.toString(),
            <SwitchInput checked={data?.loggers?.event_loop === "debug"} callback={async (checkRequest) => {
                let request = {"log": {"name": "event_loop", "debug": checkRequest}};
                await sendRequest(request)
            }}/>],
        ["Debug Aml", data?.loggers?.aml?.toString(),
            <SwitchInput checked={data?.loggers?.aml === "debug"} callback={async (checkRequest) => {
                let request = {"log": {"name": "aml", "debug": checkRequest}};
                await sendRequest(request)
            }}/>],
        ["Debug rs232", data?.loggers?.rs232?.toString(),
            <SwitchInput checked={data?.loggers?.rs232 === "debug"} callback={async (checkRequest) => {
                let request = {"log": {"name": "rs232", "debug": checkRequest}};
                await sendRequest(request)
            }}/>],
    ]

    return (
        <>
            <h1>AML {names[0]} {names[1]}</h1>

            <Grid container>
                <GridHeader header={["Identifier", "Value", "Control"]}></GridHeader>
                <GridTemplate rows={basicControl}/>
                <GridHeader header={[`${names[0]} Control`, "Value", "Control"]}></GridHeader>
                <GridTemplate rows={advancedFirstControl}/>
                <GridHeader header={[`${names[1]} Control`, "Value", "Control"]}></GridHeader>
                <GridTemplate rows={advancedSecondControl}/>
                <GridHeader header={[`Debug Control`, "Value", "Control"]}></GridHeader>
                <GridTemplate rows={debugControl}/>
            </Grid>

            <ToastPopup text={text} open={open} setOpen={setOpen} severity={"error"}/>
        </>);
}