const mongoose=require('mongoose')

const uri = "mongodb+srv://vineeth:vineeth123@tcs.t1oqs.mongodb.net/tcs?retryWrites=true&w=majority";

mongoose.connect(uri,{ useUnifiedTopology: true },(err)=>{
console.log('connected')
})
require('./user.model')