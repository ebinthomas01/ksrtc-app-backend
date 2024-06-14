const mongoose= require("mongoose")
const schema=mongoose.Schema(
    {
 
        "busname":{type:String,require:true},
        "route":{type:String,require:true},
        "busno":{type:String,require:true},
        "drivername":{type:String,require:true}
    }
)

let busmodel=mongoose.model("buses",schema);
module.exports={busmodel}