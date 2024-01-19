import React from "react"

export function parseBoardString(str) {
    const rowStrs = str.replace(/ /g, '').split('\n')

    const rows = []
    for (const rowStr of rowStrs) {
        if (rowStr.length === 0) continue

        const row = []
        for (const letter of rowStr) {
            if (letter === '#') {
                row.push(null)
            } else {
                row.push(letter)
            }
        }
        rows.push(row)
    }

    return rows
}

export function createFakeCellGrid(grid) {
    const fakeGrid = []

    for (let j = 0; j < grid.length; j++) {
        const row = []
        for (let i = 0; i < grid[0].length; i++) {
            const cell = {
                letter: grid[j][i],
                i,
                j
            }
            row.push(cell)
        }
        fakeGrid.push(row)
    }

    return fakeGrid
}

// returns array of horizontal conveyor configs, including 
// row idx
// col start and end idx,
// array of letters
export function getHorizontalConveyors(boardData) {
    const n = boardData.length
    const conveyors = []
    for (let j = 0; j < n; j++) {
        const row = boardData[j].map(c => c.letter)
        const rowCells = boardData[j]
        const handledIndicies = new Set()
        for (let i = 0; i < rowCells.length; i++) {
            if (!row[i] || handledIndicies.has(i)) continue // if null or handled by another conveyor, dont care about it

            // for each cell, search in either direction for either a wall or null
            let rightSearch = i
            while (row[rightSearch + 1]) {
                rightSearch++
            }

            // same for left
            let leftSearch = i
            while (row[leftSearch - 1]) {
                leftSearch--
            }

            if (Math.abs(rightSearch - leftSearch) === 0) continue //ignore conveyors of size one

            // add indicies of this conveyor to handled indicies for this column
            for (let k = leftSearch; k <= rightSearch; k++) {
                handledIndicies.add(k)
            }

            conveyors.push(rowCells.slice(leftSearch, rightSearch + 1))
        }
    }

    return conveyors
}

export function getVerticalConveyors(boardData) {
    const n = boardData.length
    const conveyors = []
    for (let i = 0; i < boardData[0].length; i++) {
        // build column into single array
        const columnCells = []

        for (let k = 0; k < n; k++) {
            columnCells.push(boardData[k][i])
        }
        const column = columnCells.map(c => c.letter)

        const handledIndicies = new Set()
        for (let j = 0; j < columnCells.length; j++) {
            if (!column[j] || handledIndicies.has(j)) continue // if null or handled by another conveyor, dont care about it

            // for each cell, search in either direction for either a wall or null
            let downSearch = j
            while (column[downSearch + 1]) {
                downSearch++
            }

            let upSearch = j
            while (column[upSearch - 1]) {
                upSearch--
            }

            if (Math.abs(downSearch - upSearch) === 0) continue //ignore conveyors of size one

            // add indicies of this conveyor to handled indicies for this row
            for (let k = upSearch; k <= downSearch; k++) {
                handledIndicies.add(k)
            }

            conveyors.push(columnCells.slice(upSearch, downSearch + 1))
        }
    }

    //hacky bullshit inbound
    // sort conveyors so that they are ordered like down clues in the NYT
    conveyors.sort((a, b) => a[0].j - b[0].j || a[0].i - b[0].i)

    return conveyors
}

export function arrayRotate(arr, reverse) {
    if (reverse) arr.unshift(arr.pop());
    else arr.push(arr.shift());
    return arr;
}

export function rotateCells(cells, reverse) {
    // just need to rotate the letters of the cells
    const letters = cells.map(c => c.letter)

    arrayRotate(letters, reverse)

    for (let i = 0; i < cells.length; i++) {
        cells[i].letter = letters[i]
    }
}

//https://stackoverflow.com/a/2450976
export function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex !== 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

export function scrambleBoard(boardData) {
    // get null indices and letters
    const n = boardData.length
    const nullIndicies = []
    let letters = []
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (!boardData[j][i]) {
                nullIndicies.push([i, j])
            } else {
                letters.push(boardData[j][i])
            }
        }
    }

    letters = shuffle(letters)

    const newBoard = []
    for (let j = 0; j < n; j++) {
        const row = []
        for (let i = 0; i < n; i++) {
            if (nullIndicies.find(n => n[0] === i && n[1] === j)) {
                row.push(null)
            } else {
                row.push(letters.pop())
            }
        }
        newBoard.push(row)
    }

    return newBoard
}

export function boardStateToStr(state) {
    const strArray = state.map(row => row.map(l => l === null ? '#' : l).join(''))
    const str = strArray.join('\n')

    return str
}

function generateSVGFromGrid(grid) {
    const collapsedGrid = grid.reduce((acc, row) => {
        return acc.concat([...row]);
    }, []);

    let allCorrect = true;

    for (const cell of collapsedGrid) {
        if (cell.letter && !cell.correct) {
            allCorrect = false;
            break;
        }
    }

    const svgCells = []

    const cellWidth = 8
    const cellWidthWithMargin = 9.5

    const allCorrectFill = '#F7B32B'

    for (const cell of collapsedGrid) {
        let fill = '#0D1821'

        if (cell.letter) {
            if (allCorrect) {
                fill = allCorrectFill
            } else if (cell.correct) {
                fill = '#8bd69e'
            } else {
                fill = '#F0F4EF'
            }
        }


        const svgCell = <g key={`${cell.i}-${cell.j}-rect`}>
            <rect
                x={cell.i * cellWidthWithMargin + 1}
                y={cell.j * cellWidthWithMargin + 1}
                width={cellWidth}
                height={cellWidth}
                fill={fill}
                stroke={allCorrect ? allCorrectFill : cell.correct ? '#8bd69e' : '#F0F4EF'}
                strokeWidth={.75}
            />
        </g>

        svgCells.push(svgCell)
    }

    const svgWidth = cellWidthWithMargin * grid.length + 1;
    const svgHeight = cellWidthWithMargin * grid[0].length + 1;

    const correctCenterSquare = <g key="center-square">
        <rect
            x={svgWidth / 2 - cellWidth * 1.5}
            y={svgHeight / 2 - cellWidth * 1.5}
            width={cellWidth * 3}
            height={cellWidth * 3}
            fill={"#B38937"}
            stroke={"#B38937"}
            strokeWidth={.75}
        />
    </g>



    let starPath = ""

    const numPoints = 5
    for (let i = 0; i < (numPoints * 2); i++) {
        const angle = Math.PI*2 / (numPoints*2) * i - Math.PI/2
        const isEven = i % 2 === 0
        const radius = isEven ? cellWidth * 1.5 : cellWidth * .6
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius

        if (i === 0) {
            starPath += `M ${x} ${y} `
        } else {
            starPath += `L ${x} ${y} `
        }
    }

    const correctCenterStar = <g key="center-square">
        <path
            transform={`translate(${svgWidth / 2}, ${svgHeight / 2}) scale(0.75)`}
            d={starPath}
            fill={"#F0F4EF"}
            stroke={"#F0F4EF"}
            strokeWidth={.75}
        />
    </g>

    if (allCorrect) {
        svgCells.push(correctCenterSquare, correctCenterStar)
    }

    return <svg style={{ width: svgWidth + 'px', height: svgHeight + 'px', margin: 'auto', display: 'block' }}>
        {svgCells}
    </svg>
}

export function generateBoardAsciiArt(puzzle, boardStateStr) {

    // return ''
    if (!boardStateStr) {
        const boardState = parseBoardString(puzzle.boardDataStr);
        const fakeCellGrid = createFakeCellGrid(boardState);

        return generateSVGFromGrid(fakeCellGrid);
    }

    const boardState = parseBoardString(boardStateStr);
    const fakeCellGrid = createFakeCellGrid(boardState);
    const horizontalConveyors = getHorizontalConveyors(fakeCellGrid);
    const verticalConveyors = getVerticalConveyors(fakeCellGrid);

    const answerGrid = parseBoardString(puzzle.boardDataStr);
    const answerGridCells = createFakeCellGrid(answerGrid);
    const answerHorizontalConveyors = getHorizontalConveyors(answerGridCells);
    const answerVerticalConveyors = getVerticalConveyors(answerGridCells);

    for (let i = 0; i < horizontalConveyors.length; i++) {
        const conveyor = horizontalConveyors[i];
        const answerConveyor = answerHorizontalConveyors[i];

        let correct = true;
        for (let j = 0; j < conveyor.length; j++) {
            const cell = conveyor[j];
            const answerCell = answerConveyor[j];

            if (cell.letter !== answerCell.letter) {
                correct = false;
                break;
            }
        }

        conveyor.correct = correct;
    }

    for (let i = 0; i < verticalConveyors.length; i++) {
        const conveyor = verticalConveyors[i];
        const answerConveyor = answerVerticalConveyors[i];

        let correct = true;
        for (let j = 0; j < conveyor.length; j++) {
            const cell = conveyor[j];
            const answerCell = answerConveyor[j];

            if (cell.letter !== answerCell.letter) {
                correct = false;
                break;
            }
        }

        conveyor.correct = correct;
    }

    for (const conveyor of [...horizontalConveyors, ...verticalConveyors]) {
        if (conveyor.correct) {
            for (const cell of conveyor) {
                cell.correct = true;
            }
        }
    }


    return generateSVGFromGrid(fakeCellGrid);



    ;
}

