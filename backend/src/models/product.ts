import { unlink, promises } from 'fs'
import mongoose, { Document } from 'mongoose'
import { join } from 'path'

export interface IFile {
    fileName: string
    originalName: string
}

export interface IProduct extends Document {
    title: string
    image: IFile
    category: string
    description: string
    price: number
}

const cardsSchema = new mongoose.Schema<IProduct>(
    {
        title: {
            type: String,
            unique: true,
            required: [true, 'Поле "title" должно быть заполнено'],
            minlength: [2, 'Минимальная длина поля "title" - 2'],
            maxlength: [30, 'Максимальная длина поля "title" - 30'],
        },
        image: {
            fileName: {
                type: String,
                required: [true, 'Поле "image.fileName" должно быть заполнено'],
            },
            originalName: String,
        },
        category: {
            type: String,
            required: [true, 'Поле "category" должно быть заполнено'],
        },
        description: {
            type: String,
        },
        price: {
            type: Number,
            default: null,
        },
    },
    { versionKey: false }
)

cardsSchema.index({ title: 'text' })

cardsSchema.pre('findOneAndUpdate', async function deleteOldImage() {
    // @ts-ignore
    const updateImage = this.getUpdate().$set?.image
    const docToUpdate = await this.model.findOne(this.getQuery())

    if (!updateImage || !docToUpdate?.image?.fileName) {
        return;
    }

    const imagePath = join(__dirname, `../public/${docToUpdate.image.fileName}`);

    try {
        await promises.unlink(imagePath);
    } catch (err) {
        console.error(`Не удалось удалить старое изображение по пути ${imagePath}:`, err);
    }
});

cardsSchema.post('findOneAndDelete', async (doc: IProduct) => {
    if (!doc || !doc.image?.fileName) {
        return;
    }

    const imagePath = join(__dirname, `../public/${doc.image.fileName}`);

    try {
        await promises.unlink(imagePath);
    } catch (err) {
        console.error(`Не удалось удалить изображение по пути: ${imagePath}:`, err);
    }
});

export default mongoose.model<IProduct>('product', cardsSchema)
