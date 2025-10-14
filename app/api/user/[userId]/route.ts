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

export async function DELETE( 
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

        const user = await prismadb.user.delete({
            where: {
                id: params.userId,
            }
        })

        return NextResponse.json({ message: "User deleted", user });
    } catch (error) {
        console.log("[USER_DELETE]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function PUT(
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

        const body = await req.json();
        const { name, email } = body;

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!email) {
            return new NextResponse("Email is required", { status: 400 });
        }

        const user = await prismadb.user.update({
            where: {
                id: params.userId,
            },
            data: {
                name,
                email,
            }
        })
        
        return NextResponse.json(user);
    } catch (error) {
        console.log("[USER_PUT]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}


export async function PATCH(
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

        const body = await req.json();
        const { name, email, password } = body;

        const user = await prismadb.user.update({
            where: {
                id: params.userId,
            },
            data: {
                name,
                email,
                password,
            }
        })

        return NextResponse.json(user);
    } catch (error) {
        console.log("[USER_PATCH]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}