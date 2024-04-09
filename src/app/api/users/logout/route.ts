import { NextRequest, NextResponse } from "next/server";

export function POST(request: NextRequest) {

    try {
        const response = NextResponse.json({
            message: "logout success fully",
            success: true,
        });
        response.cookies.delete('token');
        return response;
    } catch (error: any) {
        return NextResponse.json({ error: error._message }, { status: 500 });
    }

}