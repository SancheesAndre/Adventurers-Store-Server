import { Router } from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.model.js'
import generateToken from '../config/jwt.config.js';
import isAuthenticated from '../middlewares/isAuthenticated.js'
import attachCurrentUser from '../middlewares/attachCurrentUser.js';
import fileUploader from '../config/cloudinary.config.js'
import Backpack from '../models/Backpack.model.js';

const salt_rounds = process.env.SALT_ROUNDS;

const userRouter = Router()

userRouter.post("/signup", async (req, res) => {
  try {
    const { password } = req.body;

    if (
      !password ||
      !password.match(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/
      )
    ) {
      return res.status(400).json({
        msg: "Password is required and must have at least 8 characters, uppercase and lowercase letters, numbers and special characters.",
      });
    }

    const salt = bcrypt.genSaltSync(+salt_rounds);

    const hashedPassword = bcrypt.hashSync(password, salt);

    const result = await User.create({
      ...req.body,
      passwordHash: hashedPassword,
    });

    await Backpack.create({
      userId: result._id
    })

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

userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ msg: "This email is not yet registered in our website;" });
    }

    if (bcrypt.compareSync(password, user.passwordHash)) {

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

userRouter.get("/profile", isAuthenticated, attachCurrentUser, (req, res) => {
  try {
    const loggedInUser = req.currentUser;

    if (loggedInUser) {
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

export default userRouter;
