const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: [true, 'user name is required ! ']
    },
    email : {
        type: String,
        required: [true, 'user email is required ! '],
        unique : true,
        lowercase: true,     //auto convert email to lowercase 
        validate : [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        type: String,
        default: 'default.jpg'

    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password : {
        type : String,
        required : [true, 'Please provide a password'],
        minlength : 8,
        select: false
    },
    passwordConfirm : {
        type : String,
        required : [true, 'Please confirm password'],
        select: false,
        validate:{
            //this only works on save !!
            validator: function(el){
                return el === this.password;
            },
            message : 'PasswordConfirm does not match password'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});


//a pre middleware on save to encrypt the password: 
userSchema.pre('save', async function(next){
    if( ! this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function(next){
    if( ! this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000; //to ensure that the token is created after this date

    next();
});

userSchema.pre(/^find/, function(next){
    this.find({active: {$ne: false}});
    next();
});

// a method to check password in login
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000,10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordResetExpires = Date.now() + 600000;

    return resetToken;
}

const User = mongoose.model('User',userSchema);

module.exports = User;