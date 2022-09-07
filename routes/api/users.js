const express = require('express');

const router = express.Router();
const {check, validationResult} = require('express-validator');
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');


router.post('/',[
    check('name', 'Name is required').not().isEmpty(),
    check('email','please include valid email').isEmail(),
    check('password', 'please enter pw with 6 or more characters').isLength({min:6})
],async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    // See if user exists
    const {name, email, password} = req.body;
    try {
        let user = await User.findOne({email});
        if(user){
            return res.status(400).json({errors: [{msg: 'User already exists'}]});
        }
        res.send('User route');
    // Get users gravatar
    const avatar = gravatar.url(email,{
        s: '200',
        r: 'pg',
        d: 'mm'
    })
    user = new User({
        name,
        email,
        avatar,
        password
    });
    // Encrypt pw
    const salt = await bcrypt.genSalt(10);
    

    user.password = await bcrypt.hash(password, salt);

    await user.save();


    // Return jsonwebtoken
    res.send('User registered');
    } catch (err){
    console.error(err.message);
    res.status(500).send('Server error');
    }
    }
);

module.exports = router;
