import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
    try {
        const user = await request.json();
        const tokenData = {
            id: user.id,
            name: user.name,
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