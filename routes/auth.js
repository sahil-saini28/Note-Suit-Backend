const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const JWT_SECRET = 'lallulalkepakode23';
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser')

router.post('/createuser', [
  body('name', 'Enter a valid name').isString().isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password must be at least 5 characters').isLength({ min: 5 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);
    user = await User.create({
      name: req.body.name,
      password: secPass,
      email: req.body.email
    });

    const data = {
      user: {
        id: user.id
      }
    };

    const authtoken = jwt.sign(data, JWT_SECRET);
    success= true;
    console.log(authtoken);

    res.json({ success, authtoken });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('An error occurred');
  }
});
   

// -------------------------------------------------------------------------------------------------------------------

router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password can not be blank').exists().isLength({ min: 5 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Try valid email and password' });
    }

    const passwordCompare = await bcrypt.compare( password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({ error: 'Try with valid credentials' });
    }

    const data = {
      user: {
        id: user.id
      }
    }

    const authtoken = jwt.sign(data, JWT_SECRET);
    success= true;
    res.json({success, authtoken})
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('An error occurred');
  }
});
// =========================================================================================================================================

router.post('/getuser', fetchuser ,async (req,res)=>{

try {
  userId = req.user.id;
  const user = await User.findById(userId).select("-password")
  res.send(user)
}  catch (error) {
  console.error('Error:', error.message);
  res.status(500).send('An error occurred');
}






})















module.exports = router;

