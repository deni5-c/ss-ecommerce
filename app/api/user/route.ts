import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function GET(
    request: Request
) {
    try {
        const { searchParams } = new URL(request.url);        
        const name = searchParams.get("name");

        const users = await prismadb.user.findMany({
        where: name
            ? {
                name: {
                    contains: name,
                    mode: "insensitive",
                },
            }
            : {},
        });
        return NextResponse.json(users);
    } catch (error) {
        console.log("[USER_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}