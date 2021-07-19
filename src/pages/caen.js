import {GenericControl, ModalView, useData, useModal} from "../components/generic_control";
import React, {useContext, useEffect, useState} from "react";
import {sendRequest} from "../http_helper";
import {TableRow} from "../components/table_elements";
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

    return {acquiring, busy}
}


function SimpleButton(props) {
    const context = useContext(ControllerContext);
    return (<ButtonSpinner text={props.text} callback={async () => await context.send(props.request)}/>);
}


export function Caen(props) {
    return (
        <>
            <CaenControl url={props.url}/>
            <HistogramCaen url={props.url}/>
        </>
    );
}


export function useCaen(url) {
    const {modalMessage, show, setShow, cb} = useModal()
    const {data, setData, running} = useData(url);
    const {acquiring, busy} = useStatus(data);

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
        <SimpleButton text="Configure Registry" request={{"write_registry": true}}/>
        <SimpleButton text="Dump Registry" request={{"store_registry": true}}/>
        <SimpleButton text="Start Acquisition" request={{"start_acquisition": true}}/>
        <SimpleButton text="Stop Acquisition" request={{"stop_acquisition": true}}/>
        <SimpleButton text="Clear Acquisition" request={{"clear_acquisition": true}}/>
    </>

    return {config, show, setShow, modalMessage, table_extra, button_extra};
}

export function CaenControl(props) {
    let {config, show, setShow, modalMessage, table_extra, button_extra} = useCaen(props.url)

    return (
        <ControllerContext.Provider value={config}>
            <>
                <ModalView show={show} setShow={setShow} message={modalMessage}/>
                <GenericControl table_extra={table_extra} button_extra={button_extra}/>
                <hr/>
            </>
        </ControllerContext.Provider>
    );
}
