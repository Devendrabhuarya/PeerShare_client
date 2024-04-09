import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { sendEmail } from '@/helper/mail';

connect();

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { email, password } = reqBody;

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'User Not Exist' }, { status: 400 });
        } else if (user.verifyTokenExpiry < Date.now()) {
            await sendEmail({ email: user.email, emailType: 'VERIFY', userId: user._id });
            return NextResponse.json({ error: 'Your Token is expired Please ReVerify' }, { status: 400 });
        } else if (!user.isVerfied) {
            return NextResponse.json({ error: 'First Verify the Email' }, { status: 400 });
        }


        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return NextResponse.json(
                { error: 'password is Incorrect' },
                { status: 400 });
        }
        const tokenData = {
            id: user._id,
            name: user.username,
            email: user.email
        }
        const token = jwt.sign(tokenData,
            process.env.TOKEN_SECRET!,
            { expiresIn: '1d' }
        );
        const response = NextResponse.json({
            message: "Login Successfully",
            success: true,
            user
        });
        response.cookies.set('token', token, {
            httpOnly: true
        });
        return response;
    } catch (error: any) {
        return NextResponse.json({ error: error._message }, { status: 500 });
    }
}