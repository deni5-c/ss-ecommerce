import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { requireAuth } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET( 
    req: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const result = await requireAuth(req, [Role.ADMIN]);
        if (result instanceof NextResponse) {
            return result;
        }

        const { role, id } = result;

        if (role !== Role.ADMIN && id !== params.userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

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