import { Router } from 'express'
import attachCurrentUser from '../middlewares/attachCurrentUser.js'
import isAuthenticated from '../middlewares/isAuthenticated.js'
import Backpack from '../models/Backpack.model.js'



const backpackRouter = Router()


backpackRouter.get("/backpack", isAuthenticated, attachCurrentUser, async (req, res) => {
    try {
        const user = req.currentUser;
        const backpack = await Backpack.find({
            userId: user._id
        })
        return res.status(200).json(backpack)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: 'Internal server error.' })
    }
})


export default backpackRouter