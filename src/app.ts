import express, { Application } from 'express'
import { insertMovie, getAllMovies, getMovieById, updateMovieById, deleteMovieById } from './logic'
import { startDatabase } from './database'
import { checkMovieExists, verifyNameExists } from './middlewares'

const app: Application = express()
app.use(express.json())
const PORT: number = 3000

app.post('/movies', verifyNameExists, insertMovie)
app.get('/movies', getAllMovies)
app.get('/movies/:id', getMovieById)
app.patch('/movies/:id', checkMovieExists, verifyNameExists, updateMovieById)
app.delete('/movies/:id', checkMovieExists, deleteMovieById)

app.listen(PORT, async () => {
    await startDatabase()
    console.log(`Servidor Rodando em http://localhost:${PORT}`)
})