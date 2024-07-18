const mongoose = require("mongoose");

const JobSchema = mongoose.Schema({
  language: {
    type: String,
    required: true,
    enum: ["cpp", "python"],
  },
  filepath: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    // required: true,
    deafult: "pending",
    enum: ["pending", "success", "error"],
    
  },
  startedAt: {
    type: Date,
  },
  completedAt: {
    type: String,
  },
  output:{
    type : String,
    default: undefined,
  }
});

let JobModel=mongoose.model('JobModel',JobSchema);

module.exports=JobModel;