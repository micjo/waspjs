import {TableHeader, TableRow} from "../components/table_elements";
import React, {useContext, useState} from "react";
import {FailureModal, useModal, useReadOnlyData} from "../components/generic_control";
import {HiveUrl, LogbookUrl} from "../App";
import {ButtonSpinner, ClickableSpanWithSpinner, SmallButtonSpinner} from "../components/input_elements";
import {postData} from "../http_helper";
import {BsXSquare} from "react-icons/bs";


function epochToString(seconds_since_epoch) {
    // format: YYYY.MM.DD__HH:MM__SS
    if (seconds_since_epoch === "") {
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

            <ButtonSpinner text="Submit" callback={async () => {
                if (time.startsWith("now")) {
                    await postData(logbook_url + "/log_message?message=" + note + "&mode=" + mode, "");
                }
                else {
                    let response = await postData(logbook_url + "/log_message?message=" + note + "&mode=" + mode + "&timestamp=" + time, "");
                    console.log(response);
                    if (response.status !== 200) {
                        cb("Invalid time format. Example: <2022-01-01 12:00:00>");
                    }

                }
            }}/>
        </>);
}


export function LogView() {

    const logbook_url = useContext(LogbookUrl);
    let state = useReadOnlyData(logbook_url + "/get_log_book", {});
    let table = []


    if (Array.isArray(state)) {
        state = state.slice(-50);
        for (let item of state) {
            let items = [epochToString(item.epoch), item.mode, item.note, item.meta, item.job_id, item.recipe_name, item.sample_id,
                epochToString(item.start_time), epochToString(item.end_time)];

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

    return (
        <>
            <div className="input-group mb-3">
                <LogNote/>

            </div>
            <table className="table table-striped table-hover table-sm">
                <TableHeader
                    items={["Timestamp", "Mode", "Notes", "meta", "job id", "recipe name", "sample_id", "start", "end", "delete"]}/>
                <tbody>
                {table}
                </tbody>
            </table>
        </>);

}