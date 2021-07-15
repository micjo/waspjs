import {GenericControl, ModalView, useData, useModal} from "../components/generic_control";
import React, {useContext, useEffect, useState} from "react";
import {getJson, sendRequest} from "../http_helper";
import {TableRow} from "../components/table_elements";
import {ControllerContext} from "../App";
import {ButtonSpinner, DropDown, SimpleToggle} from "../components/input_elements";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Legend, Brush
} from "recharts";


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


function HistogramChart(props) {
    const [histogramData, setHistogramData] = useState([0])
    const [updateGraph, setUpdateGraph] = useState(false);
    const [board, setBoard] = useState(0);
    const [channel, setChannel] = useState(0);

    useEffect(() => {
        const interval = setInterval(async () => {
            if (updateGraph) {
                let url = props.url + "/histogram/" + board.toString() + "-" + channel.toString() + "/pack-0-8192-1024";
                let [status, json_response] = await getJson(url);
                if (status === 404) {
                    console.log("cannot reach caen");
                } else if (status == 413) {
                    console.log("Requesting too large dataset, reduce width")
                } else {
                    let data = []
                    for (let item in json_response) {
                        data.push({x: item, y: json_response[item]});
                    }
                    setHistogramData(data)
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [updateGraph, board, channel, props.url]);

    return (
        <div>
            <h3>Histogram</h3>
            <div className="input-group input-sm mb-3">
                <label className="input-group-text">Board:</label>
                <DropDown selects={[1, 2, 3, 4, 5, 6, 7, 8]} setValue={setBoard}></DropDown>
                <label className="input-group-text">Channel:</label>
                <DropDown selects={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]}
                          setValue={setChannel}></DropDown>
                <label className="input-group-text">Update:</label>
                <SimpleToggle checked={updateGraph} setChecked={setUpdateGraph}>Update</SimpleToggle>
            </div>
            <ResponsiveContainer width='100%' height={300}>
                <LineChart data={histogramData}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="x" domain={[0, 2000]}/>
                    <YAxis domain={[0, 2000]}/>
                    <Tooltip/>
                    <Legend/>
                    <Line type="monotone" isAnimationActive={false} dataKey="y" stroke="#8884d8" dot={false}/>
                    <Brush/>
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

}

export function Caen(props) {
    return (
        <>
            <CaenControl url={props.url}/>
            <HistogramChart url={props.url}/>
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
