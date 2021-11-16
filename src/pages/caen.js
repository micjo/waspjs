import {GenericControl, ModalView, useData, useModal} from "../components/generic_control";
import React, {useContext, useEffect, useState} from "react";
import {sendRequest} from "../http_helper";
import {TableHeader, TableRow, ToggleTableRow} from "../components/table_elements";
import {ControllerContext} from "../App";
import {ButtonSpinner} from "../components/input_elements";
import {HistogramCaen} from "../components/histogram_caen";


function useStatus(data) {
    const [acquiring, setAcquiring] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if ("acquisition_active" in data) {
            setAcquiring(data["acquisition_active"] ? "Acquiring" : "Idle");
        }
        if ("request_finished" in data) {
            setBusy(!data["request_finished"]);
        }
    }, [data])

    return [acquiring, busy]
}


function SimpleButton(props) {
    const context = useContext(ControllerContext);
    return (<ButtonSpinner text={props.text} callback={async () => await context.send(props.request)}/>);
}


export function Caen(props) {
    let [config, show, setShow, modalMessage, table_extra, button_extra] = useCaen(props.url)
    return (
        <ControllerContext.Provider value={config}>
                <ModalView show={show} setShow={setShow} message={modalMessage}/>
                <GenericControl table_extra={table_extra} button_extra={button_extra}/>
                <DebugControl/>
                <HistogramCaen url={props.url}/>
        </ControllerContext.Provider>
    );
}


export function useCaen(url) {
    const [modalMessage, show, setShow, cb] = useModal()
    const [data, setData, running] = useData(url, {"loggers":{}});
    const [acquiring, busy] = useStatus(data);

    const config = {
        title: "CAEN",
        url: url, data: data,
        busy: busy, brief: acquiring, running: running,
        popup: (message) => cb(message),
        setData: (data) => setData(data),
        send: async (request) => await sendRequest(url, request, cb, setData)
    }
    let table_extra = <>
        <TableRow items={["Acquiring", data["acquisition_active"] ? "True" : "False", ""]}/>
    </>
    let button_extra = <>
        <SimpleButton text="Connect" request={{"open_connection": true}}/>
        <SimpleButton text="Configure Registry" request={{"configure_registry": true}}/>
        <SimpleButton text="Dump Registry" request={{"read_registry": true}}/>
        <SimpleButton text="Start" request={{"start": true}}/>
        <SimpleButton text="Stop" request={{"stop": true}}/>
        <SimpleButton text="Clear" request={{"clear": true}}/>
    </>

    return [config, show, setShow, modalMessage, table_extra, button_extra];
}

function DebugControl() {
    const context = useContext(ControllerContext);
    let loggers = context.data["loggers"];

    let debugging_event_loop = loggers["log_event_loop"] === "debug";
    let debugging_dll = loggers["log_caen_dll"] === "debug";
    let debugging_command = loggers["log_caen_command"] === "debug";
    let debugging_events = loggers["log_caen_events"] === "debug";

    return (
        <>
            <table className="table table-striped table-hover table-sm">
            <TableHeader items={["Debug Control", "Value", "Control"]}/>
            <tbody>
            <ToggleTableRow text={"Debugging Event Loop:"} state={debugging_event_loop} send={context.send} setState={"debug_log_event_loop"}/>
            <ToggleTableRow text={"Debugging dll:"} state={debugging_dll} send={context.send} setState={"debug_log_caen_dll"}/>
            <ToggleTableRow text={"Debugging Commands:"} state={debugging_command} send={context.send} setState={"debug_log_caen_command"}/>
            <ToggleTableRow text={"Debugging Events:"} state={debugging_events} send={context.send} setState={"debug_log_caen_events"}/>
            </tbody>
            </table>
        </>
    );
}
