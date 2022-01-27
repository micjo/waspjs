import React, {useContext, useEffect, useState} from "react";
import {sendRequest} from "../http_helper";
import {TableHeader, TableRow, ToggleTableRow, ToggleTableRowLog} from "../components/table_elements";
import {GenericControl, ModalView, useData, useModal} from "../components/generic_control";
import {ControllerContext, HiveUrl} from "../App";
import {ButtonSpinner, FloatInputButton, IntInputButton, DropDownButton} from "../components/input_elements";

function useStatus(data) {
    const [counts, setCounts] = useState("");
    const [counting, setCounting] = useState(false);

    useEffect(() => {
        if ("charge(nC)" in data && "target_charge(nC)" in data) {
            setCounts(data["charge(nC)"] + " -> " + data["target_charge(nC)"]);
        } else {
            setCounts("")
        }
        if ("status" in data) {
            setCounting(data["status"] === "Counting");
        }
    }, [data])

    return [counts, counting]

}

function PauseButton() {
    const context = useContext(ControllerContext)
    return (<ButtonSpinner text="Pause" callback={async () => await context.send({"pause_counting": true})}/>);
}

function ClearStartButton() {
    const context = useContext(ControllerContext)
    return (
        <ButtonSpinner text="Clear Start" callback={async () => await context.send({"clear-start_counting": true})}/>);
}

function CountingSettings() {
    const context = useContext(ControllerContext);
    const [targetCharge, setTargetCharge] = useState("");
    const [pulseToCount, setPulseToCount] = useState("");
    const [countsToCharge, setCountsToCharge] = useState("");
    const [countMode, setCountMode] = useState("");
    const [inputPulse, setInputPulse] = useState("");

    return (
        <>
            <TableRow items={[
                "Target Charge:", context.data["target_charge(nC)"],
                <IntInputButton text="Set" value={targetCharge} setValue={setTargetCharge}
                                callback={async () => await context.send({"target_charge": targetCharge})}/>
            ]}/>
            <TableRow items={[
                "Pulses to counts factor:", context.data["counter_factor"],
                <FloatInputButton text="Set" value={pulseToCount} setValue={setPulseToCount}
                                  callback={async () => await context.send({"pulse_count_factor": pulseToCount})}/>
            ]}/>
            <TableRow items={[
                "Counts to charge factor:", context.data["nc_to_pulses_conversion_factor"],
                <FloatInputButton text="Set" value={countsToCharge} setValue={setCountsToCharge}
                                  callback={async () => await context.send({"count_charge_factor": countsToCharge})}/>
            ]}/>
            <TableRow items={[
                "Counting Mode:", context.data["count_mode"],
                <DropDownButton text="Set" setValue={setCountMode}
                                selects={["a_single", "a+b", "a-b", "a/b_90_x1", "a/b_90_x2", "a/b_90_x4"]}
                                callback={async () => await context.send({"set_count_mode": countMode})}/>
            ]}/>
            <TableRow items={[
                "Input Pulse:", context.data["input_pulse_type"],
                <DropDownButton text="Set" setValue={setInputPulse} selects={["npn", "pnp", "namur", "tri-state"]}
                                callback={async () => await context.send({"set_type_of_input_pulse": inputPulse})}/>
            ]}/>
        </>
    );
}

function AnalogSettings() {
    const context = useContext(ControllerContext);

    const [analogStart, setAnalogStart] = useState("")
    const [analogEnd, setAnalogEnd] = useState("")
    const [analogGain, setAnalogGain] = useState("")
    const [analogOffset, setAnalogOffset] = useState("")
    return (
        <>
            <TableRow items={[
                "Analog Start:", context.data["analog_start"],
                <IntInputButton text="Set" value={analogStart} setValue={setAnalogStart}
                                callback={async () => await context.send({"set_analog_start": analogStart})}/>
            ]}/>
            <TableRow items={[
                "Analog End:", context.data["analog_end"],
                <IntInputButton text="Set" value={analogEnd} setValue={setAnalogEnd}
                                callback={async () => await context.send({"set_analog_end": analogEnd})}/>
            ]}/>
            <TableRow items={[
                "Analog Gain:", context.data["analog_gain"],
                <FloatInputButton text="Set" value={analogGain} setValue={setAnalogGain}
                                  callback={async () => await context.send({"set_analog_gain": analogGain})}/>
            ]}/>
            <TableRow items={[
                "Analog Offset:", context.data["analog_offset"],
                <FloatInputButton text="Set" value={analogOffset} setValue={setAnalogOffset}
                                  callback={async () => await context.send({"set_analog_offset": analogOffset})}/>
            ]}/>


        </>
    )
}

export function PreselectionSettings() {
    const context = useContext(ControllerContext);
    const [preselectionOne, setPreselectionOne] = useState("");
    const [preselectionTwo, setPreselectionTwo] = useState("");
    const [preselectionThree, setPreselectionThree] = useState("");
    const [preselectionFour, setPreselectionFour] = useState("");
    return (
        <>
            <TableRow items={[
                "Preselection 1:", context.data["preselection_1"],
                <IntInputButton text="Set" value={preselectionOne} setValue={setPreselectionOne}
                                callback={async () => await context.send({"preselection_1": preselectionOne})}/>
            ]}/>
            <TableRow items={[
                "Preselection 2:", context.data["preselection_2"],
                <IntInputButton text="Set" value={preselectionTwo} setValue={setPreselectionTwo}
                                callback={async () => await context.send({"preselection_2": preselectionTwo})}/>
            ]}/>
            <TableRow items={[
                "Preselection 3:", context.data["preselection_3"],
                <IntInputButton text="Set" value={preselectionThree} setValue={setPreselectionThree}
                                callback={async () => await context.send({"preselection_3": preselectionThree})}/>
            ]}/>
            <TableRow items={[
                "Preselection 4:", context.data["preselection_4"],
                <IntInputButton text="Set" value={preselectionFour} setValue={setPreselectionFour}
                                callback={async () => await context.send({"preselection_4": preselectionFour})}/>
            ]}/>


        </>
    )
}

function DebugControl() {
    const context = useContext(ControllerContext);
    let loggers = context.data["loggers"];
    let debugging_event_loop = loggers["event_loop"] === "debug";
    let debugging_motrona = loggers["motrona"] === "debug";
    let debugging_vlinx = loggers["vlinx"] === "debug";

    return (
        <>
            <ToggleTableRowLog text={"Debugging Event Loop:"} state={debugging_event_loop} send={context.send}
                               name={"event_loop"}/>
            <ToggleTableRowLog text={"Debugging Motrona:"} state={debugging_motrona} send={context.send}
                               name={"motrona"}/>
            <ToggleTableRowLog text={"Debugging Vlinx(rs232):"} state={debugging_vlinx} send={context.send}
                               name={"vlinx"}/>
        </>
    );
}

function AdvancedControl() {
    return (
        <table className="table table-striped table-hover table-sm">
            <TableHeader items={["Counting Settings", "Value", "Control"]}/>
            <tbody>
            <CountingSettings/>
            </tbody>
            <TableHeader items={["Analog Settings", "Value", "Control"]}/>
            <tbody>
            <AnalogSettings/>
            </tbody>
            <TableHeader items={["Preselection Settings", "Value", "Control"]}/>
            <tbody>
            <PreselectionSettings/>
            </tbody>
            <TableHeader items={["Debug Control", "Value", "Control"]}/>
            <tbody>
            <DebugControl/>
            </tbody>
        </table>);

}

export function useMotrona(url, title) {
    const [modalMessage, show, setShow, cb] = useModal()
    const [data, setData, running] = useData(url, {"loggers": {}});
    const [counts, counting] = useStatus(data);

    const config = {
        title: title, data: data,
        url: url, busy: counting, brief: counts, running: running,
        popup: (message) => cb(message), setData: (data) => setData(data),
        send: async (request) => await sendRequest(url, request, cb, setData)
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
        <PauseButton/>
        <ClearStartButton/>
    </>

    return [config, show, setShow, modalMessage, table_extra, button_extra]
}

export function Motrona(props) {
    const root_url = useContext(HiveUrl);

    const url = root_url + props.hardware_value.proxy;
    const title = props.hardware_value.title

    let [config, show, setShow, modalMessage, table_extra, button_extra] = useMotrona(url, title)

    return (
        <ControllerContext.Provider value={config}>
            <ModalView show={show} setShow={setShow} message={modalMessage}/>
            <GenericControl table_extra={table_extra} button_extra={button_extra}/>
            <AdvancedControl/>
        </ControllerContext.Provider>);
}
