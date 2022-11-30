import {useCallback} from "react";

export function getUniqueIdentifier() {
    // format: YYYY.MM.DD__HH:MM__SS
    let date = new Date().toISOString();
    date = date.slice(0, -5);
    date = date.split(':');

    let yearAndHour = date[0].replace(/-/g, ".").replace(/T/g, "__");
    let identifier = yearAndHour + "." + date[1] + "__" + date[2];
    return identifier;
}

export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForCompleted(url, requestId, retryLimit) {
    let data = {};
    let complete = false;
    let retryCount = 0;

    while (!complete) {
        let response = await fetch(url)
        if (response.status === 404) {
            break;
        }
        data = await response.json();
        complete = (data['request_id'] === requestId && data['request_finished'] === true);
        retryCount++;
        if (retryCount > retryLimit) {
            break;
        }
        await delay(250);
    }

    return data;
}

export async function postData(host, textBody) {
    return fetch(host, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: textBody
    });
}

export async function deleteData(host) {
    return fetch(host, {method: 'DELETE'});
}

export async function getJson(url) {
    let response = await fetch(url);
    let response_json = await response.json();
    return [response.status, response_json];
}

export async function getText(url) {
    let response = await fetch(url);
    let response_txt = await response.text();
    return [response.status, response_txt];
}


export async function sendRequest(url, request, setError, setData) {
        let requestId = {"request_id": getUniqueIdentifier()}
        let fullRequest = {...requestId, ...request};

        let data = {}
        try {
            data = await postData(url, JSON.stringify(fullRequest));
        } catch (error) {
            setError("Controller cannot be contacted. Is it running?");
            return;
        }

        if (data.status === 404) {
            setError("Controller cannot be contacted. Is it running?");
            return;
        }

        if (data.status !== 200) {
            let failMessage = await data.text()
            setError("Failed to process request: Error message:\n " + failMessage.slice(1, -1));
            return;
        }

        try {
            data = await waitForCompleted(url, requestId["request_id"], 50);
        } catch (error) {
            setError("Daemon did not complete request");
        }

        if (!(data["error"] === "Success" || data["error"] === "No error")) {
            setError(data["error"]);
        }
        if (setData) {setData(data);}
}


export function useSendRequest(url, setError) {
    return useCallback(async (request) => {
        await sendRequest(url, request, setError)
    }, [url, setError])
}


export function useSendRequestWithData(url, setError, setData) {
    return useCallback(async (request) => {
        await sendRequest(url, request, setError, setData)
    }, [url, setError, setData])
}



