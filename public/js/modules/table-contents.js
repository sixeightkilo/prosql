import { Err } from './error.js'
import { Utils } from './utils.js'
import { DbUtils } from './dbutils.js'
import { Constants } from './constants.js'

const OPERATORS = [
    ['operator', '='],
    ['operator', '<>'],
    ['operator', '>'],
    ['operator', '<'],
    ['operator', '>='],
    ['operator', '<='],
    ['operator', 'IN'],
    ['operator', 'LIKE'],
    ['operator', 'BETWEEN'],
    ['operator', 'IS NULL'],
    ['operator', 'IS NOT NULL'],
]

class TableContents {
    constructor() {
        this.init()
        this.$search.addEventListener('click', async () => {
            this.search()
        })
    }

    async search() {
        let query = `select * from \`${this.table}\` 
                         where \`${this.$columNames.value}\`
                         ${this.$operators.value}
                         ${this.$searchText.value}`
        let rows = await DbUtils.fetch(this.sessionId, encodeURIComponent(query))
        Utils.showResults(rows)
    }

    async show(table) {
        this.table = table
        console.log(`Displaying ${table}`)
        let columns = await DbUtils.fetchAll(this.sessionId, `show columns from \`${this.table}\``)
        console.log(columns)

        //update the column name selector
        Utils.setOptions(this.$columNames, columns, '')

        //show BATCH_SIZE rows from table
        let rows = await DbUtils.fetch(this.sessionId, `select * from \`${this.table}\``)
        console.log(rows) 

        Utils.showResults(rows)
    }

    async init() {
        this.$columNames = document.getElementById('column-names')
        this.$operators = document.getElementById('operators')
        this.$searchText = document.getElementById('search-text')
        this.$search = document.getElementById('search')

        this.sessionId = Utils.getFromSession(Constants.SESSION_ID)
        console.log(this.sessionId)

        //update operators
        Utils.setOptions(this.$operators, OPERATORS, '')
    }
}

export { TableContents }
