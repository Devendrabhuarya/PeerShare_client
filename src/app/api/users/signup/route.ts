import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from "@/helper/mail";
connect();

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { username, email, password } = reqBody;
        console.log(reqBody, 'hii');

        // check user is exist or not
        const user = await User.findOne({ email });
        if (user) {
            return NextResponse.json({ error: 'User Already Exist' }, { status: 400 });
        }
        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // save new User
        const newUser = new User({
            isVerfied: true,
            email,
            username,
            password: hashedPassword,

        });
        const saveUser = await newUser.save();
        // await sendEmail({ email, emailType: "VERIFY", userId: saveUser._id });
        return NextResponse.json({
            message: "User saved Successfully",
            success: true,
            saveUser
        });

    } catch (error: any) {
        console.log(error);
        return NextResponse.json({ error: error._message }, { status: 500 });
    }
}