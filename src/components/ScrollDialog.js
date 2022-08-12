import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import React, {useEffect, useRef, useState} from "react";
import {Paper} from "@mui/material";

function NewlineText(props) {
    const text = props.text.substring(1);
    let lines = []
    let i = 0;
    for(let line of text.split("\\n")) {
        lines.push(<Paper key={i}>{line}</Paper>)
        i++;
    }
    lines.pop()
    return lines;
}

export default function ScrollDialog(props) {
    return (
        <div>
            <Dialog
                open={props.open}
                onClose={props.onClose}
                scroll={'paper'}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
                maxWidth = 'lg'
            >
                <DialogTitle id="scroll-dialog-title">{props.title}</DialogTitle>
                <DialogContent dividers={true}>
                    <DialogContentText>
                        <NewlineText text={props.text}/>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={props.onClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}