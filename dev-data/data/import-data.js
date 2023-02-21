const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel')
const User = require('../../models/userModel')
const Review = require('../../models/reviewModel')

dotenv.config({path: '../../config.env'});

//const DB = process.env.DATABASE_LOCAL;
const DB = 'mongodb://127.0.0.1:27017/natours';

mongoose.connect(DB,{
    useNewUrlParser: true,
    useCreateIndex : true,
    useFindAndModify : false
}).then(() => console.log('Connection to database : OK'));

//read json file:
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'));

const importData = async ()=>{
    try{
        await Tour.create(tours);
        await User.create(users, {validateBeforeSave: false});
        await Review.create(reviews);
        console.log('data loaded to DB');
    }catch(err){
        console.log(err);
    }
}

const deleteData = async ()=>{
    try{
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('data deleted from DB');
    }catch(err){
        console.log(err);
    }
}

if(process.argv[2]==='--import'){
    importData();
}else if(process.argv[2]==='--delete'){
    deleteData();
}