import mongoose from 'mongoose'

//function to connect to monogoDB database

const connectDB=async()=>{
    try{
    mongoose.connection.on('connected',()=>{
        console.log('Database connected')})

    await mongoose.connect(`${process.env.MONGODB_URI}/job-portal`)


    }catch(error){
        console.log('Database connection failed:',error.message)
    }

}


export default connectDB