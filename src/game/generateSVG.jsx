import { parseBoardString, createFakeCellGrid, getHorizontalConveyors, getVerticalConveyors } from "./utils";

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

    const svgCells = [];

    const cellWidth = 8;
    const cellWidthWithMargin = 9.5;

    const allCorrectFill = '#F7B32B';

    for (const cell of collapsedGrid) {
        let fill = '#0D1821';

        if (cell.letter) {
            if (allCorrect) {
                fill = allCorrectFill;
            } else if (cell.correct) {
                fill = '#8bd69e';
            } else {
                fill = '#F0F4EF';
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
                strokeWidth={0.75} />
        </g>;

        svgCells.push(svgCell);
    }

    const svgWidth = cellWidthWithMargin * grid[0].length + 1;
    const svgHeight = cellWidthWithMargin * grid.length + 1;

    const correctCenterSquare = <g key="center-square">
        <rect
            x={svgWidth / 2 - cellWidth * 1.5}
            y={svgHeight / 2 - cellWidth * 1.5}
            width={cellWidth * 3}
            height={cellWidth * 3}
            fill={"#B38937"}
            stroke={"#B38937"}
            strokeWidth={0.75} />
    </g>;



    let starPath = "";

    const numPoints = 5;
    for (let i = 0; i < (numPoints * 2); i++) {
        const angle = Math.PI * 2 / (numPoints * 2) * i - Math.PI / 2;
        const isEven = i % 2 === 0;
        const radius = isEven ? cellWidth * 1.5 : cellWidth * 0.6;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        if (i === 0) {
            starPath += `M ${x} ${y} `;
        } else {
            starPath += `L ${x} ${y} `;
        }
    }

    const correctCenterStar = <g key="center-star">
        <path
            transform={`translate(${svgWidth / 2}, ${svgHeight / 2}) scale(0.75)`}
            d={starPath}
            fill={"#F0F4EF"}
            stroke={"#F0F4EF"}
            strokeWidth={0.75} />
    </g>;

    if (allCorrect) {
        svgCells.push(correctCenterSquare, correctCenterStar);
    }

    return <svg style={{ width: svgWidth + 'px', height: svgHeight + 'px', margin: 'auto', display: 'block' }}>
        {svgCells}
    </svg>;
}

export function generateBoardAsciiArt(puzzle, boardStateStr) {

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
