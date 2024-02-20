import React, { useEffect } from "react";
import { Dialog, DialogContent, Card, CardContent, Backdrop } from '@mui/material';
import Button from '@mui/material/Button';
import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from 'react-confetti'
import { sample } from 'underscore';
import { puzzles } from '../game/puzzles.js'; 
import { useNavigate } from "react-router-dom";


function getNextPuzzleCategoryAndId(curPuzzleId) {
    const puzzleCategories = Object.keys(puzzles);
    
    const allIds = []
    const idCategories = [] // for each id, the category it belongs to

    for (const category of puzzleCategories) {
        allIds.push(...puzzles[category].map(p => p.id))
        idCategories.push(...puzzles[category].map(p => category))
    }

    let currentIdx = allIds.indexOf(curPuzzleId);
    const startIdx = currentIdx;

    if (currentIdx === -1) {
        return allIds[0]
    }

    const testNext = () => {
        currentIdx = (currentIdx + 1) % allIds.length;

        if (currentIdx === startIdx) {
            return null;
        }

        const testId = allIds[currentIdx];
        const testCategory = idCategories[currentIdx];

        const meta = JSON.parse(localStorage.getItem(testId + '_meta'));
        const state = localStorage.getItem(testId);
        const correctState = puzzles[testCategory].find(p => p.id === testId).boardDataStr
        
        const currentlyCorrect = state?.trim() === correctState?.trim() && !!state && !!correctState;

        if (!meta?.hasBeenCorrect && !currentlyCorrect) {
            return [testCategory, testId];
        } else {
            return testNext();
        }
    }


    return testNext();    
}

const congratulationsMessages = [
    "Brilliantly done!",
    "Puzzle mastered!",
    "Victory is yours!",
    "Simply genius!",
    "Challenge conquered!",
    "You triumphed!",
    "Puzzle perfection!",
    "Winning streak!",
    "Unstoppable!",
    "Skillfully solved!",
    "Masterful win!",
    "Remarkable skill!",
    "Top-notch!",
    "You did it!",
    "Champion move!"
];

//from https://stackoverflow.com/a/7579799
function seconds2time(secondsInput) {
    var hours = Math.floor(secondsInput / 3600);
    var minutes = Math.floor((secondsInput - (hours * 3600)) / 60);
    var seconds = secondsInput - (hours * 3600) - (minutes * 60);
    var time = "";

    if (hours !== 0) {
        time = hours + ":";
    }
    if (minutes !== 0 || time !== "") {
        minutes = (minutes < 10 && time !== "") ? "0" + minutes : String(minutes);
        time += minutes + ":";
    }
    if (time === "") {
        time = seconds + "s";
    }
    else {
        time += (seconds < 10) ? "0" + seconds : String(seconds);
    }
    return time;
}

export const PuzzleWinCard = ({ open, puzzleId, handleClose }) => {

    const { width, height } = useWindowSize()
    const meta = JSON.parse(localStorage.getItem(puzzleId + '_meta'));
    const numSeconds = meta?.elapsedTime || 0;

    const next = getNextPuzzleCategoryAndId(puzzleId);

    const navigate = useNavigate();

    const handleClickNext = () => {
        if (next) {
            const [category, id] = next;
            navigate(`/puzzles/${category}/${id}`);
            handleClose()
        }
    }

    const [congrats, setCongrats] = React.useState('null');

    useEffect(() => {
        setCongrats(sample(congratulationsMessages));
    }, [puzzleId])

    const ConfettiDrop = () => <Backdrop open={open} onClick={handleClose}><Confetti
        width={width}
        height={height}
        recycle={false}
    /></Backdrop>

    return <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="wind-card-title"
        aria-describedby="wind-card-description"
        maxWidth="sm"
        fullWidth={true}
        slots={{ backdrop: ConfettiDrop }}
    >

       
        <DialogContent>
            {/* <DialogContentText id="wind-card-description" color={'#0D1821'}> */}
                <Card raised={true}>
                    <CardContent>

                        <div className="flex">
                            <div className="grow"></div>
                            <span className="text-[100px]">🎉</span>
                            <div className="grow"></div>

                        </div>

                        <div className="flex">
                            <div className="grow"></div>
                            <span className="text-2xl">{congrats}</span>
                            <div className="grow"></div>

                        </div>

                        <div className="flex">
                            <div className="grow"></div>
                            <span className="text-l">Solved in {seconds2time(numSeconds)}</span>
                            <div className="grow"></div>

                        </div>
                    </CardContent>
                </Card>
                <div className="h-5"></div>
                <Card raised={true}>
                    <CardContent>
                        <div className="flex">
                            <div className="grow"></div>
                            <Button onClick={handleClose}>Close</Button>
                            <div className="w-5"></div>
                            <Button onClick={handleClickNext} variant="contained">Play Next!</Button>
                            <div className="grow"></div>

                        </div>

                    </CardContent>
                </Card>

            {/* </DialogContentText> */}
        </DialogContent>
    </Dialog>;
};
