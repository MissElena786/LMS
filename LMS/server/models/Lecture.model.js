import mongoose, {model, Schema} from 'mongoose'

 export const lectureSchema = new Schema({

    title : {
      type : String,
      // required : [true,"title is requird"]
    
  },
  lecture_id : {
   type : String,
   // required : [true,"lecture id is requird"]
 
},

   description: {
      type : String,
      // required : [true,"description is requird"]
    
  },

    secure_url:{
        type : String,
        required : [true,"url is requird"] 
    }

},{
   timestamps : true
})

const Lecture = model('lecture', lectureSchema)
//  export const Lecture = model('lecture', lectureSchema)
export default Lecture