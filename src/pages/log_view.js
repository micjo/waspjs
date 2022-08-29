import React, {useContext, useEffect, useState} from "react";
import {LogbookUrl} from "../App";
import {deleteData, getJson, postData} from "../http_helper";
import {MaterialTableTemplate} from "../components/table_templates";
import {ToastPopup} from "../components/toast_popup";


function epochToString(seconds_since_epoch) {
    // format: YYYY.MM.DD__HH:MM__SS
    if (seconds_since_epoch === "" || seconds_since_epoch === null) {
        return ""
    }

    let isoDate = new Date(seconds_since_epoch * 1000).toLocaleString().replaceAll(',', '');
    return isoDate;
}

function getLocaleIsoTime() {
    let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    return (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
}

function getLocaleOneMonthAgoIsoTime() {
    let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    let now = new Date(Date.now() - tzoffset);
    now.setMonth(now.getMonth() - 1)
    return now.toISOString().slice(0,-1);
}

export function LogView() {
    const logbook_url = useContext(LogbookUrl);
    let end_time = getLocaleIsoTime()
    let start_time = getLocaleOneMonthAgoIsoTime()

    const [start, setStart] = useState(start_time);
    const [end, setEnd] = useState(end_time);
    const [filter, setFilter] = useState("");

    const [state, setState] = useState({});


    const [message, setMessage] = useState("")

    const header = [
        { field:'timestamp', title:'Timestamp', initialEditValue:"(now)",cellStyle: {whiteSpace: 'nowrap'} },
        { field: 'mode', title: 'Mode', initialEditValue:"note"},
        { field: 'note', title: 'Note'},
        { field: 'job', title: 'Job', editable:"never"},
        { field: 'recipe', title: 'Recipe', editable:"never"},
        { field: 'sample', title: 'Sample', editable:"never"},
        { field: 'move', title: 'Move', editable:"never"},
        { field: 'start', title: 'Start', editable:"never"},
        { field: 'end', title: 'End', editable:"never"},
    ]

    const [rows, setRows] = useState([])
    const [dialogOpen,setDialogOpen] = useState(false)

    useEffect ( () => {
        async function fillRows() {
            let newRows = []
            if (Array.isArray(state)) {
                for (let item of state) {
                    newRows.push({'id': item.log_id, 'timestamp': epochToString(item.epoch), 'mode': item.mode,
                        'note': item.note, 'job': item.job_name, 'recipe': item.recipe_name, 'sample': item.sample,
                        'move': item.move, 'start': epochToString(item.start_epoch),
                        'end': epochToString(item.end_epoch)})
                }
                setRows(newRows)
            }
        }
        fillRows()
    }, [state] );

    useEffect( () => {
        async function fetch_content() {
            let url = logbook_url + "/get_filtered_log_book?mode=" + filter + "&start=" + start + "&end=" + end;
            let [, json_response] = await getJson(url);
            setState(json_response);
        }
        fetch_content().then()
    }, []);

    return (
        <>
            <MaterialTableTemplate
                title="Logbook" columns={header} data={rows}
                onRowAdd={ async(newData) => {
                    let response
                    if (newData.timestamp === "(now)") {
                        response = await postData(`${logbook_url}/message?message=${newData.note}&mode=${newData.mode}`, "");
                    }
                    else {
                        response = await postData(logbook_url + "/message?message=" + newData.note +
                            "&mode=" + newData.mode + "&timestamp=" + newData.timestamp, "");
                    }

                    if (response.status !== 200) {
                        setMessage("Invalid time format. Example: <2022-01-01 12:00:00>");
                        let text = await response.text()
                        setMessage(text)
                        setDialogOpen(true)
                        return
                    }
                    let [, json_response] = await getJson(`${logbook_url}/get_log_book`);
                    setState(json_response)
                }}
                onRowDelete={ async(oldData) => {
                    await deleteData(`${logbook_url}/message?log_id=${oldData.id}`)
                    let [, json_response] = await getJson(`${logbook_url}/get_log_book`);
                    setState(json_response)
                }}/>
            <ToastPopup open={dialogOpen} setOpen={setDialogOpen} message={message} />
        </>);

}
