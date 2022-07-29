import React, {useContext} from "react";
import {HiveConfig} from "../App";
import {TableHeader, TableRow} from "../components/table_elements";

export function RbsDetectorOverview() {
    const hiveConfig = useContext(HiveConfig);
    let detectors = hiveConfig?.rbs?.hardware?.caen?.detectors;
    let table = [];

    for (let detector of detectors) {
        let binning = "(" + detector.bins_min + ":" + detector.bins_max + ") -> " + detector.bins_width

        table.push(<TableRow key={detector.identifier} items={[ detector.identifier, detector.board, detector.channel,
            binning


        ]}/>)


    }


    return (
        <div>
        <h1> RBS Detectors </h1>
            <table className="table table-striped table-hover table-sm">

                <TableHeader
                    items={["Identifier", "Board", "Channel", "Binning"]}/>
                <tbody>
                {table}
                </tbody>
            </table>
        </div>
    );
}
