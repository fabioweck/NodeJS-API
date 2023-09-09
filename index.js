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
const port = process.env.PORT || 3000;

//Loads JSON file
const loadFile = ()=>{
  fs.readFile(filePath, function (err, data) {
    if (err) 
        throw err;
    
    //Parses as array of objects
    jsonFile = JSON.parse(data)

    //Sorts all entries to be displayed in order, starting form date then time
    jsonFile.sort((a, b) => {

      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
    
      if (a.start < b.start) return -1;
      if (a.start > b.start) return 1;
    
      return 0;
      
    });

  });
}

//Calls load file

//Middleware to avoid CORS policy and methods problems
app.use((req, res, next) => {

  res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
  );

  res.header('Access-Control-Allow-Origin', '*'); 

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');

  next();

});

app.options('*', (req, res) => {
  res.status(200).end();
});

//Delivers the original json file
app.get('/rooms', function (req, res) {
  res.send(JSON.stringify(jsonFile))
})


//Route to get json file
app.get('/', function (req, res) {
  loadFile();
  res.status(200).send(jsonFile);
});

//Route to insert a new entry to the json file
app.post('/add_room', (req, res)=>{

  //variable to define the id of the entry
  let idCounter = jsonFile.length;

  let response = { 
    id : (idCounter + 1),
    date : req.body.date,
    room : req.body.room,
    start : req.body.start,
    end: req.body.end
  }

  if(!response.id || !response.date || !response.room || !response.start || !response.end)
  {
    console.log("Invalid entry.")
    res.status(400).send("Invalid entry - please check fields.");
    return;
  }

  //Adds the entry to the json file
  jsonFile.push(response);

  //Sorts the entries based first on date and then time, to be displayed in order
  jsonFile.sort((a, b) => {

    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
  
    if (a.start < b.start) return -1;
    if (a.start > b.start) return 1;
  
    return 0;

  });
  
  //Writes the json file
  fs.writeFile(filePath, JSON.stringify(jsonFile), (err)=>{
    if(err){
      console.log(err);
      res.status(500).send("Error writing to file");
    }
    else{
      console.log(`File written - Entry ${response.id} added.`);
      res.status(200).send(`Entry ${response.id} added.`);
    };  
  });

  res.send(`Entry ${response.id} added.`);

});

//Route to delete an entry
app.delete('/delete_room', (req, res)=>{

  //Gets the id of the item to be removed
  let id = req.body.ident;

  //replies invalid in case of not receiving the id
  if (typeof id !== 'number') {
    return res.status(400).send('Invalid ID format');
  }

  //filters the whole file removing only the item with the specific id
  let newList = jsonFile.filter((item)=>{
     if(item.id !== id) return item
  });


  //writes the json file
  fs.writeFile(filePath, JSON.stringify(newList), (err)=>{
    if(err){
      console.log(err);
      res.status(500).send("Error writing to file");
    }
    else{
      console.log(`File written - Entry ${id} deleted.`);
      res.send(`Entry ${id} deleted.`);
    }
    
  });

})

//runs the server
app.listen(port, "", ()=>{
  console.log(`Server running on port ${port}`)
})