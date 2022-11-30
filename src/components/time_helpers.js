export function getLocaleIsoTime() {
    let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    return (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
}

export function getLocaleOneMonthAgoIsoTime() {
    let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    let now = new Date(Date.now() - tzoffset);
    now.setMonth(now.getMonth() - 1)
    return now.toISOString().slice(0,-1);
}

export function getLocaleFiveHoursAgoIsoTime() {
    let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    let now = new Date(Date.now() - tzoffset);
    now.setHours(now.getHours() - 5)
    return now.toISOString().slice(0,-1);
}

export function epochToString(seconds_since_epoch) {
    // format: YYYY.MM.DD__HH:MM__SS
    if (seconds_since_epoch === "" || seconds_since_epoch === null) {
        return ""
    }
    let isoDate = new Date(seconds_since_epoch * 1000).toLocaleString('nl-BE').replaceAll(',', '');
    return isoDate;
}