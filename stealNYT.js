const https = require('https');
const fs = require('fs')
const path = require('path')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

let url = 'https://www.nytimes.com/svc/crosswords/v6/puzzle/mini.json';

if (argv.fromFile) {
    const filePath = path.join(__dirname, './puzzle.json')
    const fileData = fs.readFileSync(filePath, 'utf-8')
    const jsonData = JSON.parse(fileData)
    console.log(parse(jsonData))
} else {
    https.get(url, (response) => {
        let data = '';

        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            const jsonData = JSON.parse(data);
            console.log(parse(jsonData))
        });
    }).on('error', (error) => {
        console.error(`Error: ${error.message}`);
    });
}



function parse(data) {

    const board = data.body[0]
    // const {cells, clues, dimensions} = board


    const n = board.dimensions.width

    let boardDataStr = ''
    for (let i = 0; i < board.dimensions.height; i++) {
        let row = ''
        for (let j = 0; j < board.dimensions.width; j++) {
            const cell = board.cells[i * n + j]
            if (cell.answer) {
                row += cell.answer
            } else {
                row += '#'
            }
        }
        // console.log(row)
        boardDataStr += row + '\n'
    }

    const clues = {
        across: [],
        down: []
    }

    for (let i = 0; i < board.clues.length; i++) {

        const clue = board.clues[i]

        const dir = clue.direction.toLowerCase()
        const text = clue.text[0].plain

        clues[dir].push(text)

    }

    return { boardDataStr, clues }

}

module.exports = parse

