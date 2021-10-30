const { Router } = require('express');
const router = Router();

router.get("/", (req, res) => {
    res.render("Index");
  });
router.get("/signup", (req, res) => {
    res.render("Registro");
  });
router.get("/login", (req, res) => {
  res.render("Login");
});
router.get("/intranet", (req, res) => {
  res.render("Login");
});
module.exports= router;
