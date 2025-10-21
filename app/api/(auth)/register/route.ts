import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prismadb from "@/lib/prismadb";
import { validationPipe } from "@/lib/pipes";
import { RegisterUserDTO, RegisterUserSchema } from "@/dto/user.dto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, role } = await validationPipe<RegisterUserDTO>(RegisterUserSchema, body);

        let user;

        user = await prismadb.user.findUnique({
            where: {
                email
            }
        })

        if (user) {
            return new NextResponse("User already exists", { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 16);

        user = await prismadb.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'USER'
            }
        })

        return NextResponse.json({ message: "User created", user });
    } catch (error) {
        if (error instanceof Error) {
            return new NextResponse(error.message, { status: 400 });
        }

        console.log("[REGISTER_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}