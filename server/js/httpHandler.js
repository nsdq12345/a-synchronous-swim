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
  // console.log(module.exports.backgroundImageFile);
  //GET METHODS
  if (req.method === "GET" && req.url === '/background.jpg') {
    fs.readFile(module.exports.backgroundImageFile, function(err, data) {
      if (err) {
        console.log(err);
        res.writeHead(404, headers);
      }
        res.end(data);
    });
  } else if(req.method === "GET" && messageQueue !== null) {
    res.end(messageQueue.dequeue());
  }
  //OST METHODS
  else if(req.method === "POST"){
    // var body;
    // req.on('data', function(chunk) {
    //   console.log(chunk);
    //   var buff = chunk;
    //   if (buff) {
    //     body += buff;
    //   }
    //     console.log('READABLE:', buff);
    // });
    // req.on('end', function() {
    //   var file = multipart.getFile(Buffer.from(body));
    //   console.log("BODy:",body);
    //   fs.writeFile(module.exports.backgroundImageFile, file, 'binary',(err, data) => {
    //     if(err) {
    //       res.writeHead(404, headers);
    //       throw err;
    //     }
    //   });
    // })

    var imageData = Buffer.alloc(0);

    req.on('data', function(chunk) {
      imageData = Buffer.concat([imageData, chunk]);
    });


    req.on('end', function(){
      var file = multipart.getFile(imageData)
      fs.writeFile(module.exports.backgroundImageFile, file.data,(err, data) => {
            if(err) {
              res.writeHead(404, headers);
              throw err;
            }
          });
    })


    // fs.writeFile(module.exports.backgroundImageFile, file, (err, data) => {
    //   if(err) {
    //     res.writeHead(404, headers);
    //     throw err;
    //   }
    // });
    res.end('uploaded');
  }
  // console.log(res);
  next(); // invoke next() at the end of a request to help with testing!
};
