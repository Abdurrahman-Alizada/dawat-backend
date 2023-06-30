import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "user",
	},
	OTP: { type: String, required: true },
	attempts: { type: Number, required: true },
	createdAt: { type: Date, default: Date.now, expires: '10m' },
});

const OTP = mongoose.model("OTP", OTPSchema);
export default OTP;
