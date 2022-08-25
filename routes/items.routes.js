import { Router } from 'express'
import isAuthenticated from '../middlewares/isAuthenticated.js'
import attachCurrentUser from '../middlewares/attachCurrentUser.js'
import Item from '../models/Item.model.js'
import Backpack from '../models/Backpack.model.js'

const itemsRouter = Router()

itemsRouter.get("/items", async (req, res) => {
  try {
    const items = await Item.find({})
    return res.status(200).json(items)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
})

itemsRouter.get('/items/:id', async (req, res) => {
  try {
    const { id } = req.params

    const Item = await Item.findById(id)
    return res.status(200).json(Item)

  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
})

itemsRouter.post('/items', async (req, res) => {
  try {
    const newItem = await Item.create(req.body)
    return res.status(201).json(newItem)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
})

itemsRouter.delete('/items/:id', async (req, res) => {
  try {
    const { id } = req.params

    await Item.findOneAndDelete(id)
    return res.status(204).json()

  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
})

itemsRouter.post('/purchase/:id', isAuthenticated, attachCurrentUser, async (req, res) => {
  try {
    const { id } = req.params
    const user = req.currentUser;

    if (!user) {
      return res.status(401).json({ message: "You must be logged to purchase items" })
    }

    const item = await Item.findById(id)
    
    await Backpack.findOneAndUpdate({ userId: user._id }, {
      $push: { items: item }
    })

    return res.status(201).json({ message: "Item has been purchased" })


  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
})

itemsRouter.post('/sell/:id', isAuthenticated, attachCurrentUser, async (req, res) => {
  try {
    const { id } = req.params
    const user = req.currentUser;

    if (!user) {
      return res.status(401).json({ message: "You must be logged to sell items" })
    }

    const item = await Item.findById(id)
    console.log(item._id)
    
    await Backpack.findOneAndDelete({ ItemId: item._id })

    return res.status(201).json({ message: "Item has been sold" })


  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
})

export default itemsRouter