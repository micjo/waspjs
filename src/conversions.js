
export async function onChangeSetInt(value, setValue) {
    let intValue = parseInt(value);
    if (intValue) {setValue(intValue);}
    console.log("new value is" + value);
}
