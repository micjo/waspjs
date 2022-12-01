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
    AreaChart,
    BarChart,
    Area,
    Bar,
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
import {getLocaleOneHourAgoIsoTime, getLocaleIsoTime} from "./time_helpers";
import Button from "@mui/material/Button";


const CustomTooltip = ({ active, payload, label }) => {
    let timestamp = moment(label).format('YYYY.MM.DD HH:mm:ss')
    if (active && payload && payload.length) {
        return (
                <Box sx={{padding: "8px 8px 8px 8px", backgroundColor:"white"}}>
                    <Typography>{payload[0].value[0]} -> {payload[0].value[1]}</Typography>
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
    const [areaData, setAreaData] = useState([0])
    const [open, setOpen] = useState(false)
    const [text, setText] = useState("")
    const setError = props.setError
    const select = props.select

    useEffect(() => {
        const interval = setInterval(async () => {
                console.log("update")
                let start = getLocaleOneHourAgoIsoTime()
                let end = getLocaleIsoTime()
                let step = 1

                let trends_url = config.urls.db + "/get_trend?start=" + start + "&end=" + end + "&id=" + props.valueKey + "&step=" + step
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
                    let area_data = []
                    let bucket_size = 10
                    for (let index = 0; index < json_response["epoch"].length; index = index + bucket_size) {
                        if (index + bucket_size > json_response["epoch"]. length) {
                            bucket_size = json_response["epoch"].length - index
                        }
                        let time_section = json_response["epoch"].slice(index, index + bucket_size)
                        let value_section = json_response[props.valueKey].slice(index, index + bucket_size)
                        let lhs_time = time_section[0] * 1000
                        let rhs_time = time_section[bucket_size - 1] * 1000
                        let min = Math.min(...value_section)
                        let max = Math.max(...value_section)
                        area_data.push({time: lhs_time, value: [min, max]})
                        area_data.push({time: rhs_time, value: [min, max]})
                    }
                    setAreaData(area_data)
                }
        }, 1000);
        return () => clearInterval(interval);
    }, [setAreaData, config.urls.mill, setError, select]);


    return (
        <div>
            <ToastPopup text={text} open={open} setOpen={setOpen} severity={"error"}/>
            <ResponsiveContainer width='95%' height={300}>

                <AreaChart
                    width={730}
                    height={250}
                    data={areaData}
                    barGap={0}
                    barCategoryGap={0}
                    margin={{
                        top: 20, right: 20, bottom: 20, left: 20,
                    }}>
                    <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis
                            dataKey='time'
                            domain={['auto', 'auto']}
                            name='Time'
                            tickFormatter={(unixTime) => moment(unixTime).format('HH:mm Do')}
                            type='number'
                        />
                    <YAxis />
                    <Area dataKey="value" stroke="#8884d8" fill="#8884d8" isAnimationActive={false}/>
                        <Tooltip content={<CustomTooltip />} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );

}
