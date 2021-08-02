import React, {useEffect, useState} from "react";
import {ModalView, useModal} from "./generic_control";
import {getJson} from "../http_helper";
import {DropDown, SimpleToggle} from "./input_elements";
import {Brush, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";

export function HistogramCaen(props) {
    const [histogramData, setHistogramData] = useState([0])
    const [updateGraph, setUpdateGraph] = useState(false);
    const [board, setBoard] = useState(0);
    const [channel, setChannel] = useState(0);
    const {modalMessage, show, setShow, cb} = useModal()

    const [binsMin, setBinsMin] = useState(0)
    const [binsMax, setBinsMax] = useState(8192)
    const [binsWidth, setBinsWidth] = useState(1024)

    useEffect(() => {
        const interval = setInterval(async () => {
            if (updateGraph) {


                let urlEnd = "pack-" + binsMin + "-" + binsMax + "-" + binsWidth;
                console.log(urlEnd);
                let url = props.url + "/histogram/" + board.toString() + "-" + channel.toString() + "/" +  urlEnd;
                let status, json_response;
                try {
                    console.log("getting json from " + url);
                    [status, json_response] = await getJson(url);
                } catch (e) {
                    cb("Error while getting histogram! Make sure that the daemon is running and the board and " +
                        "channel exist.");
                    setUpdateGraph(false);
                }
                if (status === 404) {
                    cb("cannot reach caen");
                    setUpdateGraph(false);
                } else if (status == 413) {
                    cb("Dataset requested is too large.")
                    setUpdateGraph(false);
                }
                else {
                    let data = []
                    for (let item in json_response) {
                        data.push({x: item, y: json_response[item]});
                    }
                    setHistogramData(data)
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [updateGraph, board, channel, props.url, binsMin, binsWidth, binsMax]);

    return (
        <div>
            <ModalView show={show} setShow={setShow} message={modalMessage}/>
            <h3>Histogram</h3>
            <div className="input-group input-sm mb-3">
                <label className="input-group-text">Board:</label>
                <DropDown selects={[1, 2, 3, 4, 5, 6, 7, 8]} setValue={setBoard}/>
                <label className="input-group-text">Channel:</label>
                <DropDown selects={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]}
                          setValue={setChannel}/>
                <label className="input-group-text">Update:</label>
                <SimpleToggle checked={updateGraph} setChecked={setUpdateGraph}>Update</SimpleToggle>
            </div>
            <div className="input-group input-sm mb-3">
                <label className="input-group-text">Bins min:</label>
                <input type="number" className="form-control" placeholder="New Value"
                       value={binsMin}
                       onInput={e => setBinsMin(e.target.value)} disabled={updateGraph}/>
                <label className="input-group-text">Bins max:</label>
                <input type="number" className="form-control" placeholder="New Value"
                       value={binsMax} disabled={updateGraph}
                       onInput={e => setBinsMax(e.target.value)}/>
                <label className="input-group-text">Bins width:</label>
                <input type="number" className="form-control" placeholder="New Value"
                       value={binsWidth} disabled={updateGraph}
                       onInput={e => setBinsWidth(e.target.value)}/>
            </div>
            <ResponsiveContainer width='100%' height={300}>
                <LineChart data={histogramData}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="x" interval={49}/>
                    <YAxis/>
                    <Tooltip/>
                    <Legend/>
                    <Line type="monotone" isAnimationActive={false} dataKey="y" stroke="#8884d8" dot={false}/>
                    <Brush/>
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

}