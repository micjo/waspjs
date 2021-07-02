import React from "react"
import {ButtonSpinner} from "./button_spinner";
import {TableRow, TableHeader} from "./table_elements";
import {sendRequest} from "../http_helper";

export default function RootCard(props) {
    return (
        <div className="card text-nowrap bg-light text-dark mt-2 mb-3">
            <div className="card-header clearfix">
                <h6 className="float-start">{props.title}</h6>
                <div className="clearfix float-end">
                    <span className="badge bg-info">{props.brief_status}</span>
                    <span className="spinner-border spinner-border-sm"
                          style={{display: props.active ? "inline-block" : "none"}}> </span>
                    <span className="badge bg-secondary">{props.sanity_status}</span>
                </div>
            </div>
            <button className="btn btn-secondary" data-bs-toggle="collapse" href={"#control" + props.prefix}>Expand
                Toggle
            </button>
            <div className="collapse" id={"control" + props.prefix}>
                <table className="table table-striped table-hover table-sm">
                    <TableHeader items={["Identifier", "Value", "Control"]}/>
                    <tbody>
                    <TableRow items={["Request Id", props.HwResponse["request_id"], ""]}/>
                    <TableRow
                        items={["Request Finished", props.HwResponse["request_finished"] ? "True" : "False", ""]}/>
                    <TableRow items={["Error", props.HwResponse["error"], ""]}/>
                    {props.table_extra}
                    </tbody>
                </table>
                <div className="clearfix">
                    <div className="btn-group float-end">
                        {props.button_extra}
                        <ButtonSpinner text="Continue" callback={async () => {
                            await sendRequest(props.url, {"continue": true})
                        }}/>
                        <ButtonSpinner text="Show" callback={async () => {
                            await sendRequest(props.url, {"hide": false});
                        }}/>
                        <ButtonSpinner text="Hide" callback={async () => {
                            await sendRequest(props.url, {"hide":true});
                        }}/>
                    </div>
                </div>
            </div>
        </div>);
}
