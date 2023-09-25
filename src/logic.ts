import { Request, Response } from 'express'
import { Movie, MovieCreate } from './interfaces'
import { client } from './database'

const insertMovie = async (req: Request, res: Response): Promise<void> => {
    try {
        const payload: MovieCreate = req.body
        const { name, category, duration, price } = payload
        const insertQuery = 'INSERT INTO movies (name, category, duration, price) VALUES ($1, $2, $3, $4) RETURNING *'
        const result = await client.query<Movie>(insertQuery, [name, category, duration, price])
        const insertedMovie: Movie = result.rows[0]
        res.status(201).json(insertedMovie)
    } catch (message) {
        res.status(500).json({ message: 'Erro ao inserir o filme' })
    }
}

const getAllMovies = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category } = req.query

        let selectQuery: string
        let queryParams: string[] = []

        if (category && typeof category === 'string') {
            selectQuery = 'SELECT * FROM movies WHERE category = $1'
            queryParams = [category]
        } else {
            selectQuery = 'SELECT * FROM movies'
        }
        const result = await client.query<Movie>(selectQuery, queryParams)
        const movies: Movie[] = result.rows
        if (movies.length === 0 && category) {
            const allMoviesQuery = 'SELECT * FROM movies'
            const allMoviesResult = await client.query<Movie>(allMoviesQuery)
            const allMovies: Movie[] = allMoviesResult.rows
            res.status(200).json(allMovies)
        } else {
            res.status(200).json(movies)
        }
    } catch (error) {
        res.status(404).json({ message: 'Movie not found!' })
    }
}

const getMovieById = async (req: Request, res: Response): Promise<void> => {
    try {
        const movieId: number = parseInt(req.params.id, 10)

        const selectQuery = 'SELECT * FROM movies WHERE id = $1'
        const result = await client.query<Movie>(selectQuery, [movieId])
        const movie: Movie | undefined = result.rows[0]

        if (!movie) {
            res.status(404).json({ message: 'Movie not found!' })
            return
        }

        res.status(200).json(movie)
    } catch (error) {
        res.status(500).json({ message: 'Movie not found!' })
    }
}

const updateMovieById = async (req: Request, res: Response): Promise<void> => {
    try {
        const movieId: number = parseInt(req.params.id, 10)
        const payload: MovieCreate = req.body

        const updateColumns: string[] = []
        const updateValues = []

        if (payload.name) {
            updateColumns.push('name')
            updateValues.push(payload.name)
        }
        if (payload.category) {
            updateColumns.push('category')
            updateValues.push(payload.category)
        }
        if (payload.duration) {
            updateColumns.push('duration')
            updateValues.push(payload.duration)
        }
        if (payload.price) {
            updateColumns.push('price')
            updateValues.push(payload.price)
        }

        if (updateColumns.length === 0) {
            res.status(400).json({ message: 'Nenhum campo para atualização fornecido' })
            return
        }

        const updateQuery =
            `UPDATE movies SET ${updateColumns.map((col, index) => `${col} = $${index + 1}`).join(', ')}
            WHERE id = $${updateColumns.length + 1}`

        const queryParams = [...updateValues, movieId]
        await client.query(updateQuery, queryParams)

        const updatedMovieQuery = 'SELECT * FROM movies WHERE id = $1'
        const updatedResult = await client.query<Movie>(updatedMovieQuery, [movieId])
        const updatedMovie: Movie = updatedResult.rows[0]

        res.status(200).json(updatedMovie)
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar o filme' })
    }
}


const deleteMovieById = async (req: Request, res: Response): Promise<void> => {
    try {
        const movieId: number = parseInt(req.params.id, 10)

        const deleteQuery = 'DELETE FROM movies WHERE id = $1'
        await client.query(deleteQuery, [movieId])

        res.status(204).send()
    } catch (error) {
        res.status(500).json({ message: 'Movie not found!' })
    }
}

export { getAllMovies, insertMovie, getMovieById, updateMovieById, deleteMovieById }
