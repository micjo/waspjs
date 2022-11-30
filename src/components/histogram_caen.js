import React, {useContext, useEffect, useState} from "react";
import {getJson} from "../http_helper";
import {Brush, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {ToastPopup} from "./toast_popup";
import {MenuItem, Select} from "@mui/material";
import {BackEndConfig} from "../App";

export function HistogramCaen(props) {
    const config = useContext(BackEndConfig)

    const [histogramData, setHistogramData] = useState([0])
    const [updateGraph, setUpdateGraph] = useState(false);
    const [board, setBoard] = useState("10664");
    const [channel, setChannel] = useState(0);

    const [open, setOpen] = useState(false)
    const [text, setText] = useState("")

    const [binsMin, setBinsMin] = useState(0)
    const [binsMax, setBinsMax] = useState(8192)
    const [binsWidth, setBinsWidth] = useState(1024)

    const setError = props.setError
    const select = props.select

    useEffect(() => {
        const interval = setInterval(async () => {

                let histogram_url = config.urls.mill + "/api/rbs/caen/detector/" + select

                let status, json_response;
                try {
                    [status, json_response] = await getJson(histogram_url);
                } catch (e) {
                    setError("Error while getting histogram! Make sure that the daemon is running and the board and " +
                        "channel exist.");
                }
                if (status === 404) {
                    setError("cannot reach caen");
                } else if (status === 413) {
                    setError("Dataset requested is too large.")
                } else {
                    let data = []
                    for (let item in json_response) {
                        data.push({x: item, y: json_response[item]});
                    }
                    setHistogramData(data)
                }
        }, 1000);
        return () => clearInterval(interval);
    }, [setHistogramData, config.urls.mill, setError, select]);

    return (
        <div>
            <ToastPopup text={text} open={open} setOpen={setOpen} severity={"error"}/>
            <ResponsiveContainer height={300}>
                <LineChart data={histogramData} title={"Histogram"} margin={{top: 50, right: 30, left: 0, bottom: 0}}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="x" interval={49} angle={-45} textAnchor="end" height={50}/>
                    <YAxis/>
                    <Tooltip/>
                    <Line type="monotone" isAnimationActive={false} dataKey="y" stroke="#8884d8" dot={false}/>
                </LineChart>
            </ResponsiveContainer>
            <Select disabled={true} labelId="select-label" size={"small"} id={"demo"} name="select-input" fullWidth>
                <MenuItem>d01</MenuItem>
                <MenuItem>d02</MenuItem>
                <MenuItem>MD01</MenuItem>
            </Select>
        </div>
    );

}
