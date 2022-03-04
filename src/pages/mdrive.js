import React, {useContext, useEffect, useState} from "react";
import {TableHeader, TableRow, ToggleTableRow} from "../components/table_elements";
import {GenericControl, ModalView} from "../components/generic_control";
import {ControllerContext, HiveUrl} from "../App";
import {FloatInputButton, DropDownButton, SmallButtonSpinner} from "../components/input_elements";
import {useGenericPage} from "./generic_page";

function useStatus(data) {
    const [position, setPosition] = useState("");
    const [moving, setMoving] = useState(false);

    useEffect(() => {
        if ("motor_position" in data && "moving_to_target" in data) {
            setPosition(data["motor_position"]);
            setMoving(data["moving_to_target"])
        } else {
            setPosition("")
            setMoving(false)
        }
    }, [data])

    return [position, moving]
}

function MotorControl() {
    const context = useContext(ControllerContext);
    const [newMotorPosition, setNewMotorPosition] = useState("");
    const [newLoadPosition, setNewLoadPosition] = useState("");
    const [newOffset, setNewOffset] = useState("");
    const [program, setProgram] = useState("");

    return (
        <>
            <TableRow items={["Redefine offset", context.data["motor_offset"],
                <FloatInputButton text="Redefine" setValue={setNewOffset} value={newOffset}
                                  callback={async () => await context.send({"set_motor_offset": newOffset})}/>
            ]}/>
            <TableRow items={["Redefine Motor Position", context.data["motor_position"],
                <FloatInputButton text="Redefine" setValue={setNewMotorPosition} value={newMotorPosition}
                                  callback={async () => await context.send({"redefine_motor_position": newMotorPosition})}/>
            ]}/>
            <TableRow items={["Redefine Load Position", context.data["load_position"],
                <FloatInputButton text="Redefine" setValue={setNewLoadPosition} value={newLoadPosition}
                                  callback={async () => await context.send({"set_load_position": newLoadPosition})}/>
            ]}/>
            <TableRow items={[
                "Program:", "",
                <DropDownButton text="Program" setValue={setProgram} selects={["zaxis", "rotation"]}
                                callback={async () => await context.send({"program": program})}/>
            ]}/>
        </>
    );
}

function DebugControl() {
    const context = useContext(ControllerContext);
    let loggers = context.data["loggers"];
    let debugging_event_loop = loggers["log_event_loop"] === "debug";
    let debugging_mdrive = loggers["log_mdrive"] === "debug";
    let debugging_vlinx = loggers["log_vlinx"] === "debug";

    return (
        <>
            <ToggleTableRow text={"Debugging Event Loop:"} state={debugging_event_loop} send={context.send}
                            setState={"debug_log_event_loop"}/>
            <ToggleTableRow text={"Debugging Mdrive:"} state={debugging_mdrive} send={context.send}
                            setState={"debug_log_mdrive"}/>
            <ToggleTableRow text={"Debugging Vlinx(rs232):"} state={debugging_vlinx} send={context.send}
                            setState={"debug_log_vlinx"}/>
        </>
    );
}

export function SimpleButton(props) {
    const context = useContext(ControllerContext);
    return (<SmallButtonSpinner text={props.text} callback={async () => await context.send(props.request)}/>);
}

function AdvancedControl() {
    return (
        <table className="table table-striped table-hover table-sm">
            <TableHeader items={["Motor Control", "Value", "Control"]}/>
            <tbody><MotorControl/></tbody>
            <TableHeader items={["Debug Control", "Value", "Control"]}/>
            <tbody><DebugControl/></tbody>
        </table>);
}


function SetPositionRow(props) {
    const context = useContext(ControllerContext);
    return (
        <TableRow items={
            [
                "Position",
                context.data["motor_position"],
                <FloatInputButton text="Set" value={props.positionTarget} setValue={props.setPositionTarget}
                                  callback={async () => await context.send({"set_motor_target_position": props.positionTarget})}/>
            ]}
        />);
}

export function useMdrive(url, title, load) {
    let [config, show, setShow, modalMessage] = useGenericPage(url, title)
    const [position, moving] = useStatus(config.data)
    const [positionTarget, setPositionTarget] = useState("");

    config.brief = position
    config.busy = moving

    let table_extra = <>
        <TableRow items={["Position Steps", config.data["motor_steps"], ""]}/>
        <TableRow items={["Load Position (config)", config.data["load_position"], <SimpleButton text="Load" request={{"load": true}}/>]}/>
        <SetPositionRow positionTarget={positionTarget} setPositionTarget={setPositionTarget}/>
    </>

    let button_extra = <>
    </>

    return [config, show, setShow, modalMessage, table_extra, button_extra]
}


export function Mdrive(props) {
    const root_url = useContext(HiveUrl);

    const url = root_url + props.hardware_value.proxy;
    const title = props.hardware_value.title;
    const load = props.hardware_value.load;

    let [config, show, setShow, modalMessage, table_extra, button_extra] = useMdrive(url, title, load)

    return (
        <ControllerContext.Provider value={config}>
            <ModalView show={show} setShow={setShow} message={modalMessage}/>
            <GenericControl table_extra={table_extra} button_extra={button_extra}/>
            <AdvancedControl/>
        </ControllerContext.Provider>);
}