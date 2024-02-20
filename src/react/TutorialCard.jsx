import React from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Card, CardContent } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import useMediaQuery from '@mui/material/useMediaQuery';
import Slide from '@mui/material/Slide';
import { useTheme } from '@mui/material/styles';
import LazyLoad from 'react-lazy-load';


const LazyLoadedVideo = ({ src }) => {
  return <LazyLoad offset={150}>
    <video src={src} autoPlay loop muted playsInline className="w-full rounded-xl" />
  </LazyLoad>
}

const Transition = React.forwardRef(function Transition(
  props,
  ref,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const TutorialCard = ({ open, handleClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const transitionProps = {}

  if (fullScreen) {
    transitionProps.TransitionComponent = Transition;
  }

  return <Dialog
    open={open}
    onClose={handleClose}
    aria-labelledby="tutorial-card-title"
    aria-describedby="tutorial-card-description"
    maxWidth="sm"
    fullWidth={true}
    fullScreen={fullScreen}
    {...transitionProps}
  >
    <div className="flex">
      <DialogTitle id="tutorial-card-title">{"How to Play"}</DialogTitle>
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
            <span className="">Dragging a letter left or right will shift the entire row in that direction.</span>
            <div className="h-3"></div>
            <LazyLoadedVideo src="/slide_tut_1.mp4" />
          </CardContent>
        </Card>
        <br />
        {/* <Card raised={true}>
          <CardContent>
            Same thing for columns.
            <br />
            Dragging a letter up or down will shift the entire column in that direction.
            <div className="h-3"></div>
            <LazyLoadedVideo src="/slide_tut_2.mp4"/>
            <div className="h-3"></div>

            <span className=" italic">Note that a letter which goes beyond the edge of the board wraps around to the other side.</span>
          </CardContent>
        </Card> */}

        <br />
        <br />
        <Card raised={true}>
          <CardContent>
            <span className="">The goal of SlideCross is to arrange tiles so that all of the crossword clues are satisfied. Answers that are correct will be highlighted in green.</span>
            <div className="h-3"></div>

            <img src="/slide_tut_right_wrogn.png" alt="" className="w-full" />
          </CardContent>
        </Card>


        {/* <br />
        <br />
        <Card raised={true}>
          <CardContent>
            <span className="">To see a clue, click a letter. </span>
            <br />
            <div className="h-3"></div>

            <LazyLoadedVideo src="/slide_tut_show_clue.mp4"/>
          </CardContent>
        </Card> */}


        <br />
        <br />
        <Card raised={true}>
          <CardContent>
            <span className="">Notice the clue at the bottom: "Color of the sky".</span>
            <br />
            <span className="">The answer is, of course, BLUE.</span>
            <br />
            <span className="">Slide letters to get BLUE into the highlighted spot.</span>

            <div className="h-3"></div>

            <LazyLoadedVideo src="/slide_tut_solve_blue.mp4"/>
          </CardContent>
        </Card>
        <br />
        <br />
        <Card raised={true}>
          <CardContent>
            <span className="">Now that we've solved the first word, lets look at the clue for the next one. For this, we can use the arrows in the clue area.</span>
            <div className="h-3"></div>

            <LazyLoadedVideo src="/slide_tut_next_clue.mp4"/>
          </CardContent>
        </Card>
        <br />
        <br />
        <Card raised={true}>
          <CardContent>
            <span className="">Much like a Rubik's Cube, we want to solve this next word without messing up the previous one.</span>
            <br />
            <br />
            <span className="italic">This is where the challenge comes in.</span>
            <br />
            <br />
            <span className="">The next clue is "Remove from office" which is OUST. Let's start with the first letter, "O".</span>
            <div className="h-3"></div>

            <LazyLoadedVideo src="/slide_tut_basic_swap.mp4"/>
            <div className="h-3"></div>
            <span className="">We move the column down, swap the "U" for the "O" that we want, and finally return the column back up.</span>

          </CardContent>
        </Card>
        <br />
        <br />
        <Card raised={true}>
          <CardContent>
            <span className="">Using that same idea, let's solve the rest of OUST.</span>

            <div className="h-3"></div>

            <LazyLoadedVideo src="/slide_tut_solve_oust.mp4"/>
            <div className="h-3"></div>
            <span className="">We've now solved OUST without messing up BLUE. Yay!</span>

          </CardContent>
        </Card>
        <br />
        <br />
        <Card raised={true}>
          <CardContent>
            <span className="">The next clue is "Nothing, in Mexico", which is NADA.</span>

            <div className="h-3"></div>

            <LazyLoadedVideo src="/slide_tut_solve_nada.mp4"/>
            <div className="h-3"></div>

          </CardContent>
        </Card>
        <br />
        <br />
        <Card raised={true}>
          <CardContent>
            {/* <span className="">Now, we come again to a tricky part. The final across clue is "Citizenship descriptor", which has the answer DUAL. Get it, like Dual Citizenship? ANYWAY... notice in the clip below how we want to play the endgame. It's tricky, just like the end of a Rubik's cube where you're like "oh nooo how am I gonna do this without messing anything uppppp." Don't worry about it, alright? Just learn the algorithm and you'll be finee.  </span>
            <br/>
            <br/>
            <span className="">Ok so the algorithm, yes yes the algorithm. Basically what you wanna do here is find a duplicate of a letter you have in your final word. This duplicate should be of a letter which is in an incorrect position. Here we find the "U" of OUST as a duplicate of the "U" of DUAL. Let's put OUST's "U" in the spot we want it in DUAL, then replace it. So on and so forth for the remaining letters, see clip below. </span> */}
            <span className="">The final across clue is "Citizenship descriptor", which has the answer DUAL. Watch closely here how to play the endgame. You'll want to look for a duplicate of the letter which is incorrect and swap it in. </span>

            <div className="h-3"></div>

            <LazyLoadedVideo src="/slide_tut_endgame.mp4"/>
            <div className="h-3"></div>

          </CardContent>
        </Card>
      </DialogContentText>
    </DialogContent>
  </Dialog>;
};
