const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { User } = require("../models");
const jwtUtils = require("../utils/jwtUtils");

const userService = {
  createUser: async (userData) => {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const newUser = await User.create({
        id: uuidv4(), // Explicitly set the UUID here
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
      });
      console.log(
        "User created successfully",
        JSON.stringify(newUser.toJSON(), null, 2)
      );
      return newUser;
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  },

  getUserByEmail: async (email) => {
    try {
      return await User.findOne({ where: { email } });
    } catch (error) {
      console.error("Error in getUserByEmail:", error);
      throw error;
    }
  },

  updateUser: async (userId, updateData) => {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("User not found");
      }
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
      await user.update(updateData);
      return user;
    } catch (error) {
      console.error("Error in updateUser:", error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("User not found");
      }
      await user.destroy();
      return { message: "User deleted successfully" };
    } catch (error) {
      console.error("Error in deleteUser:", error);
      throw error;
    }
  },

  validatePassword: async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
  },

  loginUser: async (email, password) => {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new Error("Invalid email or password");
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
      }
      const token = jwtUtils.generateToken(user);
      return token;
    } catch (error) {
      console.error("Error in loginUser:", error);
      throw error;
    }
  },
};

module.exports = userService;
