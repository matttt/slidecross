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
        for (let i = 0; i < n; i++) {
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
    for (let i = 0; i < n; i++) {
        // build column into single array
        const columnCells = []

        for (let k = 0; k < n; k++) {
            columnCells.push(boardData[k][i])
        }
        const column = columnCells.map(c => c.letter)

        const handledIndicies = new Set()
        for (let j = 0; j < n; j++) {
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

    return conveyors
}

export function arrayRotate(arr, reverse) {
    if (reverse) arr.unshift(arr.pop());
    else arr.push(arr.shift());
    return arr;
}

export function rotateCells(cells, reverse) {
    // just need to rotate the indices of the cells
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

