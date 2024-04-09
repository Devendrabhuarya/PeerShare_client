import { connect } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { sendEmail } from "@/helper/mail";
connect();

export async function POST(request: NextRequest) {
    try {

        const reqBody = await request.json();
        const { token } = reqBody;
        const user = await User.findOne({ verifyToken: token });
        if (!user) {
            return NextResponse.json({ error: 'Token is not Valid ' }, { status: 400 });
        } else if (user.verifyTokenExpiry < Date.now()) {
            sendEmail({ email: user.email, emailType: 'VERIFY', userId: user._id });
            return NextResponse.json({ error: 'Your Token is expired Please ReVerify' }, { status: 400 });
        }
        user.isVerfied = true;
        user.verifyToken = undefined;
        user.verifyTokenExpiry = undefined;
        const saveUser = await user.save();
        console.log(saveUser);
        return NextResponse.json({
            message: "Email verified successfully",
            success: true,
        });

    } catch (error: any) {
        return NextResponse.json({ error: error._message }, { status: 500 });
    }


}