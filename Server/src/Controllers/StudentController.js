import { Student } from "../Models/StudentSchema.js";
import { createToken } from "../Utils/jwt_token.js";
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

    const newStudent = new Student({
      name,
      email,
      password: hashedPassword,
      university,
      department,
      semester,
    });

    await newStudent.save();

    const studentData = newStudent.toObject();
    delete studentData.password;

    return res.status(201).json({
      message: "Student registered successfully",
      student: studentData,
    });
  } catch (error) {
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

    const token = createToken(student._id);

    const studentData = student.toObject();
    delete studentData.password;

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      message: "Login successful",
      student: studentData,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};