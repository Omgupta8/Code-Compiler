const Queue = require("bull");
const JobModel = require("./models/Job");

const JobQueue = new Queue("job-queue");
const NUM_WORKER = 5;

JobQueue.process(async ({ data }) => {
  console.log('queue process');
  console.log(data);
  const { id: jobId } = data;
  const job = await JobModel.findById(jobId);
  if(job===undefined) {
    throw Error("job not found");
  }
  console.log('Fetched Job ',job);
  return true;
});

const addJobToQueue =async (jobId) => {
  console.log("queue add");
  console.log(jobId);
  await JobQueue.add({ id:jobId});
//   console.log('jdw');
//   console.log(val);
};


module.exports = {
  addJobToQueue,
};
