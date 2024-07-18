const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const db_link =
  "mongodb+srv://omgupta:helloworld1234@cluster0.xbfdebp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const { executeCpp } = require("./executeCpp");
const { executePy } = require("./executePy");
const { generateFile } = require("./generateFile");
const { addJobToQueue } = require("./jobQueue");
const JobModel = require("./models/Job");


mongoose
  .connect(db_link)
  .then(function (db) {
    console.log("db connected");
  })
  .catch(function (err) {
    console.log(err);
  });

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/status", async (req, res) => {
  const jobId = req.query.id;
  console.log("get Status");
  if (jobId == undefined) {
    return res.status(400).json({
      success: false,
      error: "missing jobId",
    });
  }

  try {
    const job = await JobModel.findById(jobId);
    if (job == undefined)
      return res.status(404).json({
        success: false,
        error: "invalid jobId",
      });

    return res.status(200).json({ success: true, job });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: JSON.stringify(err),
    });
  }
});

app.post("/run", async (req, res) => {
  const { language = "cpp", code } = req.body;
  console.log(language, code.length);
  // console.log(code);

  if (code === undefined) {
    return res.status(400).json({
      success: false,
      message: "Empty code body",
    });
  }
  let job;

  try {
    const filepath = await generateFile(language, code);
    job = await JobModel.create({ language, filepath, status:"pending"});
    const jobId = job["_id"];
    // console.log(jobId);
    addJobToQueue(jobId);

    let output;
    res.status(201).json({ success: true, jobId });
    job["startedAt"] = Date.now();
    
    // console.log(job);
    if (language === "cpp") {
      output = await executeCpp(filepath);
    }
    if (language === "python") {
      output = await executePy(filepath);
    }

    job["completedAt"] = Date.now;
    job["status"] = "success";
    job["output"] = output;
    await job.save();

    // console.log(job);
  } catch (err) {
    job["completedAt"] = Date.now;
    job["status"] = "error"; 
    job["output"] = JSON.stringify(err);
    await job.save();

    console.log(err);
  }
});

app.listen(5000, () => {
  console.log("Listening on port 5000!");
});
