import {TableHeader, TableRow} from "./table_elements";
import {ButtonSpinner} from "./button_spinner";
import {getJson, sendRequest} from "../http_helper";
import {useCallback, useContext, useEffect, useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {ControllerContext} from "../App";

export function ModalView(props) {

    const handleClose = () => props.setShow(false);
    const handleShow = () => props.setShow(true);

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
    return (
        <ButtonSpinner text="Hide" callback={async () => {
            await sendRequest(props.url, {"hide": false})
        }}/>
    );
}

function ShowButton(props) {
    return (
        <ButtonSpinner text="Show" callback={async () => {
            await sendRequest(props.url, {"hide": true})
        }}/>
    );
}

function ContinueButton(props) {
    const controller = useContext(ControllerContext);
    return (
        <ButtonSpinner text="Continue" callback={async () => {
            await sendRequest(controller.url, {"continue": true}, controller.popup, controller.setData)
        }}/>
    );
}

function RunningBadge(props) {
    let element;
    if (props.running === "Not connected") {
        element = <span className="badge bg-danger me-2">{props.running}</span>
    }
    else if (props.error !== "Success") {
        element = <span className="badge bg-warning me-2">{props.error}</span>
    }
    else {
        element = <span className="badge bg-success me-2">{props.running}</span>
    }
    return element;
}

function BriefBadge(props) {
    let element;
    if (props.busy) {
        element = <span className="badge bg-secondary">{props.brief}</span>
    }
    else {
        element = <span className="badge bg-success">{props.brief}</span>
    }
    return element;
}

export function GenericControl(props) {
    const controller = useContext(ControllerContext);
    return (
        <>
            <div className="clearfix">
                <h3 className="float-start">{controller.title}</h3>
                <h5 className="clearfix float-end">
                    <RunningBadge running={controller.running} error={props.data["error"]} />
                    <BriefBadge brief={controller.brief}/>
                    <span className="spinner-border spinner-border-sm ms-2" style={{"visibility": controller.busy?"visible":"hidden" }}/>
                </h5>
            </div>
            <hr/>
            <table className="table table-striped table-hover table-sm">
                <TableHeader items={["Identifier", "Value", "Control"]}/>
                <tbody>
                <TableRow items={["Request acknowledge", props.data["request_id"], ""]}/>
                <TableRow items={["Request Finished", props.data["request_finished"] ? "True" : "False", ""]}/>
                <TableRow items={["Error", props.data["error"], ""]}/>
                {props.table_extra}
                </tbody>
            </table>

            <div className="clearfix">
                <div className="btn-group float-end">
                    {props.button_extra}
                    <HideButton url={controller.url}/>
                    <ShowButton url={controller.url}/>
                    <ContinueButton url={controller.url}/>
                </div>
            </div>
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

    return {modalMessage, show, setShow, cb}
}

export function useData(url) {
    const [data, setData] = useState({});
    const [running, setRunning] = useState("");

    useEffect(() => {
        const interval = setInterval(async () => {
            let [status, json_response] = await getJson(url);
            if (status === 404) {
                setRunning("Not connected");
            } else {
                setRunning("Running");
                setData(json_response);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [url]);

    return {data, setData, running}
}