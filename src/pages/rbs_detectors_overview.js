import React, {useContext} from "react";
import {HiveConfig, HiveUrl} from "../App";
import {TableHeader, TableRow} from "../components/table_elements";
import {useData} from "../components/generic_control";

export function RbsDetectorOverview() {
    const hiveConfig = useContext(HiveConfig);
    let detectors = hiveConfig?.rbs?.hardware?.caen?.detectors;
    let table = [];

    const hiveUrl = useContext(HiveUrl)

    const [data,,] = useData(hiveUrl + hiveConfig?.rbs?.hardware?.caen?.proxy);

    let boards = {}
    if (data.boards) {
        for (let board of data?.boards) {
            boards[board.id] = board
        }
    }

    for (let detector of detectors) {
        let active_channel = boards[detector.board]?.channels[detector.channel]
        let binning = "(" + detector.bins_min + ":" + detector.bins_max + ") -> " + detector.bins_width
        table.push(<TableRow key={detector.identifier} items={[ detector.identifier, detector.board, detector.channel,
            binning, active_channel?.trapezoid_rise_time + " ns", active_channel?.trapezoid_flat_top + " ns"
        ]}/>)
    }

    return (
        <div>
        <h1> RBS Detectors </h1>
            <table className="table table-striped table-hover table-sm">

                <TableHeader
                    items={["Identifier", "Board", "Channel", "Binning", "Trapezoid Rise Time", "Trapezoid Flat Top"]}/>
                <tbody>
                {table}
                </tbody>
            </table>
        </div>
    );
}
