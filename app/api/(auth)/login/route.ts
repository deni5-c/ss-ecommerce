import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email) {
            return new NextResponse("Email is required", { status: 400 });
        }

        if (!password) {
            return new NextResponse("Password is required", { status: 400 });
        }

        const user = await prismadb.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return new NextResponse("Invalid credentials", { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return new NextResponse("Invalid credentials", { status: 401 });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role || "USER",
            },
            JWT_SECRET,
            {
                expiresIn: "1d",
            }
        )

        return NextResponse.json({ token });
    } catch (error) {
        console.log("[LOGIN_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}