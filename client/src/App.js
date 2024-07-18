import "./App.css";
import axios from "axios";
import React, { useState } from "react";

function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [output, setOutput] = useState("");
  const [status,setStatus] =useState("");
  const [jobId,setJobId]=useState("");

  const handleSubmit = async () => {
    console.log(code);

    const payload = {
      language,
      code,
    };
    try {
      setStatus("pending");
      const { data } = await axios.post("http://localhost:5000/run", payload);
      // console.log(data.jobId);
      if (data.jobId) {
        // console.log(data);
        setJobId(data.jobId);
      } else throw data;

      let intervalId=setInterval(async () => {
        const { data: dataRes } = await axios.get(
          `http://localhost:5000/status`,
          { params: { id: data.jobId } }
        );
        console.log(dataRes);
        const {success,job,error}=dataRes;
        if(success){
          const {status:jobStatus,output:jobOutput} = job;
          // console.log(jobStatus);
          setStatus(jobStatus);
          // console.log(jobStatus,jobOutput);
          if(jobStatus === "pending") return ;
          setOutput(jobOutput);
          clearInterval(intervalId);
        }
        else {
          setStatus("Error :Please retry!");
          console.log(error); 
          setOutput(error);
          clearInterval(intervalId);
        }
      }, 1000);

    } catch (response) {
      console.log(response);
      if (response) {
        // const errMsg = response.output.stderr;
        // setOutput(errMsg);
      } else {
        setOutput("Error connecting to the Server!");
      }
      // console.log(err);
    }
    // console.log(output);
  };
  return (
    <div className="App">
      <h1>Online Code-Compiler</h1>
      <div>
        <label>Language: </label>
        <select
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            console.log(e.target.value);
          }}
        >
          <option value="cpp">C++</option>
          <option value="python">python</option>
        </select>
      </div>
      <br />
      <textarea
        rows="20"
        cols="75"
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
        }}
      ></textarea>
      <br />
      <button onClick={handleSubmit}>Submit</button>
      <p>{status}</p>
      <p>{jobId && `jobID: ${jobId}`}</p>
      <p>{output}</p>
    </div>
  );
}

export default App;
