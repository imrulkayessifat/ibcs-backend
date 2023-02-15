const express = require("express");
const Model = require("../models/model");
const Admin = require("../models/Admin");
const Bank = require("../models/bank");
const Account = require("../models/account");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = process.env.SECRET;

const generate = (n) => {
  var add = 1,
    max = 12 - add;

  if (n > max) {
    return generate(max) + generate(n - max);
  }

  max = Math.pow(10, n + add);
  var min = max / 10; // Math.pow(10, n) basically
  var number = Math.floor(Math.random() * (max - min + 1)) + min;

  return ("" + number).substring(add);
};

const unique = () => {
  let idNumber = generate(4);
  return idNumber;
};

const isAuth = async (req, res, next) => {
  if (!!(req.headers && req.headers.authorization)) {
    const token = req.headers.authorization.split(" ")[1];

    try {
      const decode = jwt.verify(token, SECRET);

      const user = await Admin.findById(decode._id);
      if (!user) {
        return res.json({ success: false, message: "unauthorized access!" });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.json({ success: false, message: "unauthorized access!" });
      }
      if (error.name === "TokenExpiredError") {
        return res.json({
          success: false,
          message: "sesson expired try sign in!",
        });
      }

      res.res.json({ success: false, message: "Internal server error!" });
    }
  } else {
    res.json({ success: false, message: "unauthorized access!" });
  }
};

// Signup route to create a new user
router.post("/signup", async (req, res) => {
  try {
    // hash the password
    req.body.password = await bcrypt.hash(req.body.password, 10);
    // create a new user
    const user = await Admin.create(req.body);
    // send new user as response
    res.json(user);
  } catch (error) {
    res.status(400).json({ error });
  }
});

// Login route to verify a user and get a token
router.post("/login", async (req, res) => {
  try {
    // check if the user exists
    const user = await Admin.findOne({ username: req.body.username });
    if (user) {
      //check if password matches
      const result = await bcrypt.compare(req.body.password, user.password);
      if (result) {
        // sign token and send it in response
        const token = await jwt.sign(
          { username: user.username, _id: user._id },
          SECRET
        );

        let oldTokens = user.tokens || [];
        if (oldTokens.length) {
          oldTokens = oldTokens.filter((t) => {
            const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000;
            if (timeDiff < 86400) {
              return t;
            }
          });
        }

        await Admin.findByIdAndUpdate(user._id, {
          tokens: [...oldTokens, { token, signedAt: Date.now().toString() }],
        });
        res.json({ success: true, token });
      } else {
        res.status(400).json({ error: "password doesn't match" });
      }
    } else {
      res.status(400).json({ error: "User doesn't exist" });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

//signout method

router.post("/logout", isAuth, async (req, res) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Authorization fail!" });
    }

    const tokens = req.user.tokens;

    const newTokens = tokens.filter((t) => t.token !== token);

    await Admin.findByIdAndUpdate(req.user._id, { tokens: newTokens });
    res.json({ success: true, message: "Sign out successfully!" });
  }
});

//Post Method
router.post("/post", async (req, res) => {
  const data = new Model({
    uniqueId: unique(),
    name: req.body.name,
    rank: req.body.rank,
    address: req.body.address,
    mobile: req.body.mobile,
    account: req.body.account,
  });

  try {
    const dataToSave = await data.save();
    res.status(200).json(dataToSave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Get all Method
router.get("/getAll", async (req, res) => {
  try {
    const data = await Model.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Get by ID Method
router.get("/getOne/:uniqueId", async (req, res) => {
  try {
    const data = await Model.find(req.params);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Update by ID Method
router.patch("/update/:uniqueId", async (req, res) => {
  try {
    const id = req.params;
    const updatedData = req.body;
    const options = { new: true };

    const data = await Model.find(req.params);

    const result = await Model.findByIdAndUpdate(data, updatedData, options);

    res.send(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Delete by ID Method
router.delete("/delete/:uniqueId", async (req, res) => {
  try {
    const id = req.params;
    const data = await Model.find(id);
    console.log(id);
    console.log(data);
    await Model.remove(id);
    res.send(`Document with ${data[0].name} has been deleted..`);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/send/:id", async (req, res) => {
  const id = req.params;

  const info = await Model.find(id);
  const data = new Bank({
    basic: req.body.basic,
    houserent: req.body.houserent,
    medicalallowance: req.body.medicalallowance,
    details: info,
  });

  try {
    const dataToSave = await data.save();
    res.status(200).json(dataToSave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/getSingleAccount/:uniqueId", async (req, res) => {
  try {
    const data = await Bank.find(req.params);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/get_balance/:id", async (req, res) => {
  try {
    const data = await Account.find(req.params);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/add_balance", async (req, res) => {
  const data = new Account({
    total_amount: req.body.total_amount,
  });
  try {
    const dataToSave = await data.save();
    res.status(200).json(dataToSave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/update_balance/:id", async (req, res) => {
  try {
    const id = req.params;
    const updatedData = req.body;
    const options = { new: true };
    console.log(id);
    console.log(updatedData);
    const data = await Account.find(req.params);

    const result = await Account.findByIdAndUpdate(data, updatedData, options);

    res.send(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
