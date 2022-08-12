import {TableHeader, TableRow} from "../components/table_elements";
import React, {useContext, useEffect, useState} from "react";
import {FailureModal, useModal, useReadOnlyDataOnce} from "../components/generic_control";
import {LogbookUrl} from "../App";
import {ProgressButton, ClickableSpanWithSpinner} from "../components/input_elements";
import {getJson, postData} from "../http_helper";
import {BsXSquare} from "react-icons/bs";


function epochToString(seconds_since_epoch) {
    // format: YYYY.MM.DD__HH:MM__SS
    if (seconds_since_epoch === "" || seconds_since_epoch === null) {
        return ""
    }

    let isoDate = new Date(seconds_since_epoch * 1000).toLocaleString().replaceAll(',', '');
    return isoDate;
}

function LogNote() {
    const logbook_url = useContext(LogbookUrl);
    const [note, setNote] = useState("");
    const [mode, setMode] = useState("note");
    const [time, setTime] = useState("now (datetime format)")
    const [modalMessage, show, setShow, cb] = useModal()

    return (
        <>
            <FailureModal show={show} setShow={setShow} message={modalMessage}/>
            <label className="input-group-text" htmlFor="inputGroupFile01">Mode:</label>
            <input type="text" aria-label="mode" className="form-control" value={mode}
                   onInput={e => setMode(e.target.value)}/>
            <label className="input-group-text" htmlFor="inputGroupFile01">Note: </label>
            <input type="text" aria-label="note" className="form-control" value={note}
                   onInput={e => setNote(e.target.value)}/>
            <label className="input-group-text" htmlFor="inputGroupFile01">Timestamp:</label>
            <input type="text" aria-label="timestamp" className="form-control" value={time}
                   onInput={e => setTime(e.target.value)}/>

            <ProgressButton text="Submit" callback={async () => {
                if (time.startsWith("now")) {
                    await postData(logbook_url + "/log_message?message=" + note + "&mode=" + mode, "");
                }
                else {
                    let response = await postData(logbook_url + "/log_message?message=" + note + "&mode=" + mode + "&timestamp=" + time, "");
                    if (response.status !== 200) {
                        cb("Invalid time format. Example: <2022-01-01 12:00:00>");
                    }

                }
            }}/>
        </>);
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

    let table = []

    let json_response = {}

    useEffect(() => {
        async function fill_table() {
            if (Array.isArray(json_response)) {
                for (let item of json_response) {
                    console.log(item)
                    let items = [epochToString(item.epoch), item.mode, item.note, item.meta, item.job_name, item.recipe_name, item.sample, item.move,
                        epochToString(item.start_epoch), epochToString(item.end_epoch)];

                    if (item.mode === "rbs" || item.mode === "erd") {
                        items.push(null);
                    } else {
                        items.push(<ClickableSpanWithSpinner callback={async () => {
                            await postData(logbook_url + "/remove_message?log_id=" + item.log_id, "");
                        }}>
                            <BsXSquare/>
                        </ClickableSpanWithSpinner>);
                    }

                    table.push(<TableRow key={item.log_id} items={items}/>)
                }
            }
        }
        fill_table().then()
        }, [state]
    );

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
            <div className="input-group mb-3">
                <LogNote/>
            </div>

            <div className="input-group mb-3">
                <label className="input-group-text" htmlFor="inputGroupFile01">Mode Filter:</label>
                <input type="text" aria-label="mode" className="form-control" value={filter}
                       onInput={e => setFilter(e.target.value)}/>
                <label className="input-group-text" htmlFor="inputGroupFile01">Start:</label>
                <input type="text" aria-label="mode" className="form-control" value={start}
                       onInput={e => setStart(e.target.value)}/>
                <label className="input-group-text" htmlFor="inputGroupFile01">End: </label>
                <input type="text" aria-label="note" className="form-control" value={end}
                       onInput={e => setEnd(e.target.value)}/>
                <ProgressButton text="Refresh" callback={async () => {
                    let url = logbook_url + "/get_filtered_log_book?mode=" + filter +"&start=" + start+ "&end=" + end;
                    let [, json_response] = await getJson(url);
                    setState(json_response);
                }}/>
            </div>
                <table className="table table-striped table-hover table-sm">

                <TableHeader
                    items={["Timestamp", "Mode", "Notes", "meta", "job id", "recipe name", "sample_id", "move", "start", "end", "delete"]}/>
                <tbody>
                {table}
                </tbody>
            </table>
        </>);

}
