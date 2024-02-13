const { default: parse } = require('@dylanarmstrong/puz');
const fs = require('fs');


import('../src/game/utils.js').then(async module => {
    const {nanoid} = await import('nanoid')    

    const { parseBoardString, createFakeCellGrid, getHorizontalConveyors, getVerticalConveyors } = module;

    const filePath = './scripts/input.puz';
    const fileData = fs.readFileSync(filePath);
    const data = new Uint8Array(fileData);

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

        console.log(c.map(cell => cell.letter).join(''), clue)

        acrossClues.push(clue)
    }

    for (const c of verticalConveyors) {
        const firstCell = c[0]

        const pairCell = puz.grid[firstCell.j][firstCell.i]

        const clue = pairCell.down.clue

        console.log(c.map(cell => cell.letter).join(''), clue)


        downClues.push(clue)
    }



    console.log(JSON.stringify({
        id: nanoid(),
        boardDataStr: solutionShaped,
        clues: {
            across: acrossClues,
            down: downClues
        }
    }))



})
