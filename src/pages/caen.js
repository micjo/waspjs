import {GenericControl, FailureModal, useData, useModal} from "../components/generic_control";
import React, {useContext, useEffect, useState} from "react";
import {sendRequest} from "../http_helper";
import {TableHeader, TableRow, ToggleTableRowLog} from "../components/table_elements";
import {ControllerContext, HiveUrl} from "../App";
import {ProgressButton} from "../components/input_elements";
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




export function Caen(props) {
    const root_url = useContext(HiveUrl);

    const url = root_url + props.hardware_value.proxy;
    const title = props.hardware_value.title

    let [config, show, setShow, modalMessage, table_extra, button_extra] = useCaen(url, title)
    return (
        <ControllerContext.Provider value={config}>
            <FailureModal show={show} setShow={setShow} message={modalMessage}/>
            <GenericControl table_extra={table_extra} button_extra={button_extra}/>
            <DebugControl/>
            <HistogramCaen url={url}/>
        </ControllerContext.Provider>
    );
}

export function SimpleButton(props) {
    const context = useContext(ControllerContext);
    return (<ProgressButton text={props.text} callback={async () => await context.send(props.request)}/>);
}

export function useCaen(url, title) {
    const [modalMessage, show, setShow, cb] = useModal()
    const [data, setData, running] = useData(url, {"loggers": {}});
    const [acquiring, busy] = useStatus(data);

    const config = {
        title: title,
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
        <SimpleButton text="Upload All Registry" request={{"upload_all_registry": true}}/>
        <SimpleButton text="Start" request={{"start": true}}/>
        <SimpleButton text="Stop" request={{"stop": true}}/>
        <SimpleButton text="Clear" request={{"clear": true}}/>
    </>

    return [config, show, setShow, modalMessage, table_extra, button_extra];
}

function DebugControl() {
    const context = useContext(ControllerContext);
    let loggers = context.data["loggers"];

    let debugging_event_loop = loggers["event_loop"] === "debug";
    let debugging_dll = loggers["caen_dll"] === "debug";
    let debugging_command = loggers["caen_command"] === "debug";
    let debugging_events = loggers["caen_events"] === "debug";

    return (
        <>
            <table className="table table-striped table-hover table-sm">
                <TableHeader items={["Debug Control", "Value", "Control"]}/>
                <tbody>
                <ToggleTableRowLog text={"Debugging Event Loop:"} state={debugging_event_loop} send={context.send}
                                       name={"event_loop"}/>
                <ToggleTableRowLog text={"Debugging dll:"} state={debugging_dll} send={context.send}
                                name={"caen_dll"}/>
                <ToggleTableRowLog text={"Debugging Commands:"} state={debugging_command} send={context.send}
                                name={"caen_command"}/>
                <ToggleTableRowLog text={"Debugging Events:"} state={debugging_events} send={context.send}
                                name={"caen_events"}/>
                </tbody>
            </table>
        </>
    );
}
