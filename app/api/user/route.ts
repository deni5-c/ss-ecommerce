import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function GET() {
    try {
        const users = await prismadb.user.findMany();
        return NextResponse.json(users);
    } catch (error) {
        console.log("[USER_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}