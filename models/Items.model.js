import mongoose from 'mongoose';
const { Schema, model } = mongoose

const ItemsSchema = new Schema({
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
    iteration: { type: Number, required: true },
    description: { type: String, required: true }

});

const Items = model("Items", ItemsSchema);

export default Items
