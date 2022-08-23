import React, {useState} from "react"
import {ProgressButton} from "./elements";
import {TableRow, TableHeader} from "./table_elements";
import {sendRequest} from "../http_helper";
import {BsCaretDown, BsCaretUp} from "react-icons/bs";



export function Collapsable(props) {
    const [expanded, setExpanded] = useState(false);
    return (<div className="card text-nowrap bg-light text-dark mt-2 mb-3">
        <div className="card-header clearfix" data-bs-toggle="collapse" href={"#collapse-" + props.prefix} role="button"
             aria-expanded="false" onClick={() => {setExpanded(!expanded);}}>
            <div className="float-start"> RBS </div>
            <div className="float-end"> {expanded ? <BsCaretUp size={20}/> : <BsCaretDown size={20}/>} </div>
        </div>
        <div className="collapse" id={"collapse-" + props.prefix}>
            {props.children}
        </div>
    </div>);
}


// TODO: ROOTCARD SHOULD USE COLLAPSABLE ABOVE

export default function RootCard(props) {
    const [expanded, setExpanded] = useState(false);
    return (
        <div className="card text-nowrap bg-light text-dark mt-2 mb-3">
            <div className="card-header clearfix" data-bs-toggle="collapse" href={"#control" + props.prefix} role="button"
                 aria-expanded="false" onClick={() => {setExpanded(!expanded);}}>
                <h6 className="float-start">{props.title}</h6>
                <div className="clearfix float-end">
                    <span className="badge bg-info">{props.brief_status}</span>
                    <span className="spinner-border spinner-border-sm"
                          style={{display: props.active ? "inline-block" : "none"}}> </span>
                    <span className="badge bg-secondary">{props.sanity_status}</span>
                    <div> {expanded ? <BsCaretUp size={20}/> : <BsCaretDown size={20}/>} </div>
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
                        <ProgressButton text="Continue" callback={async () => {
                            await sendRequest(props.url, {"continue": true})
                        }}/>
                        <ProgressButton text="Show" callback={async () => {
                            await sendRequest(props.url, {"hide": false});
                        }}/>
                        <ProgressButton text="Hide" callback={async () => {
                            await sendRequest(props.url, {"hide":true});
                        }}/>
                    </div>
                </div>
            </div>
        </div>);
}
