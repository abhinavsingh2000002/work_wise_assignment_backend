import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/users.model.js";

/**
 * @desc Register a new user
 * @route POST /register
 * @access Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  // Check if required fields are provided
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }


  // Check if user already exists
  try {
    const existingUser = await User.findOne({
      where: { email }
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email." });
    }
  } catch (error) {
    console.error("Error checking existing user:", error);
    return res.status(500).json({ message: "Internal server error." });
  }

  // Create a new user instance
  const newUser = new User({
    name,
    email,
    password, // Ensure to hash the password before saving in a real application
    created_at: new Date(),
    updated_at: new Date(),
  });

  // Generate access and refresh tokens
  const accessToken = await newUser.generateAccessToken();
  const refreshToken = await newUser.generateRefreshToken();

  // Store tokens in the user instance
  newUser.access_token = accessToken;
  newUser.refresh_token = refreshToken;

  // Save the new user to the database
  await newUser.save();

  // Respond with the created user details (excluding sensitive data like password)
  res.status(201).json({
    message: "User registered successfully.",
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      accessToken:newUser.access_token,
      refreshToken:newUser.refresh_token,
    },
  });
});

/**
 * @desc Login a user
 * @route POST /login
 * @access Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // Check if required fields are provided
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    
    if (!(await user.isValidPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate new access and refresh tokens
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    // Store tokens in the user instance
    user.access_token = accessToken;
    user.refresh_token = refreshToken;

    // Save the updated user to the database
    await user.save();

    // Respond with the user details and tokens
    res.status(200).json({
      message: "User logged in successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        accessToken:user.access_token,
        refreshToken:user.refresh_token,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

/**
 * @desc Logout a user
 * @route POST /logout
 * @access Public
 */
const logoutUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  // Invalidate the user's refresh token
  const user = await User.findByPk(userId);
  if (user) {
    user.access_token = null; //  invalidate the token
    await user.save();
  }

  res.status(200).json({ message: "User logged out successfully." });
});

export { registerUser, loginUser, logoutUser };
