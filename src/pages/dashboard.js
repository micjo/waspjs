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

    const aml_x_y = context.hw_config.controllers.aml_x_y;
    const aml_phi_zeta = context.hw_config.controllers.aml_phi_zeta;
    const aml_det_theta = context.hw_config.controllers.aml_det_theta;
    const motrona_rbs = context.hw_config.controllers.motrona_rbs;
    const caen_rbs = context.hw_config.controllers.caen_rbs;

    return (
        <>
        <table className="table table-striped table-hover table-sm">
            <TableHeader items={["Name", "Connection State", "Error State", "Last Request id"]}/>
            <tbody>
            <StatusRow url={aml_x_y.url} title={aml_x_y.title}/>
            <StatusRow url={aml_det_theta.url} title={aml_det_theta.title}/>
            <StatusRow url={aml_phi_zeta.url} title={aml_phi_zeta.title}/>
            <StatusRow url={caen_rbs.url} title={caen_rbs.title}/>
            <StatusRow url={motrona_rbs.url} title={motrona_rbs.title}/>
            </tbody>
        </table>
            </>);
}
