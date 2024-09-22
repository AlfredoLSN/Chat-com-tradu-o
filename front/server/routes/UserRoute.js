const userController = require("../controllers/UserController");

const router = require("express").Router();

router.post("/login", userController.login);
router.post("/register", userController.register);


module.exports = router;