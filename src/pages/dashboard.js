import React, {useContext} from "react";
import {HiveConfig, HiveUrl} from "../App";
import {TableHeader, TableRow} from "../components/table_elements";
import {useData} from "../components/generic_control";
import {ConditionalBadge} from "../components/generic_control";
import {GoLinkExternal} from "react-icons/all";
import {Link} from "react-router-dom";
import {SmallButtonSpinner} from "../components/input_elements";
import {postData} from "../http_helper";


export function StatusRow(props) {
    const root_url = useContext(HiveUrl);
    const [data, , running] = useData(props.url);


    let runningStatus = running !== "Running";
    let runBadge = <ConditionalBadge text={running} error={runningStatus}/>

    let successStatus = data["error"] === "Success" || data["error"] === "No error";
    let errorBadge = <ConditionalBadge text={data["error"]} error={!successStatus}/>;

    let start_query = "?name=" + props.id + "&start=true";
    let stop_query = "?name=" + props.id + "&start=false";

    return (
        <TableRow items={[props.title, runBadge, errorBadge, data["request_id"],
            <div>
                <SmallButtonSpinner text="Start" callback={async () => {
                    await postData(root_url + "/api/service" + start_query, "" );
                }}/>
                <SmallButtonSpinner text="stop" callback={async () => {
                    await postData(root_url + "/api/service" + stop_query, "");
                }}/>

                <Link to={props.href}><GoLinkExternal/></Link>
            </div>]}
        />);
}

export function Dashboard() {
    const context = useContext(HiveConfig);
    const root_url = useContext(HiveUrl);

    let full_page = []

    for (const [setup_key, setup_value] of Object.entries(context)) {
        let table = []
        for (const [hardware_key, hardware_value] of Object.entries(setup_value.hardware)) {
            table.push(
                <StatusRow url={root_url + hardware_value.proxy} title={hardware_value.title} key={hardware_key}
                           id={hardware_key}
                           href={"/nectar/" + setup_key + "/" + hardware_key}
                />)
        }
        const capitalized_key = setup_key[0].toUpperCase() + setup_key.slice(1);

        let link = <></>
        if (setup_key === "rbs" || setup_key === "erd") {
            link = <Link className="float-start" to={"/nectar/" + setup_key + "/overview"}><GoLinkExternal/></Link>;
        }

        full_page.push(
            <div key={setup_key}>
                <div className="clearfix"><h3 className="float-start"> {capitalized_key}</h3> {link}
                </div>
                <hr/>
                <table className="table table-striped table-hover table-sm">
                    <TableHeader items={["Name", "Connection State", "Error State", "Last Request id", "Control"]}/>
                    <tbody>
                    {table}
                    </tbody>
                </table>
            </div>
        );
    }

    return (full_page)
}
