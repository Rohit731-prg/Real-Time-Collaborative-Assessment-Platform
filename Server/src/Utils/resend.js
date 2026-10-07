import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
};

export const sendEmail = async (to, otp) => {
    try {
        const { data, error } = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: [to],
            subject,
            text: text(otp),
        });

        if (error) {
            console.log("Resend error:", error);
            throw new Error(error.message);
        }

        console.log("Email sent successfully:", data);

    } catch (error) {
        console.log("Error from Resend:", error);
        throw new Error(error.message);
    }
};