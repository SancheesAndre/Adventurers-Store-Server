import mongoose from 'mongoose';
const { Schema, model } = mongoose

const BackpackSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    ItemId: { type: mongoose.Schema.Types.ObjectId, ref: "Items"}
});

const Backpack = model("Backpack", BackpackSchema);

export default Backpack
