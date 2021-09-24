import {TableHeader, TableRow, ToggleTableRow} from "../components/table_elements";
import {ButtonSpinner, IntInputButton, SmallButtonSpinner, Toggle} from "../components/input_elements";
import {sendRequest} from "../http_helper";
import React, {useContext, useEffect, useState} from "react";
import {GenericControl, ModalView, useData, useModal} from "../components/generic_control";
import {ControllerContext} from "../App";

function FirstPositionRow(props) {
    const context = useContext(ControllerContext);
    return (
        <TableRow items={
            [
                context.names[0],
                props.value,
                <IntInputButton text="Set" value={props.target} setValue={props.setTarget}
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
                <IntInputButton text="Set" value={props.target} setValue={props.setTarget}
                                callback={async () => await context.send({"set_m2_target_position": props.target})}/>
            ]}
        />);
}

function MoveButton(props) {
    const context = useContext(ControllerContext)
    return (
        <ButtonSpinner text="Move Both"
                       callback={
                           async () => await context.send({
                               "set_m1_target_position": props.firstTarget,
                               "set_m2_target_position": props.secondTarget
                           })
                       }/>);
}

function LoadButton(props) {
    const context = useContext(ControllerContext)
    return (
        <ButtonSpinner text="Load"
                       callback={() => {
                           props.setFirstTarget(context.loads[0]);
                           props.setSecondTarget(context.loads[1]);
                       }}/>
    );
}


function SecondControl() {
    const [newStepCounter, setNewStepCounter] = useState('');
    const [newMotorPosition, setNewMotorPosition] = useState('');
    const [newOffset, setNewOffset] = useState('');
    const context = useContext(ControllerContext);
    return (
        <>
            <TableRow items={["Temperature", context.data["motor_2_temperature"],
                <SmallButtonSpinner text="Get Temperature"
                                    callback={async () => await context.send({"get_m2_temperature": true})}/>]}/>

            <TableRow items={["Position", context.data["motor_2_position"],
                <SmallButtonSpinner text="Get Position"
                                    callback={async () => await context.send({"get_m2_position": true})}/>
            ]}/>
            <TableRow items={["Redefine Step Counter", context.data["motor_2_steps"],
                <IntInputButton text="Redefine" setValue={setNewStepCounter} value={newStepCounter}
                                callback={async () => await context.send({"set_m2_step_counter": newStepCounter})}/>
            ]}/>
            <TableRow items={["Redefine offset", context.data["motor_2_offset"],
                <IntInputButton text="Redefine" setValue={setNewOffset} value={newOffset}
                                callback={async () => await context.send({"set_m2_offset": newOffset})}/>
            ]}/>
            <TableRow items={["Redefine Motor Position", context.data["motor_2_position"],
                <IntInputButton text="Redefine" setValue={setNewMotorPosition} value={newMotorPosition}
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
    const [newStepCounter, setNewStepCounter] = useState('');
    const [newMotorPosition, setNewMotorPosition] = useState('');
    const [newOffset, setNewOffset] = useState('');
    const context = useContext(ControllerContext);

    return (
        <>
            <TableRow items={["Temperature", context.data["motor_1_temperature"],
                <SmallButtonSpinner text="Get Temperature"
                                    callback={async () => await context.send({"get_m1_temperature": true})}/>]}/>

            <TableRow items={["Position", context.data["motor_1_position"],
                <SmallButtonSpinner text="Get Position"
                                    callback={async () => await context.send({"get_m1_position": true})}/>
            ]}/>
            <TableRow items={["Redefine Step Counter", context.data["motor_1_steps"],
                <IntInputButton text="Redefine" setValue={setNewStepCounter} value={newStepCounter}
                                callback={async () => await context.send({"set_m1_step_counter": newStepCounter})}/>
            ]}/>
            <TableRow items={["Redefine offset", context.data["motor_1_offset"],
                <IntInputButton text="Redefine" setValue={setNewOffset} value={newOffset}
                                callback={async () => await context.send({"set_m1_offset": newOffset})}/>
            ]}/>
            <TableRow items={["Redefine Motor Position", context.data["motor_1_position"],
                <IntInputButton text="Redefine" setValue={setNewMotorPosition} value={newMotorPosition}
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
    let loggers = context.data["loggers"];
    let debugging_event_loop = loggers["log_event_loop"] === "debug";
    let debugging_aml = loggers["log_aml"] === "debug";
    let debugging_vlinx = loggers["log_vlinx"] === "debug";

    return (
        <>
            <ToggleTableRow text={"Debugging Event Loop:"} state={debugging_event_loop} send={context.send} setState={"debug_log_event_loop"}/>
            <ToggleTableRow text={"Debugging Aml:"} state={debugging_aml} send={context.send} setState={"debug_log_aml"}/>
            <ToggleTableRow text={"Debugging Vlinx(rs232):"} state={debugging_vlinx} send={context.send} setState={"debug_log_vlinx"}/>
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
            <tbody> <FirstControl/> </tbody>
            <TableHeader items={[context.names[1] + " Control", "Value", "Control"]}/>
            <tbody> <SecondControl/> </tbody>
            <TableHeader items={["Deug Control", "Value", "Control"]}/>
            <tbody> <DebugControl/> </tbody>
        </table>);
}


export function useAml(url, names, loads) {
    const [modalMessage, show, setShow, cb] = useModal()
    const [data, setData, running] = useData(url, {"loggers": {}});
    const [position, moving] = useStatus(data);
    const [firstTarget, setFirstTarget] = useState('');
    const [secondTarget, setSecondTarget] = useState('');

    const config = {
        title: "AML " + names[0] + " " + names[1],
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
        <SecondPositionRow value={data["motor_2_position"]} target={secondTarget}
                           setTarget={setSecondTarget}/>
    </>
    let button_extra = <>
        <MoveButton firstTarget={firstTarget} secondTarget={secondTarget}/>
        <LoadButton setFirstTarget={setFirstTarget} setSecondTarget={setSecondTarget}/>
    </>


    return [config, show, setShow, modalMessage, table_extra, button_extra];
}


export function Aml(props) {
    let [config, show, setShow, modalMessage, table_extra, button_extra] = useAml(props.url, props.names, props.loads)

    return (
        <ControllerContext.Provider value={config}>
            <ModalView show={show} setShow={setShow} message={modalMessage}/>
            <GenericControl table_extra={table_extra} button_extra={button_extra}/>
            <AdvancedControl/>
        </ControllerContext.Provider>);
}