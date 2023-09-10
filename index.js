const express = require('express')
var bodyParser = require("body-parser");
var fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {

  res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');

  next();
});

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

const jsonFile = require("./rooms.json");
let fileParsed;
const filePath = 'rooms.json';

fs.readFile(filePath, (err, data)=>{
  if(err){
    console.log(err);
    return;
  }

  fileParsed = JSON.parse(data);
});

app.get('/', function (req, res) {
  console.log("File accessed.")
  res.send(JSON.stringify(fileParsed));
});

app.post('/add_room', (req, res)=>{

  let jsonLength = fileParsed.length;

  let request = {
    id : jsonLength += 1,
    date: req.body.date,
    room: req.body.room,
    start: req.body.start,
    end: req.body.end,
  }
  
  fileParsed.push(request);

  fileParsed.sort((a,b)=>{
    if(a.date > b.date) return 1;
    else if(a.date < b.date) return -1;
    else if(a.start > b.start) return 1;
    else if(a.start < b.start) return -1;
    else return 0;
  });

  let data = JSON.stringify(fileParsed, null, 2);

  fs.writeFile(filePath, data, (err)=>{
    if(err){
      console.log("--Error writing file.--");
      res.send("--Error writing file.--");
    }
    else{
      console.log("--File written.--");
      res.send("--File written.--");
    }
  });
});

app.delete("/delete_room", (req,res)=>{
  
  let id = req.body.ident;
  
  const filteredJson = fileParsed.filter((item)=> {return item.id !== id});

  let data = JSON.stringify(filteredJson, null, 2);
  
  fs.writeFile(filePath, data, (err)=>{
    if(err){
      console.log("--Error writing file.--");
      res.send("--Error writing file.--");
    }
    else{
      console.log("--File written.--");
      res.send("--File written.--");
    }
  });
});

app.listen(port, ()=>{
  console.log("Listening to port: " + port);
});