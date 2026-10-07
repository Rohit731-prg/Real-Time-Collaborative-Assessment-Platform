import { Student } from "../Models/StudentSchema.js";
import { createToken } from "../Utils/jwt_token.js";
import { sendEmail } from "../Utils/nodeMailer.js";
import { createHashedPassword, comparePassword } from "../Utils/password.js";

export const signup = async (req, res) => {
  const { name, email, password, university, department, semester } = req.body;

  if (!name || !email || !password || !university || !department || !semester) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(409).json({ message: "Student with this email already exists" });
    }

    const hashedPassword = await createHashedPassword(password);
    const otp = Math.floor(1000 + Math.random() * 9000);

    const newStudent = new Student({
      name,
      email,
      password: hashedPassword,
      university,
      department,
      semester,
      otp: otp
    });
    await newStudent.save();

    await sendEmail(email, otp);

    return res.status(201).json({
      message: "Student registered successfully please verify your email",
      email: newStudent.email,
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.isActive) {
      return res.status(403).json({ message: "Account is inactive. Please contact support." });
    }

    const isPasswordValid = await comparePassword(password, student.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    if (!student.isActive) {
      return res.status(403).json({ message: "Account is inactive." });
    }

    const token = createToken(student._id);

    const studentData = student.toObject();
    delete studentData.password;
    student.otp = null;
    delete student.otp;

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      student: studentData,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const optVerification = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and otp are required" });
    }

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.otp !== otp) {
      await Student.findByIdAndDelete(student._id);
      return res.status(401).json({ message: "Invalid otp" });
    }

    student.isActive = true;
    student.otp = null;
    await student.save();

    const studentData = student.toObject();
    delete studentData.password;

    return res.status(200).json({
      message: "Opt verification successful",
      student: studentData,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const forgotPasswordGetEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000);
    student.otp = otp;
    await student.save();

    const studentData = student.toObject();
    delete studentData.password;

    await sendEmail(studentData.email, otp);

    return res.status(200).json({
      message: "Otp sent successfully",
      student: studentData,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    if (!email || !password || !otp) {
      return res.status(400).json({ message: "Email, password and otp are required" });
    }

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (String(student.otp) !== String(otp)) {
      return res.status(401).json({ message: "Invalid otp" });
    }

    const hashedPassword = await createHashedPassword(password);
    student.password = hashedPassword;
    student.otp = null;
    await student.save();

    const studentData = student.toObject();
    delete studentData.password;

    return res.status(200).json({
      message: "Password reset successful",
      student: studentData,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};