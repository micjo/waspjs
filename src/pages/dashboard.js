import React, {useContext} from "react";
import {HiveData} from "../App";
import {TableHeader, TableRow} from "../components/table_elements";
import {useData} from "../components/generic_control";
import {ConditionalBadge} from "../components/generic_control";


export function StatusRow(props) {
    const [data, , running] = useData(props.url);

    let runningStatus = running !== "Running";
    let runBadge = <ConditionalBadge text={running} error={runningStatus}/>

    let successStatus = data["error"] === "Success" || data["error"] === "No error";
    let errorBadge = <ConditionalBadge text={data["error"]} error={!successStatus}/>;

    return (
    <TableRow items={ [props.title, runBadge, errorBadge, data["request_id"] ]}/>
    );
}

export function Dashboard() {
    const context = useContext(HiveData);

    return (
        <>
        <table className="table table-striped table-hover table-sm">
            <TableHeader items={["Name", "Connection State", "Error State", "Last Request id"]}/>
            <tbody>
            <StatusRow url={context.aml_x_y.url} title={context.aml_x_y.title}/>
            <StatusRow url={context.aml_det_theta.url} title={context.aml_det_theta.title}/>
            <StatusRow url={context.aml_phi_zeta.url} title={context.aml_phi_zeta.title}/>
            <StatusRow url={context.caen_rbs.url} title={context.caen_rbs.title}/>
            <StatusRow url={context.motrona_rbs.url} title={context.motrona_rbs.title}/>
            </tbody>
        </table>
            </>);
}
