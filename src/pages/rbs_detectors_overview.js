import React, {useContext, useEffect, useState} from "react";
import {HiveConfig, HiveUrl, NectarTitle} from "../App";
import {usePollData} from "../components/generic_control";
import {StripedTable} from "../components/table_templates";
import {getJson} from "../http_helper";

export function RbsDetectorOverview() {
    const hiveConfig = useContext(HiveConfig);
    const hiveUrl = useContext(HiveUrl)
    const nectarTitle = useContext(NectarTitle);
    useEffect( () => nectarTitle.setTitle("RBS Detectors"))

    const [rows, setRows] = useState([])
    const columns = [
        {field: 'identifier', headerName: "Identifier", flex: true},
        {field: 'board', headerName: "Board", flex: true},
        {field: 'channel', headerName: "Channel", flex: true},
        {field: 'binning', headerName: "Binning", flex: true},
        {field: 'trapezoid_rise_time', headerName: "Trapezoid Rise Time (ns)", flex: true},
        {field: 'trapezoid_flat_top', headerName: "Trapezoid Flat Top (ns)", flex: true},
    ]
    const [caen_data, , ,] = usePollData(hiveUrl + hiveConfig?.rbs?.hardware?.caen?.proxy)

    useEffect(() => {
        async function fillRows() {
            let newRows = []
            let detectors = hiveConfig?.rbs?.hardware?.caen?.detectors
            let boards = {}
            if (caen_data.boards) {
                for (let board of caen_data?.boards) {
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
    }, [caen_data])

    return (
            <StripedTable
                rows={rows}
                columns={columns}
                height={600}/>
    );
}
