import mongoose  from "mongoose";  
var imageSchema = new mongoose.Schema({
    name: String,
    img:
    {
        data: Buffer,
        contentType: String
    }
});

  
//Image is a model which has a schema imageSchema
  
const Image = mongoose.model("Image", imageSchema);
export default Image;
