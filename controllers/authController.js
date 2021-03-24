import User from "../models/User.js"
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: "../config/config.env" });

const handleErrors = (error) => {
    let err = {email: "", password: ""};

    // invalid email
    if(error.message === "invalid email") {
        err.email = "that email is not registered";
    }

    // invalid password
    if(error.message === "invalid password") {
        err.password = "that password is incorrect";
    }

    // duplica email
    if(error.code === 11000) {
        err.email = "that email is already registered";
        return err;
    }

    // validation error
    if(error.message.includes("user validation failed")) {
        Object.values(error.errors).forEach(({properties}) => {
            err[properties.path] = properties.message;
        });
    }

    return err;
};

const maxAge = 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({id}, process.env.SECRET, {
        expiresIn: maxAge
    });
};

export const signup_get = (req, res) => {
    res.render("signup");
};

export const login_get = (req, res) => {
    res.render("login");
};

export const signup_post = async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await User.create({email, password});
        const token = createToken(user._id);
        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: maxAge * 1000
        });
        res.status(201).json({user: user._id});
    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({errors});
    }
};

export const login_post = async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: maxAge * 1000
        });
        res.status(200).json({ user: user._id});
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({errors});
    }
};

export const logout_get = (req, res) => {
    res.cookie("jwt", "", { maxAge: 1 });
    res.redirect("/");
};