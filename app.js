import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import dbConnect from './config/db.config.js'
import userRouter from './routes/user.routes.js'
import backpackRouter from './routes/backpack.routes.js'
import itemsRouter from './routes/items.routes.js'

dbConnect()

const app = express();

app.use(express.json());
// Não esquecer de criar variável de ambiente com o endereço do seu app React (local ou no Netlify)
app.use(cors({ origin: process.env.REACT_APP_URL }));

app.use("/api", userRouter);
app.use("/api", backpackRouter);
app.use("/api", itemsRouter);

console.log(process.env.PORT)

app.listen(Number(process.env.PORT), () =>
  console.log(`Server up and running at port ${process.env.PORT}`)
);
