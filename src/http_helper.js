function getUniqueIdentifier() {
    // format: YYYY.MM.DD__HH:MM__SS
    let date = new Date().toISOString();
    date = date.slice(0, -5);
    date = date.split(':');

    let yearAndHour = date[0].replace(/-/g, ".").replace(/T/g, "__");
    let identifier = yearAndHour + ":" + date[1] + "__" + date[2];
    return identifier;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForCompleted(url, requestId, retryLimit){
    let data = {};
    let complete = false;
    let retryCount = 0;

    while (!complete) {
        let response = await fetch(url)
        if (response.status === 404) { throw 'Daemon not reachable.'; }
        data = await response.json();
        await delay(250);
        complete = (data['request_id'] === requestId && data['request_finished'] === true);

        retryCount++;
        if (retryCount > retryLimit) { throw 'Daemon did not complete request'; }
    }
    return data;
}

export async function sendRequest(url, request) {
    let requestId = {"request_id": getUniqueIdentifier()}

    let fullRequest = {
        ...requestId,
        ...request
    };

    let data = {}
    await postData(url, JSON.stringify(fullRequest));
    try {
        data = await waitForCompleted(url, requestId["request_id"], 50);
    }
    catch(error){
        console.log(error);
    }
    return data
}

async function postData(host, textBody) {
    return fetch(host, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: textBody
    });
}

export async function getJson(url)
{
    let response = await fetch(url);
    let response_json = await response.json();
    return response_json;
}




