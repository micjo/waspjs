import React, {useContext, useState} from "react";
import {HiveConfig} from "../App";
import {useAml} from "./aml";
import {
    ProgressSpinner,
    ConditionalBadge,
    GenericCard,
    ModalView,
    useModal,
    useReadOnlyData
} from "../components/generic_control";
import {ControllerContext} from "../App";
import {useMotrona} from "./motrona";
import {useCaen} from "./caen";
import {SuccessTableRow, TableHeader, TableRow, WarningTableRow} from "../components/table_elements";
import {delay, getJson, postData, getUniqueIdentifier} from "../http_helper";
import {ButtonSpinner} from "../components/input_elements";
import {HistogramCaen} from "../components/histogram_caen";
import {BsCheck, BsDot, BsX} from "react-icons/bs";


function AmlCard(props) {
    let [config, show, setShow, modalMessage, table_extra, button_extra] =
        useAml(props.aml.proxy, props.aml.names, props.aml.loads)

    return (
        <ControllerContext.Provider value={config}>
            <ModalView show={show} setShow={setShow} message={modalMessage}/>
            <GenericCard table_extra={table_extra} button_extra={button_extra} collapse={props.collapse}/>
        </ControllerContext.Provider>);
}

function MotronaCard(props) {
    let [config, show, setShow, modalMessage, table_extra, button_extra] = useMotrona(props.motrona.proxy)

    return (
        <ControllerContext.Provider value={config}>
            <ModalView show={show} setShow={setShow} message={modalMessage}/>
            <GenericCard table_extra={table_extra} button_extra={button_extra} collapse={props.collapse}/>
        </ControllerContext.Provider>);
}

function CaenCard(props) {
    let [config, show, setShow, modalMessage, table_extra, button_extra] = useCaen(props.caen.proxy)
    let histogram = <HistogramCaen url={props.caen.proxy}/>

    return (
        <ControllerContext.Provider value={config}>
            <ModalView show={show} setShow={setShow} message={modalMessage}/>
            <GenericCard table_extra={table_extra} button_extra={button_extra} collapse={props.collapse}
                         extra={histogram}/>
        </ControllerContext.Provider>);
}

const exection = {
    TODO: "TODO",
    DOING: "DOING",
    DONE: "DONE"
}

function ProgressTable(props) {

    let table = []
    let itemExecuting = exection.DONE;
    for (let item of props.data.active_rqm.recipes) {
        if (item.sample_id === props.data.active_sample_id) {
            itemExecuting = exection.DOING;
        }
        if (itemExecuting === exection.TODO) {
            table.push(<TableRow key={item.file_stem} items={[item.sample_id, item.type, item.file_stem, "0%"]}/>)
        }
        if (itemExecuting === exection.DONE) {
            table.push(<SuccessTableRow key={item.file_stem}
                                        items={[item.sample_id, item.type, item.file_stem, "100%"]}/>)
        }
        if (itemExecuting === exection.DOING) {
            let fraction = parseFloat(props.data.accumulated_charge) / parseFloat(props.data.accumulated_charge_target);
            let percentage = (fraction * 100).toFixed(2);
            table.push(<WarningTableRow key={item.file_stem} items={[item.sample_id, item.type, item.file_stem,
                <ProgressSpinner text={percentage + "%"}/>]}/>
            )
            itemExecuting = exection.TODO;
        }
    }

    return (
        <div className="clearfix">
            <h5>Active: {props.data.active_rqm.rqm_number}</h5>
            <table className="table table-striped table-hover table-sm">
                <TableHeader items={["Sample Id", "Type", "File Stem", "Active"]}/>
                <tbody>
                {table}
                </tbody>
            </table>
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
    if (Array.isArray(props.done_queue) && props.done_queue.length) {
        for (let item of props.done_queue) {
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

function HardwareCards(props) {
    let hardwareCards = []
    for (let [key, item] of Object.entries(props.hardware)) {
        if (item.type === "aml") {
            hardwareCards.push(<AmlCard aml={item} collapse={key} key={key}/>)
        }
        if (item.type === "motrona") {
            hardwareCards.push(<MotronaCard motrona={item} collapse={key} key={key}/>)
        }
        if (item.type === "caen") {
            hardwareCards.push(<CaenCard caen={item} collapse={key} key={key}/>)
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

function RandomSchedule(props) {
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
            </div>
        </div>
    );
}

function RbsExperiment(props) {
    let url = props.root_url + "/api/rbs/"
    let initialState = {
        "queue": [], "active_rqm": {"recipes": [], "rqm_number": "", "detectors": []},
        "run_status": "Idle", "active_sample_id": "", "accumulated_charge": 0, "accumulated_charge_target": 0
    }
    let state = useReadOnlyData(url + "state", initialState);

    let run_status = state["run_status"]
    let rqm_number = state["active_rqm"]["rqm_number"]

    return (
        <div>
            <div className="clearfix">
                <h3 className="float-start">RBS RQM</h3>
                <h5 className="clearfix float-end">
                    <ConditionalBadge error={false} text={run_status + ": " + rqm_number}/>
                </h5>
            </div>
            <RandomSchedule url={url}/>
            <RbsControl url={url}/>
            <ScheduleTable schedule={state["queue"]}/>
            <div className="clearfix"><ProgressTable data={state}/></div>

            <div className="clearfix">
                <div className="btn-group float-end">
                </div>
            </div>
            <hr/>
            <DoneTable done_queue={state["done_queue"]}/>
        </div>);
}

function RbsControl(props) {
    return (
        <div>
            <div className="clearfix">
                <div className="float-end btn-group">
                    <ButtonSpinner text="Start Hw Controllers" callback={async () => {
                        await postData(props.url + "hw_control?start=true", "");
                    }}/>
                    <ButtonSpinner text="Stop Hw Controllers" callback={async () => {
                        await postData(props.url + "hw_control?start=false", "");
                    }}/>
                    <ButtonSpinner text="Get RBS Logs" callback={async () => {
                        let response = await fetch(props.url + "logs");
                        let blob = await response.blob()
                        console.log(blob);

                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = getUniqueIdentifier() + "_logs.txt";
                        link.click();
                    }}/>
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
        </div>
    );
}


export function Rbs() {
    let context = useContext(HiveConfig);

    return (
        <div className="row">
            <div className="col-sm">
                <RbsExperiment rbs={context.rbs_config} root_url={context.hive_url}/>
            </div>
            <div className="col-sm">
                <HardwareCards hardware={context.rbs_config.hardware}/>
            </div>

        </div>
    );
}
