import React, {useContext, useState} from "react";
import {HiveConfig, HiveUrl} from "../App";
import {
    ProgressSpinner,
    ConditionalBadge,
    GenericCard,
    ModalView,
    useModal,
    useReadOnlyData
} from "../components/generic_control";
import {ControllerContext} from "../App";
import {SuccessTableRow, TableHeader, TableRow, WarningTableRow} from "../components/table_elements";
import {delay, getJson, postData, getUniqueIdentifier} from "../http_helper";
import {ButtonSpinner} from "../components/input_elements";
import {BsCheck, BsDot, BsX} from "react-icons/bs";
import {useMpa3} from "./mpa3";
import {useMdrive} from "./mdrive";


function Mpa3Card(props) {
    const root_url = useContext(HiveUrl);
    const url = root_url + props.hw.proxy;

    let [config, show, setShow, modalMessage, table_extra, button_extra] =
        useMpa3(url, props.hw.title)

    return (
        <ControllerContext.Provider value={config}>
            <ModalView show={show} setShow={setShow} message={modalMessage}/>
            <GenericCard table_extra={table_extra} button_extra={button_extra} collapse={props.collapse}/>
        </ControllerContext.Provider>);
}

function MDriveCard(props) {
    const root_url = useContext(HiveUrl);
    const url = root_url + props.hw.proxy;
    let [config, show, setShow, modalMessage, table_extra, button_extra] = useMdrive(url, props.hw.title, props.hw.load)

    return (
        <ControllerContext.Provider value={config}>
            <ModalView show={show} setShow={setShow} message={modalMessage}/>
            <GenericCard table_extra={table_extra} button_extra={button_extra} collapse={props.collapse}/>
        </ControllerContext.Provider>);
}

function ProgressTable(props) {
    let table = []
    for (let item of props.data.active_rqm.recipes) {
        table.push(<TableRow key={item.file_stem} items={[item.file_stem, item.type, item.sample_id, "0", "0%"]}/>)
    }

    let index = 0;
    for (let item of props.data.active_rqm_status) {
        let recipe = props.data.active_rqm.recipes[index];

        let run_time = item.run_time.toFixed(2);
        if (index < props.data.active_rqm_status.length -1 ) {
            table[index] = <SuccessTableRow key={recipe.file_stem} items={[recipe.file_stem, recipe.type, recipe.sample_id, run_time, "100%"]}/>
        }
        else {
            let fraction = parseFloat(item.run_time) / parseFloat(item.run_time_target);
            let percentage = (fraction * 100).toFixed(2);


            table[index] = <WarningTableRow key={recipe.file_stem} items={[recipe.file_stem, recipe.type, recipe.sample_id, run_time,
                <ProgressSpinner text={percentage + "%"}/>]}/>
        }
        index++;
    }

    return (
        <div className="clearfix">
            <h5>Active: {props.data.active_rqm.rqm_number}</h5>
            <table className="table table-striped table-hover table-sm">
                <TableHeader items={["Recipe", "Type", "Sample id", "Run time (s)", "Progress"]}/>
                <tbody>
                {table}
                </tbody>
            </table>
            <hr/>
        </div>
    )
}

function ScheduleTable(props) {
    let table = []
    if (Array.isArray(props.schedule) && props.schedule.length) {
        for (let item of props.schedule) {
            table.push(<TableRow key={item.rqm_number} items={[item.rqm_number]}/>)
        }
    }
    return (
        <>
            <h5>Scheduled: </h5>
            <table className="table table-striped table-hover table-sm">
                <TableHeader items={["Name"]}/>
                <tbody>
                {table}
                </tbody>
            </table>
            <hr/>
        </>
    )
}

function DoneTable(props) {
    let table = []
    if (Array.isArray(props.done) && props.done.length) {
        for (let item of props.done) {
            table.push(<TableRow key={item.rqm_number} items={[item.rqm_number]}/>)
        }
    }
    return (
        <>
            <h5>Done: </h5>
            <table className="table table-striped table-hover table-sm">
                <TableHeader items={["Name"]}/>
                <tbody>
                {table}
                </tbody>
            </table>
            <hr/>
        </>
    )
}

function FailedTable(props) {
    let table = []
    if (Array.isArray(props.failed) && props.failed.length) {
        for (let item of props.failed) {
            table.push(<TableRow key={item.rqm_number} items={[item.rqm_number, item.error_state]}/>)
        }
    }
    return (
        <>
            <h5>Failed: </h5>
            <table className="table table-striped table-hover table-sm">
                <TableHeader items={["Name", "Failure"]}/>
                <tbody>
                {table}
                </tbody>
            </table>
            <hr/>
        </>
    )
}

function HardwareCards() {
    let hardwareCards = []
    let hiveConfig = useContext(HiveConfig);

    for (let [key, item] of Object.entries(hiveConfig['erd']['hardware'])) {
        if (item.type === "mdrive") {
            hardwareCards.push(<MDriveCard hw={item} collapse={key} key={key}/>)
        }
        if (item.type === "mpa3") {
            hardwareCards.push(<Mpa3Card hw={item} collapse={key} key={key}/>)
        }
    }
    return (<> {hardwareCards} </>);
}

function FileValidBadge(props) {
    if (props.fileValid === "valid") {
        return <span className="input-group-text bg-success">
                        <BsCheck style={{color: "white"}}/>
                </span>
    } else if (props.fileValid === "invalid") {
        return <span className="input-group-text bg-danger">
                        <BsX style={{color: "white"}}/>
                </span>
    } else {
        return <span className="input-group-text">
                        <BsDot/>
                </span>
    }
}

function ScheduleErd(props) {
    let url = props.url;
    const [job, setJob] = useState({});
    let [modalMessage, show, setShow, cb] = useModal();
    const [filename, setFilename] = useState("");
    const [fileValid, setFileValid] = useState("");

    async function handleFileChange(e) {
        setFilename(e.target.files[0].name);
        let data = new FormData();
        data.append('file', e.target.files[0]);
        let response = await fetch(url + 'rqm_csv', {method: 'POST', body: data});
        let json_job = await response.json();

        if (response.status !== 200) {
            let message = <>Failed to parse csv. <br/>Error message:
                <div className="alert alert-dark text-monospace">{json_job}</div></>;
            cb(message);
            setFileValid("invalid");
            setJob({})
        } else {
            setJob(json_job);
            setFileValid("valid");
        }
    }

    async function scheduleRqm() {
        await postData(url + "run", JSON.stringify(job))
        setJob({})
        setFilename("");
        setFileValid("")
    }

    return (
        <div className="clearfix">
            <ModalView show={show} setShow={setShow} message={modalMessage}/>
            <div className="input-group mt-2 mb-2">
                <span className="input-group-text" id="inputGroup-sizing-sm">Add</span>
                <span className="input-group-text flex-grow-1">{filename}</span>
                <FileValidBadge fileValid={fileValid}/>
                <label className="btn btn-outline-primary align-middle">Upload CSV
                    <input type="file" id="csv_input" hidden
                           onClick={(e) => {
                               e.target.value = null;
                           }}
                           onChange={async (e) => await handleFileChange(e)}/>
                </label>
                <ButtonSpinner text="Schedule CSV" callback={scheduleRqm}/>
                    <ButtonSpinner text="Abort / Clear" callback={async () => {
                        await postData(props.url + "abort", "")
                        let running = true
                        while (running) {
                            await delay(250);
                            let [, data] = await getJson(props.url + "state")
                            running = data["run_status"] !== "Idle"
                        }
                    }}/>
            </div>
        </div>
    );
}

function ErdExperiment() {
    const root_url = useContext(HiveUrl);

    let url = root_url + "/api/erd/"
    let initialState = {
        "queue": [], "active_rqm": {"recipes": [], "rqm_number": "", "detectors": []}, "active_rqm_status": []}
    let state = useReadOnlyData(url + "state", initialState);

    let run_status = state["run_status"]
    let rqm_number = state["active_rqm"]["rqm_number"]

    return (
        <div>
            <div className="clearfix">
                <h3 className="float-start">ERD RQM</h3>
                <h5 className="clearfix float-end">
                    <ConditionalBadge error={false} text={run_status + ": " + rqm_number}/>
                </h5>
            </div>
            <ScheduleErd url={url}/>
            <RbsControl url={url}/>
            <ScheduleTable schedule={state["queue"]}/>
            <ProgressTable data={state}/>
            <DoneTable done={state["done"]}/>
            <FailedTable failed={state["failed"]}/>
        </div>);
}

function RbsControl(props) {
    return (
        <div>
            <div className="clearfix">
                <div className="float-end btn-group">
                    <ButtonSpinner text="Get Logs" callback={async () => {
                        let response = await fetch(props.url + "logs");
                        let blob = await response.blob()
                        console.log(blob);

                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = getUniqueIdentifier() + "_logs.txt";
                        link.click();
                    }}/>
                </div>
            </div>
        </div>
    );
}


export function ErdOverview() {

    return (
        <div className="row">
            <div className="col-sm">
                <ErdExperiment />
            </div>
            <div className="col-sm">
                <HardwareCards/>
            </div>

        </div>
    );
}
