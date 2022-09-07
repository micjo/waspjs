import React, {useContext, useEffect, useState, Suspense} from "react";
import {LogbookUrl, NectarTitle} from "../App";
import {delay, getJson} from "../http_helper";
import {RoDataGrid} from "../components/data_grid";
import {epochToString} from "../components/time_helpers";


function useData() {
    const logbookUrl = useContext(LogbookUrl)
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true)
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
            setLoading(false)
        }
        fetch_data().then()
    }, [logbookUrl])
    return [data, loading]
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
    const [data, loading] = useData()

    const nectarTitle = useContext(NectarTitle);
    useEffect( () => nectarTitle.setTitle("Trends"))

    return (
        <RoDataGrid
            rows={data}
            columns={header}
            loading={loading}
        />
    );
}
