import React, {useContext, useEffect, useState} from "react";
import {HiveConfig, HiveUrl} from "../App";
import {usePollData} from "../components/generic_control";
import {StripedTable} from "../components/table_templates";
import {getJson} from "../http_helper";

export function RbsDetectorOverview() {
    const hiveConfig = useContext(HiveConfig);
    let detectors = hiveConfig?.rbs?.hardware?.caen?.detectors;
    let table = [];

    const hiveUrl = useContext(HiveUrl)

    const [data, ,] = usePollData(hiveUrl + hiveConfig?.rbs?.hardware?.caen?.proxy);
    const [rows, setRows] = useState([])
    const columns = [
        {field: 'identifier', headerName: "Identifier", flex: true},
        {field: 'board', headerName: "Board", flex: true},
        {field: 'channel', headerName: "Channel", flex: true},
        {field: 'binning', headerName: "Binning", flex: true},
        {field: 'trapezoid_rise_time', headerName: "Trapezoid Rise Time (ns)", flex: true},
        {field: 'trapezoid_flat_top', headerName: "Trapezoid Flat Top (ns)", flex: true},
    ]

    useEffect(() => {
        async function fillRows() {
            let newRows = []
            let caen_data = await getJson(hiveUrl + hiveConfig?.rbs?.hardware?.caen?.proxy)
            let detectors = hiveConfig?.rbs?.hardware?.caen?.detectors
            let boards = {}
            if (data.boards) {
                for (let board of data?.boards) {
                    boards[board.id] = board
                }
            }
            for (let detector of detectors) {
                let active_channel = boards[detector.board]?.channels[detector.channel]
                newRows.push({
                        "id": detector.identifier,
                        "identifier": detector.identifier,
                        "board": detector.board,
                        "channel": detector.channel,
                        "binning": `(${detector.bins_min}:${detector.bins_max} -> ${detector.bins_width})`,
                        "trapezoid_rise_time":
                        active_channel?.trapezoid_rise_time,
                        "trapezoid_flat_top": active_channel?.trapezoid_flat_top
                    }
                )
            }
            setRows(newRows)
        }
        fillRows()
    }, [])

    return (
        <div>
            <h1> RBS Detectors </h1>
            <StripedTable
                rows={rows}
                columns={columns}
                height={300}/>
        </div>
    );
}
