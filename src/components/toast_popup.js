import React, {useState} from "react";
import {Button, IconButton, Snackbar} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export function ToastPopup(props) {
    const action = (
        <React.Fragment>
            <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => props.setOpen(false)}>
                <CloseIcon fontSize="small"/>
            </IconButton>
        </React.Fragment>
    );

    return (
        <Snackbar
            open={props.open}
            autoHideDuration={6000}
            onClose={() => props.setOpen(false)}
            message="This is not supported"
            action={action}
        />
    )
}