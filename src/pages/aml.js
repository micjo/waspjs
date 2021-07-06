import {TableHeader, TableRow} from "../components/table_elements";
import {ButtonSpinner, IntInputButton, Toggle} from "../components/button_spinner";
import {getJson, sendRequest} from "../http_helper";
import {useCallback, useEffect, useRef, useState} from "react";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function doNothing() {
    console.log('Taking a break...');
    await sleep(2000);
    console.log('Two seconds later, showing sleep in a loop...');
}


function FirstPositionRow(props) {
    return (
        <TableRow items={
            [
                props.name,
                props.value,
                <IntInputButton text="Set" value={props.valueSet} callback={async () => {
                    await sendRequest(props.url, {"set_m1_target_position": props.valueSet})
                }}/>
            ]}
        />);
}

function SecondPositionRow(props) {
    return (
        <TableRow items={
            [
                props.name,
                props.value,
                <IntInputButton text="Set" value={props.valueSet} callback={async () => {
                    await sendRequest(props.url, {"set_m2_target_position": props.valueSet})
                }}/>
            ]}
        />);
}

function MoveButton(props) {
    return (
        <ButtonSpinner text="Move Both"
                       callback={
                           async () => await sendRequest(props.url, {
                               "set_m1_target_position": props.firstTarget,
                               "set_m2_target_position": props.secondTarget
                           })
                       }/>);
}

function LoadButton(props) {
    return (
        <ButtonSpinner text="Load"
                       callback={() => {
                           props.setFirstTarget(props.first);
                           props.setSecondTarget(props.second);
                       }}/>
    );
}

function HideButton(props) {
    return (
        <ButtonSpinner text="Hide" callback={async () => {
            await sendRequest(props.url, {"hide": false})
        }}/>
    );
}

function ShowButton(props) {
    return (
        <ButtonSpinner text="Show" callback={async () => {
            await sendRequest(props.url, {"hide": true})
        }}/>
    );
}

function ContinueButton(props) {
    return (
        <ButtonSpinner text="Continue" callback={async () => {
            await sendRequest(props.url, {"continue": true})
        }}/>
    );
}

function SecondControl(props) {
    const [newStepCounter, setNewStepCounter] = useState('');
    const [newMotorPosition, setNewMotorPosition] = useState('');
    const [newOffset, setNewOffset] = useState('');
    return (
        <>
            <TableRow items={["Temperature", props.data["second_temperature"],
                <ButtonSpinner text="Get Temperature" style="btn-sm float-end" callback={async () => {
                    await sendRequest(props.url, {"get_m2_temperature": true})
                }}/>]}/>

            <TableRow items={["Position", props.data["motor_2_position"],
                <ButtonSpinner text="Get Position" style="btn-sm float-end" callback={async () => {
                    await sendRequest(props.url, {"get_m2_position": true})
                }}/>]}/>
            <TableRow items={["Redefine Step Counter", props.data["motor_2_steps"],
                <IntInputButton text="Redefine" setValue={setNewStepCounter} value={newStepCounter}
                                callback={async () => {
                                    await sendRequest(props.url, {"set_m2_step_counter": newStepCounter});
                                }}/>
            ]}/>
            <TableRow items={["Redefine offset", props.data["motor_2_offset"],
                <IntInputButton text="Redefine" setValue={setNewOffset} value={newOffset}
                                callback={async () => {
                                    await sendRequest(props.url, {"set_m2_offset": newOffset});
                                }}/>
            ]}/>
            <TableRow items={["Redefine Motor Position", props.data["motor_2_position"],
                <IntInputButton text="Redefine" setValue={setNewMotorPosition} value={newMotorPosition}
                                callback={async () => {
                                    await sendRequest(props.url, {"set_m2_position": newMotorPosition});
                                }}/>
            ]}/>
            <TableRow items={["Updating Position", props.data["motor_2_updating_position"] ? "True" : "False",
                <Toggle data={props.data} url={props.url} keyGet="motor_2_updating_position"
                        keySet="toggle_get_m2_position" setData={props.setData}/>]}/>
            <TableRow items={["Updating Temperature", props.data["motor_2_updating_temperature"]? "True":"False",
                <Toggle data={props.data} url={props.url} keyGet="motor_2_updating_temperature"
                        keySet="toggle_get_m2_temperature" setData={props.setData}/>]}/>
        </>
    );
}

function FirstControl(props) {
    const [newStepCounter, setNewStepCounter] = useState('');
    const [newMotorPosition, setNewMotorPosition] = useState('');
    const [newOffset, setNewOffset] = useState('');
    return (
        <>
            <TableRow items={["Temperature", props.data["first_temperature"],
                <ButtonSpinner text="Get Temperature" style="btn-sm float-end" callback={async () => {
                    await sendRequest(props.url, {"get_m1_temperature": true})
                }}/>]}/>

            <TableRow items={["Position", props.data["motor_1_position"],
                <ButtonSpinner text="Get Position" style="btn-sm float-end" callback={async () => {
                    await sendRequest(props.url, {"get_m1_position": true})
                }}/>]}/>
            <TableRow items={["Redefine Step Counter", props.data["motor_1_steps"],
                <IntInputButton text="Redefine" setValue={setNewStepCounter} value={newStepCounter}
                                callback={async () => {
                                    await sendRequest(props.url, {"set_m1_step_counter": newStepCounter});
                                }}/>
            ]}/>
            <TableRow items={["Redefine offset", props.data["motor_1_offset"],
                <IntInputButton text="Redefine" setValue={setNewOffset} value={newOffset}
                                callback={async () => {
                                    await sendRequest(props.url, {"set_m1_offset": newOffset});
                                }}/>
            ]}/>
            <TableRow items={["Redefine Motor Position", props.data["motor_1_position"],
                <IntInputButton text="Redefine" setValue={setNewMotorPosition} value={newMotorPosition}
                                callback={async () => {
                                    await sendRequest(props.url, {"set_m1_position": newMotorPosition});
                                }}/>
            ]}/>
            <TableRow items={["Updating Position", props.data["motor_1_updating_position"] ? "True" : "False",
                <Toggle data={props.data} url={props.url} keyGet="motor_1_updating_position"
                        keySet="toggle_get_m1_position" setData={props.setData}/>]}/>
            <TableRow items={["Updating Temperature", props.data["motor_1_updating_temperature"]? "True":"False",
            <Toggle data={props.data} url={props.url} keyGet="motor_1_updating_temperature"
                    keySet="toggle_get_m1_temperature" setData={props.setData}/>]}/>
        </>
    );
}

export function Aml(props) {

    const [data, setData] = useState({});
    useEffect(() => {
        const interval = setInterval(async () => {
            setData(await getJson(props.url))
        }, 1000);
        return () => clearInterval(interval);
    }, [props.url]);

    const [brief, setBrief] = useState("");
    const [moving, setMoving] = useState("none");
    const [running, setRunning] = useState("");
    const [firstTarget, setFirstTarget] = useState('');
    const [secondTarget, setSecondTarget] = useState('');
    return (
        <>
            <div className="clearfix">
                <h3 className="float-start">AML {props.names[0]} {props.names[1]}</h3>
                <h5 className="clearfix float-end">
                    <span className="badge bg-info">{brief}</span>
                    <span className="spinner-border spinner-border-sm" style={{"display": moving}}/>
                    <span className="badge badge-danger">{running}</span>
                </h5>
            </div>
            <hr/>
            <table className="table table-striped table-hover table-sm">
                <TableHeader items={["Identifier", "Value", "Control"]}/>
                <tbody>
                <TableRow items={["Request acknowledge", data["request_id"], ""]}/>
                <TableRow items={["Request Finished", data["request_finished"] ? "True" : "False", ""]}/>
                <TableRow items={["Error", data["error"], ""]}/>
                <TableRow items={["Expiry Date", data["expiry_date"], ""]}/>
                <FirstPositionRow name={props.names[0]} value={data["motor_1_position"]} valueSet={firstTarget} url={props.url}/>
                <SecondPositionRow name={props.names[1]} value={data["motor_2_position"]} valueSet={secondTarget} url={props.url}/>
                </tbody>
            </table>

            <div className="clearfix">
                <div className="btn-group float-end">
                    <MoveButton url={props.url} firstTarget={firstTarget} secondTarget={secondTarget}/>
                    <LoadButton setFirstTarget={setFirstTarget} setSecondTarget={setSecondTarget}
                                first="100" second="200"/>
                    <HideButton url={props.url}/>
                    <ShowButton url={props.url}/>
                    <ContinueButton url={props.url}/>
                </div>
            </div>

            <hr/>
            <table className="table table-striped table-hover table-sm">
                <TableHeader items={[props.names[0] + " Control", "Value", "Control"]}/>
                <tbody>
                <FirstControl data={data} url={props.url} setData={setData}/>
                </tbody>
                <TableHeader items={[props.names[1] + " Control", "Value", "Control"]}/>
                <tbody>
                <SecondControl data={data} url={props.url} setData={setData}/>
                </tbody>
                <TableHeader items={["Debug Control", "Value", "Control"]}/>
                <tbody>
                <TableRow items={["Debugging rs232:", data["debug_rs232"]? "True":"False",
                    <Toggle data={data} url={props.url} keyGet="debug_rs232"
                            keySet="debug_rs232" setData={setData}/>]}/>
                <TableRow items={["Debugging Broker:", data["debug_broker"]? "True":"False",
                    <Toggle data={data} url={props.url} keyGet="debug_broker"
                            keySet="debug_broker" setData={setData}/>]}/>
                <TableRow items={["Debugging Aml:", data["debug_aml"]? "True":"False",
                    <Toggle data={data} url={props.url} keyGet="debug_aml"
                            keySet="debug_aml" setData={setData}/>]}/>
                </tbody>
            </table>
        </>);
}