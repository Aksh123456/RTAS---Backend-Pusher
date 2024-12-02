const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')

exports.register = async (req, res) => {
  try
  {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  }
  catch(err)
  {
    res.status(500).json({message: "Internal Server"})
  }
  
};

exports.login = async (req, res) => {
  try 
  {
    const { email, password } = req.body;
    console.log(req.body, 'body')
    // mongoose.set("debug", true);
  
    const user = await User.findOne({ email: email });
    console.log(user, 'user')
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Invalid credentials" });
    const token = jwt.sign({ id: user._id, email: user.email }, "secret", { expiresIn: "1h" });
    res.json({ token });
  }
  catch(err)
  {
    res.status(500).json({message: "Internal Server"})
  }
  
};
