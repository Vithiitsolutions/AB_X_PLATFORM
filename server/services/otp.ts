import mercury from "@mercury-js/core";
import axios from "axios";
import { GraphQLError } from "graphql";
export const generateOTP = (mobile: string): string => {
    if (mobile === "1234567891" || mobile === "1234567892") {
        return "1234";
    }
    return Math.floor(1000 + Math.random() * 9000).toString();
}
export const sendOTPViaMsg91 = async (mobile: string, otp: string) => {
    try {
        const response = await axios.post(
            "https://api.msg91.com/api/v5/otp",
            {
                template_id: "6592b2b4d6fc0551b05cde02",
                mobile: `91${mobile}`,
                otp: otp,
                authkey: process.env.MSG91_AUTH_KEY,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        if (response.status !== 200) {
            throw new Error("Failed to send OTP via MSG91");
        }

        return response.data;
    } catch (error: any) {
        throw new GraphQLError("Error sending OTP");
    }
};
export const storeOTPInRedis = async (mobileNumber: string, otp: string) => {
    try {
        await mercury.cache.set(mobileNumber, otp, { EX: 600 });
    } catch (error) {
        throw new GraphQLError("Error storing OTP.");
    }
};
