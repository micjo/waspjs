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

    const [detectorKey, setDetectorKey] = useState("")
    const [availableDetectors, setAvailableDetectors] = useState([])

    const setError = props.setError
    const select = props.select

    let config_url = config.urls.mill
    let initialDetector = props.initialDetector


    useEffect(() => {
        async function populateDetectors() {
            let status, json_response
            try {
                [status, json_response] = await getJson(config_url + "/api/config");
            } catch (e) {
                setError("Error while getting histogram! Make sure that the daemon is running and the board and " +
                    "channel exist.");
            }
            if (status === 404) {
                setError("cannot reach caen");
            }
            let detectors = []
            for (let detector of json_response?.rbs?.drivers?.caen?.detectors) {
                let id = detector.identifier
                detectors.push(<MenuItem value={id} key={id}><em>{id}</em></MenuItem>)
            }
            setAvailableDetectors(detectors)
            setDetectorKey(initialDetector)
        }

        populateDetectors().then()


    }, [config_url, setError, setAvailableDetectors, initialDetector, setDetectorKey])

    useEffect(() => {
        const interval = setInterval(async () => {
            if (detectorKey ==="") {return}

            let histogram_url = config.urls.mill + "/api/rbs/caen/detector/" + detectorKey

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
    }, [setHistogramData, detectorKey, config.urls.mill, setError, select]);

    return (
        <div>
            <ToastPopup text={text} open={open} setOpen={setOpen} severity={"error"}/>
            <Select fullWidth size="small" name="select-input" value={detectorKey}
                    onChange={(e) => setDetectorKey((e.target.value))}>
                <MenuItem value=""><em>None</em></MenuItem>
                {availableDetectors}
            </Select>


            <ResponsiveContainer height={300}>
                <LineChart data={histogramData} title={"Histogram"} margin={{top: 50, right: 30, left: 0, bottom: 0}}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="x" interval={49} angle={-45} textAnchor="end" height={50}/>
                    <YAxis/>
                    <Tooltip/>
                    <Line type="monotone" isAnimationActive={false} dataKey="y" stroke="#8884d8" dot={false}/>
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

}
