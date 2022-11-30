import React  from "react";
import {Alert, IconButton, Snackbar} from "@mui/material";


export function ToastPopup(props) {
    return (
    <Snackbar open={props.open} autoHideDuration={6000} onClose={()=> props.setOpen(false)}>
        <Alert onClose={()=> props.setOpen(false)} severity={props.severity} sx={{ width: '100%' }}>
            {props.text}
        </Alert>
    </Snackbar>

    )
}
