const express = require('express')
const app = express()
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
var fs = require('fs');
const path = require('path');
app.use(express.json());

//Variables
let jsonFile = []
const filePath = path.join(__dirname, './assets/rooms.json');
const port = process.env.PORT || 3000


//Loads JSON file
const loadFile = ()=>{
  fs.readFile(filePath, function (err, data) {
    if (err) 
        throw err;
    jsonFile = JSON.parse(data)
  });
}

loadFile();


app.use((req, res, next) => {

  res.header(

      "Access-Control-Allow-Headers",

      "Origin, X-Requested-With, Content-Type, Accept"
  );

  res.header('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Specify the allowed HTTP methods
  next();

});

app.options('*', (req, res) => {
  res.status(200).end();
});

app.get('/rooms', function (req, res) {
  res.send(JSON.stringify(jsonFile))
})

app.get('/', function (req, res) {
  res.send(jsonFile);
});

app.listen(port, "", ()=>{
  console.log(`Server running on port ${port}`)
})

app.post('/add_room', (req, res)=>{

  let idCounter = jsonFile.length;

  let response = { 
    id : (idCounter + 1),
    date : req.body.date,
    room : req.body.room,
    start : req.body.start,
    end: req.body.end
  }

  jsonFile.push(response);
  
  fs.writeFile(filePath, JSON.stringify(jsonFile), ()=>{
    console.log(`Entry ID:${response.id} added.`);
  });

  res.send("File written.");
});

app.delete('/delete_room', (req, res)=>{

  let id = req.body.ident;

  if (typeof id !== 'number') {
    return res.status(400).send('Invalid ID format');
  }

  let newList = jsonFile.filter((item)=>{
     if(item.id !== id) return item
  });

  fs.writeFile(filePath, JSON.stringify(newList), (err)=>{
    if(err){
      console.log(err);
      res.status(500).send("Error writing to file");
    }
    else{
      console.log(newList);
      console.log(`Entry ${id} deleted.`);
      loadFile();
      res.send(`Entry ${id} deleted.`);
    }
    
  });

})