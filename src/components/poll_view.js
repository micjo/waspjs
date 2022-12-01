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
                    <Typography>Current : {payload[0].value[0]} -> {payload[0].value[1]} nA</Typography>
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
    const [update, setUpdate] = useState(true)


    useEffect(() => {
        const interval = setInterval(async () => {
            if (update) {
                console.log("update")
                let start = getLocaleOneHourAgoIsoTime()
                let end = getLocaleIsoTime()
                let id = "rbs_current"
                let step = 1

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
                    let raw_data = []
                    for (let item in json_response["epoch"]) {
                        raw_data.push({
                            time: json_response["epoch"][item] * 1000,
                            value: json_response["rbs_current"][item]
                        });
                    }
                    let area_data = []
                    let bucket_size = 10
                    for (let index = 0; index < json_response["epoch"].length; index = index + bucket_size) {

                        if (index + bucket_size > json_response["epoch"]. length) {
                            bucket_size = json_response["epoch"].length - index
                        }
                        console.log(bucket_size)

                        let time_section = json_response["epoch"].slice(index, index + bucket_size)
                        let value_section = json_response["rbs_current"].slice(index, index + bucket_size)
                        let lhs_time = time_section[0] * 1000
                        let rhs_time = time_section[bucket_size - 1] * 1000


                        console.log("interval_size: " + (rhs_time - lhs_time).toString())
                        console.log("lhs: " + lhs_time + ", rhs: " + rhs_time)
                        let min = Math.min(...value_section)
                        let max = Math.max(...value_section)
                        area_data.push({time: lhs_time, value: [min, max]})
                        area_data.push({time: rhs_time, value: [min, max]})
                    }
                    setAreaData(area_data)
                }
            }

        }, 1000);
        return () => clearInterval(interval);
    }, [update, setAreaData, config.urls.mill, setError, select]);


    return (
        <div>
            <Button onClick={async() => setUpdate(false)}>Disable</Button>
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
                    }}
                >
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


                {/*<LineChart data={data}>*/}
                {/*    <CartesianGrid strokeDasharray="3 3"/>*/}
                {/*    <XAxis*/}
                {/*        dataKey='time'*/}
                {/*        domain={['auto', 'auto']}*/}
                {/*        name='Time'*/}
                {/*        tickFormatter={(unixTime) => moment(unixTime).format('HH:mm Do')}*/}
                {/*        type='number'*/}
                {/*    />*/}
                {/*    <YAxis dataKey='value' name='Value'/>*/}

                {/*    <Line*/}
                {/*        isAnimationActive={false}*/}
                {/*        dataKey={"value"}*/}
                {/*        type={'monotone'}*/}
                {/*        stroke="#82ca9d" strokeWidth={3} dot={false}*/}
                {/*    />*/}
                {/*    <Tooltip content={<CustomTooltip />} />*/}
                {/*</LineChart>*/}

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
