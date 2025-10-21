import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET!;

export type PayLoad = {
    id: string;
    email: string;
    role: Role;
};

export function requireAuth(
    req: Request, 
    roles?: Role[]
): PayLoad | NextResponse {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET) as PayLoad;

        if (roles && !roles.includes(decodedToken.role)) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        return decodedToken;
    } catch (error) {
        console.log("[AUTH_ERROR]", error);
        return new NextResponse("Invalid token", { status: 401 });
    }
}