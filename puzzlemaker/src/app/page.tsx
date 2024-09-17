"use client";

import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { FileUploader } from "react-drag-drop-files";
const { default: parse } = require('@dylanarmstrong/puz');


const fileTypes = ["PUZ", "puz"];


import { parseBoardString, getHorizontalConveyors, getVerticalConveyors, createFakeCellGrid } from '../../../src/game/utils'
import { Dir } from "fs";

enum Direction {
  Across = 'across',
  Down = 'down'
}

type Clues = {
  across: string[],
  down: string[]
}


export default function Home() {

  const [squareSize, setSquareSize] = useState(0);
  const [puzzleShape, setPuzzleShape] = useState('');

  const [clues, setClues] = useState<Clues>({ across: [], down: [] })

  const [file, setFile] = useState(null);
  const handleFileDrop = (file: any) => {
    file.arrayBuffer().then((buff: any) => {
      const data = new Uint8Array(buff); // x is your uInt8Array

      const puz = parse(data);
      // console.log(String.fromCharCode(...puz.solution))

      let solutionRaw = String.fromCharCode(...puz.solution);
      let solutionShaped = ""

      while (solutionRaw.length > 0) {
        let row = solutionRaw.slice(0, puz.header.width[0]);
        solutionRaw = solutionRaw.slice(puz.header.width[0]);

        solutionShaped += row + "\n";
      }
      // console.log(solutionShaped)

      const boardState = parseBoardString(solutionShaped);
      const fakeCellGrid = createFakeCellGrid(boardState);
      const horizontalConveyors = getHorizontalConveyors(fakeCellGrid);
      const verticalConveyors = getVerticalConveyors(fakeCellGrid);

      const acrossClues = []
      const downClues = []

      for (const c of horizontalConveyors) {
        const firstCell = c[0]
        const pairCell = puz.grid[firstCell.j][firstCell.i]
        const clue = pairCell.across.clue


        acrossClues.push(clue)
      }

      for (const c of verticalConveyors) {
        const firstCell = c[0]
        const pairCell = puz.grid[firstCell.j][firstCell.i]
        const clue = pairCell.down.clue


        downClues.push(clue)
      }



      setPuzzleShape(solutionShaped);
      setClues({
        across: acrossClues,
        down: downClues
      })

    });
    setFile(file);
  };

  const parsedPuzzleShape = puzzleShape.length > 0 ? parseBoardString(puzzleShape) : [[null]];
  const fakeCellGrid = createFakeCellGrid(parsedPuzzleShape);

  const horizontalConveyors = getHorizontalConveyors(fakeCellGrid);
  const verticalConveyors = getVerticalConveyors(fakeCellGrid);

  const rows = parsedPuzzleShape.length;
  const cols = parsedPuzzleShape[0].length;

  const handlePuzzleShapeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.toUpperCase();

    const filteredVal = val.split('').filter((char) => /[A-Z#\n]/.test(char)).join('');

    setPuzzleShape(filteredVal);
  }

  const handleClueChange = (dir: Direction, idx: number) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;

      const newClues = { ...clues };
      newClues[dir][idx] = val;
      setClues(newClues);
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(puzzleJSON)
      .then(() => {
        // Handle successful copy to clipboard here, like showing a notification
        // console.log('Puzzle JSON copied to clipboard');
      })
      .catch(err => {
        // Handle errors here
        // console.error('Failed to copy puzzle JSON', err);
      });
  };

  //   {
  //     "boardDataStr": "#CIG#\nKOALA\nMEMES\nTUBAS\n#RSN#\n",
  //     "clues": {
  //         "across": [
  //             "You might bum one",
  //             "Marsupials that only eat poison",
  //             "Online jokes for Gen Z",
  //             "Big brasses",
  //             "Where you might watch the MLB, NBA, or NHL"
  //         ],
  //         "down": [
  //             "Sacré ___",
  //             "Shakespeare wrote in them",
  //             "Gather or learn (information)",
  //             "British text slang for annoyance",
  //             "They can either kick or get kicked"
  //         ]
  //     },
  //     "id": "8VOGsm_hC42vZISzZzTn0",
  //     "author": "Alex Tuchi"
  // },

  const generatePuzzleJson = () => {
    const puzzleJson = {
      id: nanoid(),
      boardDataStr: puzzleShape,
      clues: clues,
    }

    return JSON.stringify(puzzleJson, null, 2);
  }

  const puzzleJSON = generatePuzzleJson();




  useEffect(() => {
    // Update the square size to be half of the viewport height
    const updateSize = () => {
      setSquareSize(window.innerHeight / 2);
    };

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const margin = 8
  const mSquareSize = squareSize - (margin * 2);
  const tileSize = mSquareSize / Math.max(rows, cols);

  return (
    <div className="flex h-screen text-black">
      <div className="flex flex-col mr-4">
        <FileUploader handleChange={handleFileDrop} name="file" types={fileTypes} />
        {/* First box on the top-left */}
        <div style={{ height: squareSize, width: squareSize, display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="border-2 border-black-1000 mb-4">
          <svg style={{ height: mSquareSize, width: mSquareSize, margin: 'auto', display: 'block' }}>
            {/* Grid of 3x3 rectangles */}
            {Array.from({ length: rows }, (_, row) => (
              <g key={'row-' + row}>
                {Array.from({ length: cols }, (_, col) => (
                  <g key={`${row}-${col}-rect`}>
                    <rect
                      x={col * tileSize + 2}
                      y={row * tileSize + 2}
                      width={Math.abs(tileSize * 0.95)}
                      height={Math.abs(tileSize * 0.95)}
                      fill={parsedPuzzleShape[row][col] ? 'white' : 'black'}
                      stroke="black"
                    />

                    {parsedPuzzleShape[row][col] && (
                      <text
                        key={`${row}-${col}-text`}
                        x={col * tileSize + tileSize / 2 + 2}
                        y={row * tileSize + tileSize / 2 + 2}
                        fontSize={tileSize / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {parsedPuzzleShape[row][col]}
                      </text>
                    )}

                  </g>
                ))}
              </g>
            ))}
          </svg>
        </div>

        {/* Second box on the bottom-left */}
        <div style={{ height: squareSize, width: squareSize }} className="border-2 border-black-1000">
          <textarea placeholder="type puzzle solution and shape text here!" className="w-full h-full font-mono p-3" value={puzzleShape} onChange={handlePuzzleShapeChange}></textarea>
        </div>
      </div>

      {/* Third box in the middle */}
      <div className="flex-1 border-2 border-black-1000 overflow-y-scroll p-5">
        <h1 className="pb-5">Across</h1>
        {horizontalConveyors.map((conveyor, i) => (
          <div className="flex mb-5" key={JSON.stringify(conveyor)}>
            {conveyor.map((cell: any) => (
              <div className="flex flex-col" key={JSON.stringify(cell)}>

                <div className="flex-grow border-2 border-black-1000 p-1">
                  {cell.letter}
                </div>
              </div>

            ))}
            <input type="text" value={clues.across[i]} onChange={handleClueChange(Direction.Across, i)} className="flex-grow border-2 border-black-1000" />

          </div>
        ))}



        <hr />
        <h2 className="pt-5 pb-5">Down</h2>
        {verticalConveyors.map((conveyor, i) => (
          <div className="flex mb-5" key={JSON.stringify(conveyor)}>
            {conveyor.map((cell: any) => (
              <div className="flex flex-col" key={JSON.stringify(cell)}>

                <div className="flex-grow border-2 border-black-1000 p-1">
                  {cell.letter}
                </div>
              </div>

            ))}
            <input type="text" value={clues.down[i]} onChange={handleClueChange(Direction.Down, i)} className="flex-grow border-2 border-black-1000" />

          </div>
        ))}

      </div>

      {/* Fourth box on the right */}
      <div className="flex-1 border-2 border-black-1000 overflow-y-scroll p-5">
        <button onClick={copyToClipboard} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 fixed right-5">Copy JSON</button>
        <pre className="mt-5 w-full">{puzzleJSON}</pre>
      </div>
    </div>
  )
}