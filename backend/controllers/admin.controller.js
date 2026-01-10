import User from "../models/User.js";

export const updateUserRole = async (req, res) => {
  const { userId, role } = req.body;
  await User.findByIdAndUpdate(userId, { role });
  res.json({ message: "Role updated" });
};

export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};
