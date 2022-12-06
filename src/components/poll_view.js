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
import {FormControl, InputLabel, MenuItem, Paper, Select, Stack, ToggleButton} from "@mui/material";
import {BackEndConfig} from "../App";
import moment from "moment";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {getLocaleOneHourAgoIsoTime, getLocaleIsoTime} from "./time_helpers";
import Button from "@mui/material/Button";
import {ToggleButtonGroup} from "@mui/lab";


const CustomTooltip = ({active, payload, label}) => {
    let timestamp = moment(label).format('YYYY.MM.DD HH:mm:ss')
    if (active && payload && payload.length) {
        return (
            <Box sx={{padding: "8px 8px 8px 8px", backgroundColor: "white"}}>
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
    let initialKey = props.valueKey
    const [pollingKey, setPollingKey] = useState("")
    const [availableKeys, setAvailableKeys] = useState([])

    const [trendInterval, setTrendInterval] = React.useState('20min');

    const handleTrendInterval = (event, trendInterval) => {
        setTrendInterval(trendInterval);
    };

    let db_url = config.urls.db
    let keyStart = props.keyStart

    useEffect(() => {
        async function updateAvailableKeys() {
            let keys
            try {
                [, keys] = await getJson(db_url + "/check_trending")
            } catch (e) {
                setError("Error while getting trends! Make sure that the daemon is running.");
            }

            let avKeys = []
            for (let key of keys) {
                if (key.startsWith(keyStart) || key.startsWith("any")) {
                    avKeys.push(<MenuItem value={key} key={key}><em>{key}</em></MenuItem>)
                }
            }
            setAvailableKeys(avKeys)
            setPollingKey(initialKey)
        }

        updateAvailableKeys().then()
    }, [setError, setAvailableKeys, db_url, initialKey, keyStart])


    useEffect(() => {
        const interval = setInterval(async () => {
            if (pollingKey === "") {return}

            let trends_url = db_url + "/get_trend_last"

            if (trendInterval === "20min") {
                trends_url = trends_url + "_20_min"
            } else if (trendInterval === "5h") {
                trends_url = trends_url + "_5_hours"
            } else if (trendInterval === "1day") {
                trends_url = trends_url + "_day"
            } else if (trendInterval === "3days") {
                trends_url = trends_url + "_3_days"
            }

            trends_url = trends_url + "?key=" + pollingKey

            let status, json_response;
            try {
                [status, json_response] = await getJson(trends_url);
            } catch (e) {
                setError("Error while getting trends! Make sure that the daemon is running.");
                return
            }
            if (status === 404) {
                setError("cannot reach db");
            } else if (status === 413) {
                setError("Dataset requested is too large.")
            } else {
                let area_data = []
                for (let entry of json_response) {
                    let lhs_time = entry["min_epoch"] * 1000
                    let rhs_time = entry["max_epoch"] * 1000
                    let min = entry["min_" + pollingKey]
                    let max = entry["max_" + pollingKey]
                    area_data.push({time: lhs_time, value: [min, max]})
                    area_data.push({time: rhs_time, value: [min, max]})
                }
                setAreaData(area_data)
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [setAreaData, pollingKey, trendInterval, db_url, setError]);


    return (
        <div>
            <ToastPopup text={text} open={open} setOpen={setOpen} severity={"error"}/>
            <Stack direction={"row"}>
                <Select fullWidth size="small" name="select-input" value={pollingKey}
                        onChange={(e) => setPollingKey((e.target.value))}>
                    <MenuItem value=""><em>None</em></MenuItem>
                    {availableKeys}
                </Select>
                <ToggleButtonGroup
                    value={trendInterval}
                    exclusive
                    size="small"
                    sx={{marginLeft: "4px"}}
                    onChange={handleTrendInterval}
                    aria-label="text alignment"
                >
                    <ToggleButton value="20min" aria-label="left aligned">
                        20min
                    </ToggleButton>
                    <ToggleButton value="5h" aria-label="centered">
                        5h
                    </ToggleButton>
                    <ToggleButton value="1day" aria-label="right aligned">
                        1day
                    </ToggleButton>
                    <ToggleButton value="3days" aria-label="right aligned">
                        3days
                    </ToggleButton>


                </ToggleButtonGroup>
            </Stack>
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
                    <YAxis/>
                    <Area dataKey="value" stroke="#8884d8" fill="#8884d8" isAnimationActive={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );

}
