import { Course } from "../Models/CourseSchema.js"

export const createCourse = async (req, res) => {
    try {
        const { name, code, description } = req.body;
        if (!name || !code) {
            return res.status(201).json({ message: "All details are require " });
        }

        const courseExist = await Course.findOne({ code });
        if (courseExist) {
            return res.status(400).json({ message: "Course already exists" });
        }

        const user = req.user;
        const newCourse = new Course({
            name,
            code,
            university: user.university,
            department: user.department,
            semester: user.semester,
            description: description || "",
            creatorId: user._id,
        });

        await newCourse.save();

        return res.status(201).json({
            message: "Course created successfully",
            course: newCourse,
        });
    } catch (error) {
        const statusCode = error.name === "ValidationError" ? 400 : 500;
        return res.status(statusCode).json({ message: error.message });
    }
}

export const getAllCourse = async (req, res) => {
    try {
        const user = req.user;
        const courses = await Course.find({ department: user.department });

        if (!courses) {
            return res.status(404).json({ message: "No courses found" });
        }
        return res.status(200).json({ courses });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, description } = req.body;
        if (!name || !code) {
            return res.status(400).json({ message: "Course name and code are required" });
        }
        const user = req.user;
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        if (course.creatorId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to update this course" });
        }
        const duplicateCode = await Course.findOne({ code, _id: { $ne: id } });
        if (duplicateCode) {
            return res.status(400).json({ message: "Course already exists" });
        }
        const updatedCourse = await Course.findByIdAndUpdate(id, {
            name,
            code,
            university: user.university,
            semester: user.semester,
            department: user.department,
            description: description || "",
            creatorId: user._id,
        }, { new: true, runValidators: true });
        return res.status(200).json({ updatedCourse });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const deleteCourse = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const courseCreator = await Course.findById(id);
        if (!courseCreator) {
            return res.status(404).json({ message: "Course not found" });
        }
        if (courseCreator.creatorId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this course" });
        }
        const deletedCourse = await Course.findByIdAndDelete(id);
        return res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}