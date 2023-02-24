import { createTransport } from "nodemailer";

export default async (email, subject, text) => {
	try {
		const transporter = createTransport({
			host: process.env.HOST,
			service: process.env.SERVICE,
			port: Number(process.env.EMAIL_PORT),
			secure: Boolean(process.env.SECURE),
			auth: {
				user: process.env.EMAIL,
				pass: process.env.PASS,
			},
		});

		await transporter.sendMail({
			from: process.env.EMAIL,
			to: email,
			subject: subject,
			text: text,
		});
		console.log("email sent successfully");
	} catch (error) {
		console.log("email not sent!");
		// console.log(error);
		return error;
	}
};
