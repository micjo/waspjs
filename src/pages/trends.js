import React, {useContext, useEffect, useState, Suspense} from "react";
import {LogbookUrl, NectarTitle} from "../App";
import {getJson} from "../http_helper";
import {DataGrid, GridToolbar} from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import {CircularProgress, Stack} from "@mui/material";

function epochToString(seconds_since_epoch) {
    // format: YYYY.MM.DD__HH:MM__SS
    if (seconds_since_epoch === "" || seconds_since_epoch === null) {
        return ""
    }

    let isoDate = new Date(seconds_since_epoch * 1000).toLocaleString().replaceAll(',', '');
    return isoDate;
}

function useData() {
    const logbookUrl = useContext(LogbookUrl)
    const [data, setData] = useState([]);
    useEffect( () => {
        async function fetch_data() {
            let url = `${logbookUrl}/get_trends_last_day`;
            let [, trends] = await getJson(url)
            let params = []
            let index = 0;
            for (let line of trends) {
                line['timestamp'] = epochToString(line['epoch'])
                line['id'] = index
                params.push(line)
                index++
            }
            setData(params)
        }
        fetch_data().then()
    }, [logbookUrl])
    return data
}

function useHeader() {
    const logbookUrl = useContext(LogbookUrl)
    const [header, setHeader] = useState([]);
    useEffect(() => {
        async function fetch_params() {
            let [, accelerator_keys] = await getJson(logbookUrl + "/check_trending")
            let header = []
            for (let key of accelerator_keys) {
                if (key ==="id") {continue}
                if (key === "epoch") {
                    header.push({field: "timestamp", headerName: "timestamp", type: "dateTime", flex:0.4})
                }
                else {
                    header.push({field: key, headerName: key, flex:0.2})
                }
            }
            setHeader(header)
        }
        fetch_params().then()
    }, [logbookUrl])

    return header
}


export function Trends() {
    const header = useHeader()
    const data = useData()

    const nectarTitle = useContext(NectarTitle);
    useEffect( () => nectarTitle.setTitle("Trends"))

    return (
        <Box sx={{height: 800}}>
        <DataGrid
            rows={data}
            columns={header}
            components={{
                Toolbar: GridToolbar,
                NoRowsOverlay: () => (
                    <Stack height="100%" alignItems="center" justifyContent="center">
                        <CircularProgress />
                    </Stack>
                )
            }}

        />
        </Box>
    );
}
