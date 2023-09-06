const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true,
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
    },
    age: {
        type: Number,
        required: true,
        min: 10,
        max: 100,
    },
    gender: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trime: true,
        unique: true,
    },
    phone: {
        type: Number,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    tokens: [{
        token: {
            type: String,
            required: true,
            trim: true,
        }
    }]
});

userSchema.methods.generateAuthToken = async function(){
    try {
        const generatedToken = jwt.sign({_id: this._id}, process.env.JWT_SECRET);
        this.tokens = this.tokens.concat({token: generatedToken});
        await this.save();
        return generatedToken;
    } catch (error) {
        return error;
    }
}

userSchema.pre('save', async function(next){
    if(this.isModified('password'))
        this.password = await bcrypt.hash(this.password, 10);
    next();
});

const User = new mongoose.model('User', userSchema);

module.exports = User;