import { TableHeader, TableRow, ToggleTableRow, ToggleTableRowLog } from "../components/table_elements";
import { ProgressButton, FloatInputButton, IntInputButton, SmallLoadButton, Toggle } from "../components/input_elements";
import { sendRequest } from "../http_helper";
import React, { useContext, useEffect, useState } from "react";
import { GenericControl, FailureModal, useData, useModal } from "../components/generic_control";
import { ControllerContext, HiveUrl } from "../App";

function FirstPositionRow(props) {
    const context = useContext(ControllerContext);
    return (
        <TableRow items={
            [
                context.names[0],
                props.value,
                <FloatInputButton text="Set" value={props.target} setValue={props.setTarget}
                    callback={async () => await context.send({ "set_m1_target_position": props.target })} />
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
                    callback={async () => await context.send({ "set_m2_target_position": props.target })} />
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
            } />);
}

export function SimpleButton(props) {
    const context = useContext(ControllerContext);
    return (<SmallLoadButton text={props.text} callback={async () => await context.send(props.request)} />);
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
                                 callback={async () => await context.send({ "get_m2_temperature": true })} />]} />

            <TableRow items={["Position", context.data["motor_2_position"],
                <SmallLoadButton text="Get Position"
                                 callback={async () => await context.send({ "get_m2_position": true })} />
            ]} />
            <TableRow items={["Redefine Step Counter", context.data["motor_2_steps"],
                <IntInputButton text="Redefine" setValue={setNewStepCounter} value={newStepCounter}
                    callback={async () => await context.send({ "set_m2_step_counter": newStepCounter })} />
            ]} />
            <TableRow items={["Redefine offset", context.data["motor_2_offset"],
                <FloatInputButton text="Redefine" setValue={setNewOffset} value={newOffset}
                    callback={async () => await context.send({ "set_m2_offset": newOffset })} />
            ]} />
            <TableRow items={["Redefine load position", context.data["motor_2_load_position"],
                <FloatInputButton text="Redefine" setValue={setNewLoadPosition} value={newLoadPosition}
                    callback={async () => await context.send({ "set_m2_load_position": newLoadPosition })} />
            ]} />
            <TableRow items={["Redefine Motor Position", context.data["motor_2_position"],
                <FloatInputButton text="Redefine" setValue={setNewMotorPosition} value={newMotorPosition}
                    callback={async () => await context.send({ "set_m2_position": newMotorPosition })} />
            ]} />
            <TableRow items={["Updating Position", context.data["motor_2_updating_position"] ? "True" : "False",
                <Toggle checked={context.data["motor_2_updating_position"]}
                    callback={async () =>
                        await context.send({ "toggle_get_m2_position": !context.data["motor_2_updating_position"] })} />]} />
            <TableRow items={["Updating Temperature", context.data["motor_2_updating_temperature"] ? "True" : "False",
                <Toggle checked={context.data["motor_2_updating_temperature"]}
                    callback={async () =>
                        await context.send({ "toggle_get_m2_temperature": !context.data["motor_2_updating_temperature"] })} />]} />
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
                                 callback={async () => await context.send({ "get_m1_temperature": true })} />]} />

            <TableRow items={["Position", context.data["motor_1_position"],
                <SmallLoadButton text="Get Position"
                                 callback={async () => await context.send({ "get_m1_position": true })} />
            ]} />
            <TableRow items={["Redefine Step Counter", context.data["motor_1_steps"],
                <IntInputButton text="Redefine" setValue={setNewStepCounter} value={newStepCounter}
                    callback={async () => await context.send({ "set_m1_step_counter": newStepCounter })} />
            ]} />
            <TableRow items={["Redefine offset", context.data["motor_1_offset"],
                <FloatInputButton text="Redefine" setValue={setNewOffset} value={newOffset}
                    callback={async () => await context.send({ "set_m1_offset": newOffset })} />
            ]} />
            <TableRow items={["Redefine load position", context.data["motor_1_load_position"],
                <FloatInputButton text="Redefine" setValue={setNewLoadPosition} value={newLoadPosition}
                    callback={async () => await context.send({ "set_m1_load_position": newLoadPosition })} />
            ]} />
            <TableRow items={["Redefine Motor Position", context.data["motor_1_position"],
                <FloatInputButton text="Redefine" setValue={setNewMotorPosition} value={newMotorPosition}
                    callback={async () => await context.send({ "set_m1_position": newMotorPosition })} />
            ]} />
            <TableRow items={["Updating Position", context.data["motor_1_updating_position"] ? "True" : "False",
                <Toggle checked={context.data["motor_1_updating_position"]}
                    callback={async () =>
                        await context.send({ "toggle_get_m1_position": !context.data["motor_1_updating_position"] })} />]} />
            <TableRow items={["Updating Temperature", context.data["motor_1_updating_temperature"] ? "True" : "False",
                <Toggle checked={context.data["motor_1_updating_temperature"]}
                    callback={async () =>
                        await context.send({ "toggle_get_m1_temperature": !context.data["motor_1_updating_temperature"] })} />]} />
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
            <ToggleTableRowLog text={"Debugging Event Loop:"} state={debugging_event_loop} send={context.send} name={"event_loop"}/>
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
            <TableHeader items={[context.names[0] + " Control", "Value", "Control"]} />
            <tbody><FirstControl /></tbody>
            <TableHeader items={[context.names[1] + " Control", "Value", "Control"]} />
            <tbody><SecondControl /></tbody>
            <TableHeader items={["Debug Control", "Value", "Control"]} />
            <tbody><DebugControl /></tbody>
        </table>);
}


export function useAml(url, names, loads, title) {
    const [modalMessage, show, setShow, cb] = useModal()
    const [data, setData, running] = useData(url, { "loggers": {} });
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
        <TableRow items={["Expiry Date", data["expiry_date"], ""]} />
        <FirstPositionRow value={data["motor_1_position"]} target={firstTarget}
            setTarget={setFirstTarget} />

        <TableRow items={
            [config.names[0] + " load (config)", data["motor_1_load_position"],
             <SimpleButton text="Load" request={{ "m1_load": true }}/>]}/>
        <SecondPositionRow value={data["motor_2_position"]} target={secondTarget}
            setTarget={setSecondTarget} />
        <TableRow items={
            [config.names[1] + " load (config)", data["motor_2_load_position"],
             <SimpleButton text="Load" request={{ "m2_load": true }}/>]}/>
    </>
    let button_extra = <>
        <MoveButton firstTarget={firstTarget} secondTarget={secondTarget} />
    </>


    return [config, show, setShow, modalMessage, table_extra, button_extra];
}


export function Aml(props) {
    const root_url = useContext(HiveUrl);
    const url = root_url + props.hardware_value.proxy;
    const names = props.hardware_value.names;
    const loads = props.hardware_value.loads;
    const title = props.hardware_value.title

    let [config, show, setShow, modalMessage, table_extra, button_extra] = useAml(url, names, loads, title)

    return (
        <ControllerContext.Provider value={config}>
            <FailureModal show={show} setShow={setShow} message={modalMessage} />
            <GenericControl table_extra={table_extra} button_extra={button_extra} />
            <AdvancedControl />
        </ControllerContext.Provider>);
}
