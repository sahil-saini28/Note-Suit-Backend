var jwt = require("jsonwebtoken");
const JWT_SECRET = "lallulalkepakode23";

const fetchuser = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).send({ msg: "Access denied!" });
  }

  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    return res.status(401).send({ msg: "Access denied!" });
  }
};
module.exports = fetchuser;
