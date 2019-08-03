const fs = require('fs');
const path = require('path');
const headers = require('./cors');
const multipart = require('./multipartUtils');

// Path for the background image ///////////////////////
module.exports.backgroundImageFile = path.join('.', 'background.jpg');
////////////////////////////////////////////////////////
let messageQueue = null;
module.exports.initialize = (queue) => {
  messageQueue = queue;
};

module.exports.router = (req, res, next = ()=>{}) => {
  console.log('Serving request type ' + req.method + ' for url ' + req.url);
  res.writeHead(200, headers);
  //GET METHODS
  if (req.method === "GET" && req.url === '/background.jpg') {

    fs.readFile(module.exports.backgroundImageFile, function(err, data) {
      if (err) {
        res.writeHead(404, headers);
      } else {
        res.end(data);
      }
    });

    // res.writeHead(404, headers);
    // res.end();
  } else if(req.method === "GET" && req.url === '/') {
    if (messageQueue) {
      res.end(messageQueue.dequeue());
    } else {
      res.end();
    }
  } else if (req.method === "GET") {
    res.writeHead(404, headers);
    res.end();
  }
  //POST METHODS
  else if(req.method === "POST"){

    var imageData = Buffer.alloc(0);

    req.on('data', function(chunk) {
      imageData = Buffer.concat([imageData, chunk]);
    });


    req.on('end', function(){
      var file = multipart.getFile(imageData)

      var fileToLoad = file;
      if (file && file.data) {
        fileToLoad = file.data;
      }

      fs.writeFile(module.exports.backgroundImageFile, fileToLoad,(err, data) => {
            if(err) {
              res.writeHead(404, headers);
              throw err;
            }
          });
    })

    res.writeHead(201, headers);
    res.end('uploaded');
  }
  else {
    res.end()
  }
  next(); // invoke next() at the end of a request to help with testing!
};
