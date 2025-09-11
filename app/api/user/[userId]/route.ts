import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function GET( 
    req: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const user = await prismadb.user.findUnique({
            where: {
                id: params.userId,
            }
        })

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.log("[USER_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }

}