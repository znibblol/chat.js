const express = require('express');
const router = express.Router();
const path = require('path');


router.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname + '/../public/index.html'));
});

router.get('/chat', tokenCheck, (req, res) => {
  res.sendFile(__dirname + '/public/pages/chat.html');
});


function tokenCheck(req, res, next) {
  if(req.headers['cookie'].includes('token')) {
    token = req.headers['cookie'].split('=')[1];
    jwt.verify(token, process.env.JWT_SECRET_ACCESS_TOKEN, (err, user) => {
      if(err) return res.sendStatus(403);
      req.user = user;
      // console.log(req.user);
      next();
    });
  } else {
    return res.sendStatus(401);
  }

}


module.exports = router;
