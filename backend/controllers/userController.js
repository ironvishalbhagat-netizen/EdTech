const User = require('../models/User');
const bcrypt = require('bcryptjs');

// NAYA FUNCTION: User ki details fetch karne ke liye (Settings Tab ke liye)
exports.getUserProfile = async (req, res) => {
  try {
    // Password ko chhodkar baaki user data nikalna
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log("❌ FETCH PROFILE ERROR:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PURANA FUNCTION: Profile aur Password update karne ke liye
exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, currentPassword, newPassword } = req.body;

    // Database mein user ko dhoondhna
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Agar naam bheja gaya hai, toh naam update karein
    if (name) {
      user.name = name;
    }

    // Agar password change karne ki request hai
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password galat hai' });
      }
      // Naya password encrypt karke save karna
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();
    res.status(200).json({ 
      message: 'Profile updated successfully', 
      user: { name: user.name, email: user.email } 
    });

  } catch (error) {
    console.log("❌ PROFILE UPDATE ERROR:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};