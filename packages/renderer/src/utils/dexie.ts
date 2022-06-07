import Dexie from 'dexie'

const database = new Dexie('db')

database.version(1).stores({
   history: '++id, fileName', // Primary key and indexed props
})

export {
   database
}