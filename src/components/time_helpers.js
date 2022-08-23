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