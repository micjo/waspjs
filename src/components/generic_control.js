import {TableHeader, TableRow} from "./table_elements";
import {ButtonSpinner} from "./input_elements";
import {getJson, sendRequest} from "../http_helper";
import React, {useCallback, useContext, useEffect, useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {ControllerContext} from "../App";

export function ModalView(props) {

    const handleClose = () => props.setShow(false);

    return (
        <>
            <Modal show={props.show} onHide={handleClose}>
                <div className="modal-header alert alert-danger">
                    <h5 className="modal-title">Failure</h5>
                </div>
                <div className="modal-body" id="modalFailBody">
                    {props.message}
                </div>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Dismiss
                    </Button>
                </Modal.Footer>
            </Modal>
        </>);

}


function HideButton(props) {
    const controller = useContext(ControllerContext);
    return (
        <ButtonSpinner text="Hide" callback={async () => {
            await sendRequest(props.url, {"hide": true}, controller.popup, controller.setData)
        }}/>
    );
}

function ShowButton(props) {
    const controller = useContext(ControllerContext);
    return (
        <ButtonSpinner text="Show" callback={async () => {
            await sendRequest(props.url, {"hide": false}, controller.popup, controller.setData)
        }}/>
    );
}

function IgnoreErrorButton() {
    const controller = useContext(ControllerContext);
    return (
        <ButtonSpinner text="Ignore Error" callback={async () => {
            await sendRequest(controller.url, {"ignore_error": true}, controller.popup, controller.setData)
        }}/>
    );
}

export function ConditionalBadge(props) {
    let element;
    if (props.error) {
        element = <span className="badge bg-danger">{props.text}</span>
    } else {
        element = <span className="badge bg-success">{props.text}</span>
    }
    return element;
}

function RunningBadge(props) {
    let element;
    if (props.running === "Not connected") {
        element = <span className="badge bg-danger">{props.running}</span>
    } else if (!(props.error === "Success" || props.error === "No error")) {
        element = <span className="badge bg-warning">{props.error}</span>
    } else {
        element = <span className="badge bg-success">{props.running}</span>
    }
    return element;
}

export function BriefBadge(props) {
    let element;
    if (props.busy) {
        element = <span className="badge bg-secondary me-2">{props.brief}</span>
    } else {
        element = <span className="badge bg-success me-2">{props.brief}</span>
    }
    return element;
}

export function ProgressSpinner(props) {
    return (
        <>
            <label>{props.text}</label>
            <span className="spinner-border spinner-border-sm ms-2"/>
        </>
    );
}

function BusySpinnner(props) {
    return (
        <span className="spinner-border spinner-border-sm me-2"
              style={{"visibility": props.busy ? "visible" : "hidden"}}/>);
}

export function ButtonControl(props) {
    const controller = useContext(ControllerContext);
    return (
        <div className="clearfix">
            <div className="btn-group float-end">
                {props.button_extra}
                <HideButton url={controller.url}/>
                <ShowButton url={controller.url}/>
                <IgnoreErrorButton url={controller.url}/>
            </div>
        </div>
    );

}

export function TableControl(props) {
    return (
        <table className="table table-striped table-hover table-sm">
            <TableHeader items={["Identifier", "Value", "Control"]}/>
            <tbody>
            <TableRow items={["Request acknowledge", props.data["request_id"], ""]}/>
            <TableRow items={["Request Finished", props.data["request_finished"] ? "True" : "False", ""]}/>
            <TableRow items={["Error", props.data["error"], ""]}/>
            {props.table_extra}
            </tbody>
        </table>);
}


export function PageTitle() {
    const controller = useContext(ControllerContext);
    return (
        <>
            <div className="clearfix">
                <h3 className="float-start">{controller.title}</h3>
                <h5 className="clearfix float-end">
                    <BusySpinnner busy={controller.busy}/>
                    <BriefBadge brief={controller.brief}/>
                    <RunningBadge running={controller.running} error={controller.data["error"]}/>
                </h5>
            </div>
            <hr/>
        </>
    );
}

export function GenericCard(props) {
    const context = useContext(ControllerContext);
    return (
        <div className="card text-nowrap bg-light text-dark mt-2 mb-3">
            <div className="card-header clearfix">
                <h6 className="float-start">{context.title}</h6>
                <div className="clearfix float-end">
                    <BusySpinnner busy={context.busy}/>
                    <BriefBadge brief={context.brief}/>
                    <RunningBadge running={context.running} error={context.data["error"]}/>
                </div>
            </div>
            <a className="btn btn-secondary" data-bs-toggle="collapse" href={"#control" + props.collapse}>Expand
                Toggle
            </a>
            <div className="collapse" id={"control" + props.collapse}>
                <TableControl table_extra={props.table_extra} data={context.data}/>
                <ButtonControl button_extra={props.button_extra}/>
                {props.extra}
            </div>

        </div>);

}

export function GenericControl(props) {
    const context = useContext(ControllerContext);
    return (
        <>
            <PageTitle data={context.data}/>
            <TableControl table_extra={props.table_extra} data={context.data}/>
            <ButtonControl button_extra={props.button_extra}/>
            <hr/>
        </>
    );
}

export function useModal() {
    const [show, setShow] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    const cb = useCallback((message) => {
        setModalMessage(message);
        setShow(true)
    }, []);

    return [modalMessage, show, setShow, cb]
}

export function useReadOnlyData(url, initialState) {
    const [data, setData] = useState(initialState);

    useEffect(() => {
            const getControllerData = async () => {
                let [, json_response] = await getJson(url);
                setData(json_response);
            }

            getControllerData();
            const interval = setInterval(getControllerData, 1000);
            return () => clearInterval(interval);
        }, [url]
    );

    return data
}

export function useData(url, initialData={} ) {
    const [data, setData] = useState(initialData);
    const [running, setRunning] = useState();

    useEffect(() => {
            const getControllerData = async () => {
                let [status, json_response] = await getJson(url);
                if (status === 404) {
                    setRunning("Not connected");
                } else {
                    setRunning("Running");
                    setData(json_response);
                }
            }
            getControllerData()
            const interval = setInterval(getControllerData, 1000);
            return () => clearInterval(interval);
        }, [url]
    );

    return [data, setData, running]
}
