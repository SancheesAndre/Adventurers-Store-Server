import { Router } from 'express'
import bcrypt from 'bcryptjs'

import User from '../models/User.model.js'
import generateToken from '../config/jwt.config.js';
import isAuthenticated from '../middlewares/isAuthenticated.js'
import attachCurrentUser from '../middlewares/attachCurrentUser.js';
import fileUploader from '../config/cloudinary.config.js'
import Backpack from '../models/Backpack.model.js';
import Item from '../models/Item.model.js';


const salt_rounds = process.env.SALT_ROUNDS;

const userRouter = Router()

// Crud (CREATE) - HTTP POST
// Criar um novo usuário



userRouter.post("/signup", async (req, res) => {
  // Requisições do tipo POST tem uma propriedade especial chamada body, que carrega a informação enviada pelo cliente
  //console.log(req.file);

  try {
    // Recuperar a senha que está vindo do corpo da requisição
    const { password } = req.body;
    // Verifica se a senha não está em branco ou se a senha não é complexa o suficiente
    if (
      !password ||
      !password.match(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/
      )
    ) {
      // O código 400 significa Bad Request
      return res.status(400).json({
        msg: "Password is required and must have at least 8 characters, uppercase and lowercase letters, numbers and special characters.",
      });
    }



    // Gera o salt
    const salt = bcrypt.genSaltSync(+salt_rounds);

    // Criptografa a senha
    const hashedPassword = bcrypt.hashSync(password, salt);



    // Salva os dados de usuário no banco de dados (MongoDB) usando o body da requisição como parâmetro
    const result = await User.create({
      ...req.body,
      passwordHash: hashedPassword,
    });

    await Backpack.create({
      userId: result._id
    })

    // Responder o usuário recém-criado no banco para o cliente (solicitante). O status 201 significa Created
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    // O status 500 signifca Internal Server Error
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

userRouter.post("/addPicture", fileUploader.single('profilePicture'), async (req, res) => {
  try {

    if (!req.file) {
      return res.status(422).json({ message: "The file is mandatory" })
    }

    return res.status(201).json({ fileUrl: req.file.path })

  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "error" });
  }
}
)

// Login
userRouter.post("/login", async (req, res) => {
  try {
    // Extraindo o email e senha do corpo da requisição
    const { email, password } = req.body;

    // Pesquisar esse usuário no banco pelo email
    const user = await User.findOne({ email });

    //console.log(user);

    // Se o usuário não foi encontrado, significa que ele não é cadastrado
    if (!user) {
      return res
        .status(400)
        .json({ msg: "This email is not yet registered in our website;" });
    }

    // Verificar se a senha do usuário pesquisado bate com a senha recebida pelo formulário

    if (bcrypt.compareSync(password, user.passwordHash)) {
      // Gerando o JWT com os dados do usuário que acabou de logar
      const token = generateToken(user);

      return res.status(200).json({
        user: {
          name: user.name,
          email: user.email,
          _id: user._id,
          role: user.role,
        },
        token,
      });
    } else {
      // 401 Significa Unauthorized
      return res.status(401).json({ msg: "Wrong password or email" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

// cRud (READ) - HTTP GET
// Buscar dados do usuário
userRouter.get("/profile", isAuthenticated, attachCurrentUser, (req, res) => {
  console.log(req.headers);

  try {
    // Buscar o usuário logado que está disponível através do middleware attachCurrentUser
    const loggedInUser = req.currentUser;

    if (loggedInUser) {
      // Responder o cliente com os dados do usuário. O status 200 significa OK
      return res.status(200).json(loggedInUser);
    } else {
      return res.status(404).json({ msg: "User not found." });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

userRouter.get("/profiles", async (req, res) => {
  try {
    const profiles = await User.find({})
    return res.status(200).json(profiles)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
})

userRouter.patch('/purchase/:id', isAuthenticated, attachCurrentUser, async (req, res) => {
  try {
    const { id } = req.params
    const user = req.currentUser;
    const item = await Item.findById(id)

    if (user.userMoney >= item.price) {
      
    await User.findByIdAndUpdate({_id: user._id}, {
      $set: {userMoney:  user.userMoney - item.price}
    })
    }else {
      return res.status(401).json({ message: "You don't have enough gold to purchase the item" })
    }
    console.log("Aqui:", user.userMoney)

    return res.status(201).json({ message: "Item has been purchased" })


  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
})

userRouter.patch('/sell/:id', isAuthenticated, attachCurrentUser, async (req, res) => {
  try {
    const { id } = req.params
    const user = req.currentUser;
    const item = await Item.findById(id)
      
    await User.findByIdAndUpdate({_id: user._id}, {
      $set: {userMoney:  user.userMoney + (item.price / 2)}
    })
    
    console.log("Aqui:", user.userMoney)

    return res.status(201).json({ message: "Item has been sold" })

  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
})

export default userRouter;
