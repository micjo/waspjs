import React, {useContext, useEffect, useState, Suspense} from "react";
import {LogbookUrl, NectarTitle} from "../App";
import {getJson} from "../http_helper";
import {MaterialTableTemplate} from "../components/table_templates";

function epochToString(seconds_since_epoch) {
    // format: YYYY.MM.DD__HH:MM__SS
    if (seconds_since_epoch === "" || seconds_since_epoch === null) {
        return ""
    }

    let isoDate = new Date(seconds_since_epoch * 1000).toLocaleString().replaceAll(',', '');
    return isoDate;
}


export function Trends() {
    const logbookUrl = useContext(LogbookUrl)

    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);

    const nectarTitle = useContext(NectarTitle);
    useEffect( () => nectarTitle.setTitle("Trends"))

    useEffect(() => {
            async function fetch_params() {
                let [, accelerator_keys] = await getJson(logbookUrl + "/check_trending")
                let header = []
                for (let key of accelerator_keys) {
                    if (key ==="id") {continue}
                    if (key === "epoch") {key = "timestamp"}
                    header.push({field: key, title: key, cellStyle: {whiteSpace: 'nowrap'} })
                }
                setColumns(header)
            }

            fetch_params().then()
        }, [logbookUrl]
    )

    useEffect(() => {
            async function fetch_content() {
                let url = `${logbookUrl}/get_trends_last_month`;
                let [, trends] = await getJson(url)
                console.log(trends)
                let params = []
                for (let line of trends) {
                    line['timestamp'] = epochToString(line['epoch'])
                    params.push(line)
                }
                setData(params)
            }

            fetch_content().then()
        }, [logbookUrl]
    )

    return (
        <div>
            <h1> Trends </h1>
            <div>
            </div>

            <MaterialTableTemplate title="Trends Last Month" columns={columns} data={data}/>
        </div>
    );
}
