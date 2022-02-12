const User = require('../model/User');
const bcrypt = require('bcrypt');
const salt_rounds = 10;
const jwt = require('jsonwebtoken');

async function createUser(username, password) {
  const hash = bcrypt.hashSync(password, salt_rounds);
  console.log(hash);
  const new_user = await User.create({user_name: username, password: hash});
  return new_user.id;
}

async function signinUser(username, password) {
  const user = await User.findAll({where: {user_name: username}});
  const compare = await bcrypt.compareSync(password, user[0].password);
  if(compare) {
    const token = await jwt.sign({uid: user[0].id, username: user[0].user_name}, process.env.JWT_SECRET_ACCESS_TOKEN);
    return token;
  } else {
    throw new Error('Username or password is wrong');
  }
}


module.exports = { createUser, signinUser };
