import React, {useContext, useEffect, useState} from "react";
import {getJson, sendRequest} from "../http_helper";
import {TableHeader, TableRow} from "../components/table_elements";
import {GenericControl, ModalView, useModal} from "../components/generic_control";
import {ControllerContext} from "../App";
import {ButtonSpinner, FloatInputButton, IntInputButton, SmallButtonSpinner} from "../components/button_spinner";


function useData(url) {
    const [data, setData] = useState({});
    const [brief, setBrief] = useState("");
    const [moving, setMoving] = useState(false);
    const [running, setRunning] = useState("");

    useEffect(() => {
        const interval = setInterval(async () => {
            let [status, json_response] = await getJson(url);
            if (status === 404) {
                setRunning("Not connected");
            } else {
                setRunning("Running");
                setData(json_response);
                setBrief(json_response["status"] + ", " + json_response["motor_2_position"]);
                setMoving(!json_response["request_finished"]);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [url]);

    return {data, setData, moving, brief, running}
}

function useStatus(data) {
    const [counts, setCounts] = useState("");
    const [counting, setCounting] = useState(false);

    useEffect( () => {
        setCounts(data["charge(nC)"] + " -> " + data["target_charge(nC)"]);
        setCounting(data["status"] === "Counting");
    }, [data])

    return {counts, counting}

}

function PauseButton() {
    const context = useContext(ControllerContext)
    return (<ButtonSpinner text="Pause" callback={ async () => await context.send({"pause_counting": true})}/>);
}

function ClearStartButton() {
    const context = useContext(ControllerContext)
    return (<ButtonSpinner text="Clear Start" callback={ async () => await context.send({"clear-start_counting": true})}/>);
}

function CountingSettings(props) {
    const context = useContext(ControllerContext);
    const [targetCharge, setTargetCharge] = useState("");
    const [pulseToCount, setPulseToCount] = useState("");
    const [countsToCharge, setCountsToCharge] = useState("");

        return (
            <>
               <TableRow items={[
                "Target Charge:", props.data["target_charge(nC)"],
                <IntInputButton text="Set" value={targetCharge} setValue={setTargetCharge}
                                callback={async () => await context.send({"target_charge": targetCharge})}/>
                ]}/>
                <TableRow items={[
                "Pulses to counts factor:", props.data["counter_factor"],
                <FloatInputButton text="Set" value={pulseToCount} setValue={setPulseToCount}
                                callback={async () => await context.send({"pulse_count_factor": pulseToCount})}/>
                ]}/>
                <TableRow items={[
                "Counts to charge factor:", props.data["nc_to_pulses_conversion_factor"],
                <FloatInputButton text="Set" value={countsToCharge} setValue={setCountsToCharge}
                                callback={async () => await context.send({"count_charge_factor": countsToCharge})}/>
                ]}/>
            </>


);
}

export function Motrona(props) {
    const {modalMessage, show, setShow, cb} = useModal()
    const {data, setData, running} = useData(props.url);
    const {counts, counting} = useStatus(data);

    const config = {
        title: "Motrona RBS",
        url: props.url, busy: counting, brief: counts, running: running,
        popup: (message) => cb(message), setData: (data) => setData(data),
        send: async (request) => await sendRequest(props.url, request, cb, setData)
    }

    let table_extra = <>
        <TableRow items={["Counts", data["counts"], ""]}/>
        <TableRow items={["Counting Status", data["status"], ""]}/>
        <TableRow items={["Charge (nC):", data["charge(nC)"], ""]}/>
        <TableRow items={["Counting time (msec):", data["counting_time(msec)"], ""]}/>
        <TableRow items={["Current (nA)", data["current(nA)"], ""]}/>
        <TableRow items={["Target Counts:", data["target_counts"], ""]}/>
        <TableRow items={["Firmware Version", data["firmware_version"], ""]}/>
    </>

    let button_extra = <>
        <PauseButton />
        <ClearStartButton />
    </>

    return (
        <ControllerContext.Provider value={config}>
            <ModalView show={show} setShow={setShow} message={modalMessage}/>
            <GenericControl data={data} table_extra={table_extra} button_extra={button_extra}/>

            <hr/>
            <table className="table table-striped table-hover table-sm">
                <TableHeader items={["Counting Settings", "Value", "Control"]}/>
                <tbody>
                <CountingSettings data={data}/>
                </tbody>
                <TableHeader items={["Analog Settings", "Value", "Control"]}/>
                <tbody>
                </tbody>
                <TableHeader items={["Preselection Settings", "Value", "Control"]}/>
                <tbody>
                </tbody>
                <TableHeader items={["Debug Control", "Value", "Control"]}/>
                <tbody>
                </tbody>
            </table>
        </ControllerContext.Provider>);
}
