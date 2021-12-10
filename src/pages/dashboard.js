import React, {useContext} from "react";
import {HiveConfig, HiveUrl} from "../App";
import {TableHeader, TableRow} from "../components/table_elements";
import {useData} from "../components/generic_control";
import {ConditionalBadge} from "../components/generic_control";
import {GoLinkExternal} from "react-icons/all";
import {Link} from "react-router-dom";


export function StatusRow(props) {
    const [data, , running] = useData(props.url);

    let runningStatus = running !== "Running";
    let runBadge = <ConditionalBadge text={running} error={runningStatus}/>

    let successStatus = data["error"] === "Success" || data["error"] === "No error";
    let errorBadge = <ConditionalBadge text={data["error"]} error={!successStatus}/>;

    return (
        <TableRow items={[props.title, runBadge, errorBadge, data["request_id"],
            <Link to={props.href}><GoLinkExternal/></Link>]}/>
    );
}

export function Dashboard() {
    const context = useContext(HiveConfig);
    const root_url = useContext(HiveUrl);

    let full_page = []

    for (const [key, value] of Object.entries(context)) {
        let table = []
        for (const [hardware_key, hardware_value] of Object.entries(value.hardware)) {
            table.push(
                <StatusRow url={root_url + hardware_value.proxy} title={hardware_value.title} key={hardware_key}
                           href={"/nectar/" + key + "/" + hardware_key}
                />)
        }
        const capitalized_key = key[0].toUpperCase() + key.slice(1);

        let link = <></>
        if (key === "rbs" || key === "erd") {
            link = <Link className="float-start" to={"/nectar/" + key + "/overview"}><GoLinkExternal/></Link>;
        }

        full_page.push(
            <div key={key}>
                <div className="clearfix"><h3 className="float-start"> {capitalized_key}</h3> {link}
                </div>
                <hr/>
                <table className="table table-striped table-hover table-sm">
                    <TableHeader items={["Name", "Connection State", "Error State", "Last Request id", "Go to"]}/>
                    <tbody>
                    {table}
                    </tbody>
                </table>
            </div>
        );
    }

    return (full_page)
}
