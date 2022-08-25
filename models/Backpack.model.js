import mongoose from 'mongoose';
const { Schema, model } = mongoose

const BackpackSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User"},
    items: [{ type: Schema.Types.ObjectId, ref: "Item"}]
});

const Backpack = model("Backpack", BackpackSchema);

export default Backpack
