const express = require('express');
const auth = express.Router();
const path = require('path');


auth.get('/auth/signin', (req, res) => {
  res.sendFile(__dirname + '/public/pages/login.html');
});
auth.post('/auth/signin', (req, res) => {
  signinUser(req.body.username, req.body.password)
  .then(response => {
    jwt.verify(response, process.env.JWT_SECRET_ACCESS_TOKEN, (err, user) => {
      res.status(200)
      .cookie("token", response, {
        httpOnly: true,
        user: user,
      })
      .json({
        success: true,
      });
    });
  })
  .catch(error => {
    res.status(401).json({
      success: false,
      message: error.message
    });
  });
});

auth.get('/auth/register', (req, res) => {
  res.sendFile(__dirname + '/public/pages/register.html');
});
auth.post('/auth/register', (req, res) => {
  createUser(req.body.username, req.body.password)
  .then(result => {
    console.log(result);
    res.json({
      success: true,
      id: result
    }).status(201)
  })
  .catch(error => {
      console.error(error);
      res.json({
        success: false,
        message: 'something went wrong'
      }).status(500)
    });
});

module.exports = auth;
