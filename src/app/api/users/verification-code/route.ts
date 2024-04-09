import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies;
        console.log(token);

    } catch (error) {
        console.log(error);
    }
}