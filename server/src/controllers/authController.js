const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const ensureJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    const err = new Error("Server auth configuration missing: JWT_SECRET");
    err.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    throw err;
  }
};

const createToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

const register = async (req, res) => {
  const { email, password, name, companyName } = req.body;
  ensureJwtSecret();

  if (!email || !password || !name || !companyName) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, message: "All fields are required" });
  }
  if (String(password).length < 6) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, message: "Password must be at least 6 characters" });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const normalizedName = String(name).trim();
  const normalizedCompanyName = String(companyName).trim();

  if (!normalizedEmail || !normalizedName || !normalizedCompanyName) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, message: "All fields are required" });
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ success: false, message: "Email already registered" });
  }

  const user = await User.create({
    email: normalizedEmail,
    password: String(password),
    name: normalizedName,
    companyName: normalizedCompanyName,
  });
  const token = createToken(user);

  res.status(StatusCodes.CREATED).json({
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      companyName: user.companyName,
      role: user.role,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  ensureJwtSecret();

  if (!email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, message: "Email and password are required" });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user || !(await user.comparePassword(String(password)))) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ success: false, message: "Invalid credentials" });
  }

  const token = createToken(user);

  res.status(StatusCodes.OK).json({
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      companyName: user.companyName,
      role: user.role,
    },
  });
};

const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password").lean();
  if (!user) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ success: false, message: "User not found" });
  }

  res.status(StatusCodes.OK).json({ success: true, user });
};

module.exports = { register, login, getMe };
