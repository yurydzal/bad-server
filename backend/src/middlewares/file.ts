import { Request, Express } from 'express'
import multer, { FileFilterCallback } from 'multer'
import { join, extname } from 'path'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import BadRequestError from '../errors/bad-request-error'

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

const storage = multer.diskStorage({
    destination: (
        _req: Request,
        _file: Express.Multer.File,
        cb: DestinationCallback
    ) => {
        const base = join(__dirname, '..', 'public')
        const dest = process.env.UPLOAD_PATH_TEMP
            ? join(base, process.env.UPLOAD_PATH_TEMP)
            : base

        try {
            fs.mkdirSync(dest, { recursive: true })
        } catch (err) {
            return cb(err as Error, dest)
        }

        cb(null, dest)
    },

    filename: (
        _req: Request,
        file: Express.Multer.File,
        cb: FileNameCallback
    ) => {
        const fileName = `${uuidv4()}${extname(file.originalname)}`
        cb(null, fileName)
    },
})

const types = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/gif',
    'image/svg+xml',
]

const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    if (!types.includes(file.mimetype)) {
        return cb(new BadRequestError('Неверный тип файла'))
    }
    return cb(null, true)
}

export default multer({
    storage,
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 10, files: 1 },
})
