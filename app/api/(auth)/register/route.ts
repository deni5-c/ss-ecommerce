import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import prismadb from "@/lib/prismadb";
import { validationPipe } from "@/lib/pipes";
import { UserSchema, UserType } from "@/dto/user.dto";
import { error } from "console";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validate = await validationPipe<UserType>(UserSchema, body)
        const { name, email, password, role } = validate;

        console.log(validate.error);

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!email) {
            return new NextResponse("Email is required", { status: 400 });
        }

        if (!password) {
            return new NextResponse("Password is required", { status: 400 });
        }        

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
        console.log("[REGISTER_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}