import {TableHeader, TableRow} from "../components/table_elements";
import React, {useContext} from "react";
import {useReadOnlyData} from "../components/generic_control";
import {HiveUrl, LogbookUrl} from "../App";


function epochToString(seconds_since_epoch) {
    // format: YYYY.MM.DD__HH:MM__SS
    let isoDate = new Date(seconds_since_epoch*1000).toISOString();
    isoDate = isoDate.slice(0, -5);
    isoDate = isoDate.split(':');

    let yearAndHour = isoDate[0].replace(/T/g, " ");
    let identifier = yearAndHour + ":" + isoDate[1] + ":" + isoDate[2];
    return identifier;
}



export function LogView() {

    const logbook_url = useContext(LogbookUrl);
    let state = useReadOnlyData( logbook_url + "/get_log_book", {});
    let table = []

    if (Array.isArray(state)) {
        for (let item of state) {
            console.log(item);
            table.push(<TableRow key={item.log_id} items={[epochToString(item.epoch), item.mode, item.note, item.meta, item.job_id, item.recipe_name, item.sample_id,
            epochToString(item.start_time), epochToString(item.end_time)]}/>)
        }
    }

    return (
        <>
            <table className="table table-striped table-hover table-sm">
                <TableHeader items={["Timestamp", "Mode", "Notes", "meta", "job id", "recipe name", "sample_id", "start", "end"]}/>
                <tbody>
                {table}
                </tbody>
            </table>
            </>);

}