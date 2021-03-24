import mongoose from "mongoose";
import val from "validator";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Please enter an email"],
        unique: true,
        lowercase: true,
        validate: [val.isEmail, "Please enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minlength: [6, "Minimal password length is 6 chars"]
    }
});

// function after doc is saved
/*userSchema.post("save", function(doc, next) {
    console.log("new user created and saved", doc);
    next();
});*/

// function before doc is saved
userSchema.pre("save", async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// method to login user
userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email });
    if(user) {
        const auth = await bcrypt.compare(password, user.password);
        if(auth) {
            return user;
        }
        throw Error("invalid password");
    }
    throw Error("invalid email");
};

const User = mongoose.model("user", userSchema);

export default User;