import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js"
import cookieParser from "cookie-parser"; 
import { checkUser, requireAuth } from "./middleware/authMiddleware.js";

dotenv.config({ path: "./config/config.env" });

const app = express();

// Middleware
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

// View Engine
app.set("view engine", "ejs");

// Database
const dbURI = process.env.DB_URI;
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));

// Routes
app.get('*', checkUser);
app.get('/', (req, res) => res.render('home'));
app.get('/smoothies', requireAuth, (req, res) => res.render('smoothies'));
app.use(authRoutes);
