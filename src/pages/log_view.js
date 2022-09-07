import React, {useContext, useEffect, useState} from "react";
import {LogbookUrl, NectarTitle} from "../App";
import {deleteData, getJson, postData} from "../http_helper";
import {ToastPopup} from "../components/toast_popup";
import CrudGrid from "../components/data_grid";


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


function useGetData() {
    const logbookUrl = useContext(LogbookUrl)
    return async () => {
        let end_time = getLocaleIsoTime()
        let start_time = getLocaleOneMonthAgoIsoTime()
        let url = logbookUrl + "/get_filtered_log_book?mode=" + "&start=" + start_time + "&end=" + end_time;
        let [, data] = await getJson(url);
        let newRows = []
        if (Array.isArray(data)) {
            for (let item of data) {
                newRows.push({'id': item.log_id, 'timestamp': epochToString(item.epoch), 'mode': item.mode,
                    'note': item.note, 'job': item.job_name, 'recipe': item.recipe_name, 'sample': item.sample,
                    'move': item.move, 'start': epochToString(item.start_epoch),
                    'end': epochToString(item.end_epoch)})
            }
        }
        return newRows
    }
}


export function LogView() {
    const logbook_url = useContext(LogbookUrl);
    const nectarTitle = useContext(NectarTitle);
    useEffect( () => nectarTitle.setTitle("Logbook"))
    const [message, setMessage] = useState("")

    const header = [
        { field:'timestamp', headerName:'Timestamp', type:"dateTime", editable:true, flex:0.2},
        { field: 'mode', headerName: 'Mode', editable:true},
        { field: 'note', headerName: 'Note', editable:true, flex: 0.5},
        { field: 'job', headerName: 'Job', editable:false},
        { field: 'recipe', headerName: 'Recipe', editable:false, flex:0.2},
        { field: 'sample', headerName: 'Sample', editable:false, flex:0.2},
        { field: 'move', headerName: 'Move', editable:false, flex:0.3},
        { field: 'start', headerName: 'Start', editable:false, flex:0.2},
        { field: 'end', headerName: 'End', editable:false, flex: 0.2},
    ]

    const [dialogOpen,setDialogOpen] = useState(false)
    let getData = useGetData()

    return (
        <>
            <CrudGrid getData = {getData} columns={header}
                rowAdd={async (newRow) => {
                    let response
                    if (newRow.timestamp) {
                        response = await postData(logbook_url + "/message?message=" + newRow.note +
                            "&mode=" + newRow.mode + "&timestamp=" + newRow.timestamp, "");
                    }
                    else {
                        response = await postData(`${logbook_url}/message?message=${newRow.note}&mode=${newRow.mode}`, "");
                    }
                    if (response.status !== 200) {
                        setMessage("Invalid time format. Example: <2022-01-01 12:00:00>");
                        let text = await response.text()
                        setMessage(text)
                        setDialogOpen(true)
                    }
                }}
              rowDelete={ async(id) => {
                  await deleteData(`${logbook_url}/message?log_id=${id}`)
              }}
             initialEdit="mode"
            />
            <ToastPopup open={dialogOpen} setOpen={setDialogOpen} message={message} />
        </>);

}
