import nodemailer from "nodemailer";

const subject = "Verify your OTP to access your exam";
const text = (otp) => {
    return `
    Hello,
    
    Thank you for registering with us. Please use the following OTP to verify your email address and proceed with the exam:

    OTP: ${otp}

    This OTP will expire in 5 minutes.
    
    If you did not initiate this request, please disregard this email.
    
    Best regards,
    The Exam Team
`;
}

export const sendEmail = async (to, otp) => {
    try {

        // SMTP Transport
        const transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.GOOGLE_EMAIL,
                pass: process.env.GOOGLE_PASSWORD,
            },
        });

        // Send Mail
        await transporter.sendMail({
            from: process.env.GOOGLE_EMAIL,
            to,
            subject: subject,
            text: text(otp),
        });

        console.log("Email sent successfully");

    } catch (error) {
        console.log("Error from node mailer: ", { error });
        console.log("Error from node mailer: ", error);
        console.log("Error from node mailer: ", error.message);
        throw new Error(error.message);
    }
}