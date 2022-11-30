import React, {useContext, useEffect, useState} from "react";
import {getJson} from "../http_helper";
import {
    Brush,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    ScatterChart,
    Scatter,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import {ToastPopup} from "./toast_popup";
import {MenuItem, Paper, Select} from "@mui/material";
import {BackEndConfig} from "../App";
import moment from "moment";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {getLocaleFiveHoursAgoIsoTime, getLocaleIsoTime} from "./time_helpers";


const CustomTooltip = ({ active, payload, label }) => {
    let timestamp = moment(label).format('YYYY.MM.DD HH:mm:ss')
    if (active && payload && payload.length) {
        return (
                <Box sx={{padding: "8px 8px 8px 8px"}}>
                    <Typography>Current : {payload[0].value} nA</Typography>
                    <Typography sx={{color: "#00adb5"}}>Time: {timestamp}</Typography>
                </Box>
        );
    }

    return null;
};

function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export function PollView(props) {
    const config = useContext(BackEndConfig)
    const [data, setData] = useState([0])
    const [open, setOpen] = useState(false)
    const [text, setText] = useState("")
    const setError = props.setError
    const select = props.select

    let start = getLocaleFiveHoursAgoIsoTime()
    let end = getLocaleIsoTime()
    let id = "rbs_current"
    let step = 1

    useEffect(() => {
        const interval = setInterval(async () => {
            let trends_url = config.urls.db + "/get_trend?start=" + start + "&end=" + end + "&id=" + id + "&step=" + step
            let status, json_response;
            try {
                [status, json_response] = await getJson(trends_url);
            } catch (e) {
                setError("Error while getting trends! Make sure that the daemon is running.");
            }
            if (status === 404) {
                setError("cannot reach db");
            } else if (status === 413) {
                setError("Dataset requested is too large.")
            } else {
                let data = []
                for (let item in json_response["epoch"]) {
                    data.push({time: json_response["epoch"][item]*1000, value: json_response["rbs_current"][item]});
                }
                setData(data)
            }

        }, 1000);
        return () => clearInterval(interval);
    }, [setData, config.urls.mill, setError, select]);

    return (
        <div>
            <ToastPopup text={text} open={open} setOpen={setOpen} severity={"error"}/>
            <ResponsiveContainer width='95%' height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis
                        dataKey='time'
                        domain={['auto', 'auto']}
                        name='Time'
                        tickFormatter={(unixTime) => moment(unixTime).format('HH:mm Do')}
                        type='number'
                    />
                    <YAxis dataKey='value' name='Value'/>

                    <Line
                        dataKey={"value"}
                        type={'natural'}
                        stroke="#82ca9d" strokeWidth={3} dot={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                </LineChart>

                {/*<LineChart data={data} title={"RBS Current"} margin={{top: 50, right: 30, left: 0, bottom: 0}}>*/}
                {/*    <CartesianGrid strokeDasharray="3 3"/>*/}
                {/*    <XAxis dataKey="time" domain = {['auto', 'auto']} name = 'Time'*/}
                {/*           tickFormatter = {(unixTime) => moment(unixTime).format('YYYY.MM.DD HH:mm Do')}*/}
                {/*           type = 'number'/>*/}
                {/*    <YAxis/>*/}
                {/*    <Line type="monotone" isAnimationActive={false} dataKey="y" stroke="#8884d8" dot={false}/>*/}
                {/*</LineChart>*/}
            </ResponsiveContainer>
            <Select disabled={true} labelId="select-label" size={"small"} id={"demo"} name="select-input" fullWidth>
                <MenuItem>d01</MenuItem>
                <MenuItem>d02</MenuItem>
                <MenuItem>MD01</MenuItem>
            </Select>
        </div>
    );

}
