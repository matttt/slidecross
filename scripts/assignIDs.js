const nn = import('nanoid')
const puzzles = require('./puzzles.js')
const fs = require('fs')

async function main() {
    const {nanoid} = await nn


    function assignIds(arr) {
        for (const puzzle of arr) {
            puzzle.id = nanoid()
        }

        return arr
    }

    const minisWithIds = assignIds(puzzles.minis)
    const biggiesWithIds = assignIds(puzzles.biggies)

    const puzzlesWithIds = {
        minis: minisWithIds,
        biggies: biggiesWithIds
    }

    const puzzlesWithIdsString = JSON.stringify(puzzlesWithIds, null, 2)
    const fileContent = `export const puzzles = ${puzzlesWithIdsString}`

    fs.writeFileSync(__dirname + '/puzzlesWithIds.js', fileContent)
}
main()






