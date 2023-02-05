const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel')

dotenv.config({path: '../../config.env'});

const DB = process.env.DATABASE_LOCAL;

mongoose.connect(DB,{
    useNewUrlParser: true,
    useCreateIndex : true,
    useFindAndModify : false
}).then(() => console.log('Connection to database : OK'));

//read json file:
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`,'utf-8'));

const importData = async ()=>{
    try{
        await Tour.create(tours);
        console.log('data loaded to DB');
    }catch(err){
        console.log(err);
    }
}

const deleteData = async ()=>{
    try{
        await Tour.deleteMany();
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