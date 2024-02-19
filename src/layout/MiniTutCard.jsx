import React from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Card, CardContent } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';


export const MiniTutCard = ({ open, handleClose, openFullTutorial }) => {
    const handleSkipFullTutorial = () => {
        handleClose();
    }

    const handleGoFullTutorial = () => {
        handleClose();
        openFullTutorial();
    }

    return <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="tutorial-card-title"
        aria-describedby="tutorial-card-description"
        maxWidth="sm"
        fullWidth={true}
    >
        <div className="flex">
            <DialogTitle id="tutorial-card-title">{"Welcome to Slidecross!"}</DialogTitle>
            <div className="grow"></div>
            <DialogActions>
                <IconButton onClick={handleClose} color="primary" style={{ color: '#0D1821', }}>
                    <CloseIcon />
                </IconButton>
            </DialogActions>
        </div>
        <DialogContent>
            <DialogContentText id="tutorial-card-description" color={'#0D1821'}>
                <Card raised={true}>
                    <CardContent>
                        <div className="flex">
                            <div className="grow"></div>
                            <video src="/slide_mini_tut.mp4" autoPlay loop muted playsInline className="w-1/2 rounded-xl" />
                            <div className="grow"></div>

                        </div>
                        <div className="h-3"></div>
                        <div className="w-full text-center">

                            <span >Slide letters to solve clues! Sounds easy enough, right?</span>
                        </div>
                    </CardContent>
                </Card>
                <div className="h-5"></div>
                <Card raised={true}>
                    <CardContent>
                        <div className="flex">
                            <div className="grow"></div>
                            <Button onClick={handleSkipFullTutorial}>Let me play!</Button>
                            <div className="w-5"></div>
                            <Button onClick={handleGoFullTutorial} variant="contained">Full tutorial</Button>
                            <div className="grow"></div>

                        </div>

                    </CardContent>
                </Card>

            </DialogContentText>
        </DialogContent>
    </Dialog>;
};
