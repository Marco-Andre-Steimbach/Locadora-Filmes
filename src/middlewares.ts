import { Request, Response, NextFunction } from 'express'
import { Movie, MovieCreate } from './interfaces'
import { client } from './database'

const checkMovieExists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const movieId: number = parseInt(req.params.id, 10)

    const selectQuery = 'SELECT * FROM movies WHERE id = $1'
    const result = await client.query<Movie>(selectQuery, [movieId])
    const movie: Movie | undefined = result.rows[0]

    if (!movie) {
        res.status(404).json({ message: 'Movie not found!' })
        return
    }

    next()
}

const verifyNameExists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const payload: MovieCreate = req.body
    const { name } = payload

    const selectQuery = 'SELECT * FROM movies WHERE name = $1'
    const result = await client.query(selectQuery, [name])
    const existingMovie = result.rows[0]

    if (existingMovie) {
        res.status(409).json({ message: 'Movie already registered.' })
        return
    }

    next()
}

export { checkMovieExists, verifyNameExists }