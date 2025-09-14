import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import { join } from 'path'
import sharp from 'sharp'
import BadRequestError from '../errors/bad-request-error'

const MIN_FILE_SIZE = 2 * 1024

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }

    if (req.file.size < MIN_FILE_SIZE) {
        return next(new BadRequestError('Слишком маленький файл'))
    }

    try {
        await sharp(req.file.path).metadata()
    } catch (error) {
        return next(new BadRequestError('Неверный формат изображения'))
    }

    try {
        const fileName = process.env.UPLOAD_PATH
            ? join('/', process.env.UPLOAD_PATH, req.file.filename)
            : join('/', req.file.filename)

        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName: req.file.filename,
        })
    } catch (error) {
        return next(error)
    }
}

export default {}
