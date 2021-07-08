import {TableHeader, TableRow} from "../components/table_elements";
import {ButtonSpinner, IntInputButton, SmallButtonSpinner, Toggle} from "../components/button_spinner";
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


function SecondControl(props) {
    const [newStepCounter, setNewStepCounter] = useState('');
    const [newMotorPosition, setNewMotorPosition] = useState('');
    const [newOffset, setNewOffset] = useState('');
    const context = useContext(ControllerContext);
    return (
        <>
            <TableRow items={["Temperature", props.data["motor_2_temperature"],
                <SmallButtonSpinner text="Get Temperature"
                                    callback={async () => await context.send({"get_m2_temperature": true})}/>]}/>

            <TableRow items={["Position", props.data["motor_2_position"],
                <SmallButtonSpinner text="Get Position"
                                    callback={async () => await context.send({"get_m2_position": true})}/>
            ]}/>
            <TableRow items={["Redefine Step Counter", props.data["motor_2_steps"],
                <IntInputButton text="Redefine" setValue={setNewStepCounter} value={newStepCounter}
                                callback={async () => await context.send({"set_m2_step_counter": newStepCounter})}/>
            ]}/>
            <TableRow items={["Redefine offset", props.data["motor_2_offset"],
                <IntInputButton text="Redefine" setValue={setNewOffset} value={newOffset}
                                callback={async () => await context.send({"set_m2_offset": newOffset})}/>
            ]}/>
            <TableRow items={["Redefine Motor Position", props.data["motor_2_position"],
                <IntInputButton text="Redefine" setValue={setNewMotorPosition} value={newMotorPosition}
                                callback={async () => await context.send({"set_m2_position": newMotorPosition})}/>
            ]}/>
            <TableRow items={["Updating Position", props.data["motor_2_updating_position"] ? "True" : "False",
                <Toggle data={props.data} keyGet="motor_2_updating_position"
                        callback={async () =>
                            await context.send({"toggle_get_m2_position": !props.data["motor_2_updating_position"]})}/>]}/>
            <TableRow items={["Updating Temperature", props.data["motor_2_updating_temperature"] ? "True" : "False",
                <Toggle data={props.data} keyGet="motor_2_updating_temperature"
                        callback={async () =>
                            await context.send({"toggle_get_m2_temperature": !props.data["motor_2_updating_temperature"]})}/>]}/>
        </>
    );
}

function FirstControl(props) {
    const [newStepCounter, setNewStepCounter] = useState('');
    const [newMotorPosition, setNewMotorPosition] = useState('');
    const [newOffset, setNewOffset] = useState('');
    const context = useContext(ControllerContext);

    return (
        <>
            <TableRow items={["Temperature", props.data["motor_1_temperature"],
                <SmallButtonSpinner text="Get Temperature"
                                    callback={async () => await context.send({"get_m1_temperature": true})}/>]}/>

            <TableRow items={["Position", props.data["motor_1_position"],
                <SmallButtonSpinner text="Get Position"
                                    callback={async () => await context.send({"get_m1_position": true})}/>
            ]}/>
            <TableRow items={["Redefine Step Counter", props.data["motor_1_steps"],
                <IntInputButton text="Redefine" setValue={setNewStepCounter} value={newStepCounter}
                                callback={async () => await context.send({"set_m1_step_counter": newStepCounter})}/>
            ]}/>
            <TableRow items={["Redefine offset", props.data["motor_1_offset"],
                <IntInputButton text="Redefine" setValue={setNewOffset} value={newOffset}
                                callback={async () => await context.send({"set_m1_offset": newOffset})}/>
            ]}/>
            <TableRow items={["Redefine Motor Position", props.data["motor_1_position"],
                <IntInputButton text="Redefine" setValue={setNewMotorPosition} value={newMotorPosition}
                                callback={async () => await context.send({"set_m1_position": newMotorPosition})}/>
            ]}/>
            <TableRow items={["Updating Position", props.data["motor_1_updating_position"] ? "True" : "False",
                <Toggle data={props.data} keyGet="motor_1_updating_position"
                        callback={async () =>
                            await context.send({"toggle_get_m1_position": !props.data["motor_1_updating_position"]})}/>]}/>
            <TableRow items={["Updating Temperature", props.data["motor_1_updating_temperature"] ? "True" : "False",
                <Toggle data={props.data} keyGet="motor_1_updating_temperature"
                        callback={async () =>
                            await context.send({"toggle_get_m1_temperature": !props.data["motor_1_updating_temperature"]})}/>]}/>
        </>
    );
}


function DebugControl(props) {
    const context = useContext(ControllerContext);
    return (
        <>
            <TableRow items={["Debugging rs232:", props.data["debug_rs232"] ? "True" : "False",
                <Toggle data={props.data} keyGet="debug_rs232"
                        callback={async () => await context.send({"debug_rs232": !props.data["debug_rs232"]})}
                />]}/>
            <TableRow items={["Debugging Broker:", props.data["debug_broker"] ? "True" : "False",
                <Toggle data={props.data} keyGet="debug_broker"
                        callback={async () => await context.send({"debug_broker": !props.data["debug_broker"]})}
                />]}/>
            <TableRow items={["Debugging Aml:", props.data["debug_aml"] ? "True" : "False",
                <Toggle data={props.data} keyGet="debug_aml"
                        callback={async () => await context.send({"debug_aml": !props.data["debug_aml"]})}
                />]}/>
        </>
    );
}


function useStatus(data) {
    const [position, setPosition] = useState("");
    const [moving, setMoving] = useState(false);

    useEffect( () => {
        if (data["motor_1_position"] && data["motor_2_position"]) {
            setPosition(data["motor_1_position"] + ", " + data["motor_2_position"]);
        }
        if (data["request_finished"]){
            setMoving(!data["request_finished"]);
        }
    }, [data])

    return {position, moving}
}


export function Aml(props) {
    const {modalMessage, show, setShow, cb} = useModal()
    const {data, setData, running} = useData(props.url);
    const {position, moving} = useStatus(data);
    const [firstTarget, setFirstTarget] = useState('');
    const [secondTarget, setSecondTarget] = useState('');

    const config = {
        title: "AML " + props.names[0] + " " + props.names[1],
        url: props.url, names: props.names, loads: props.loads,
        busy: moving, brief: position, running: running,
        popup: (message) => cb(message),
        setData: (data) => setData(data),
        send: async (request) => await sendRequest(props.url, request, cb, setData)
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

    return (
        <ControllerContext.Provider value={config}>
            <ModalView show={show} setShow={setShow} message={modalMessage}/>
            <GenericControl data={data} table_extra={table_extra} button_extra={button_extra}/>

            <hr/>
            <table className="table table-striped table-hover table-sm">
                <TableHeader items={[props.names[0] + " Control", "Value", "Control"]}/>
                <tbody>
                <FirstControl data={data} setData={setData}/>
                </tbody>
                <TableHeader items={[props.names[1] + " Control", "Value", "Control"]}/>
                <tbody>
                <SecondControl data={data} url={props.url} setData={setData}/>
                </tbody>
                <TableHeader items={["Debug Control", "Value", "Control"]}/>
                <tbody>
                <DebugControl data={data} url={props.url}/>
                </tbody>
            </table>
        </ControllerContext.Provider>);
}