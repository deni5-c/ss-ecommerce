import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(
    req: Request
) {
    try {
        const body = await req.json();
        const { 
            name,
            userId,
            address, 
        } = body;

        const missingFields = [];
        if (!name) missingFields.push("Name");
        if (!userId) missingFields.push("User ID");
        if (!address) missingFields.push("Address");
        if (missingFields.length > 0) {
            return new NextResponse(
                `${missingFields.join(", ")} ${missingFields.length === 1 ? "is" : "are"} required`,
                { status: 400 }
            );
        }
        console.log(name, userId, address);

        const store = await prismadb.store.create({
            data: {
                name,
                userId,
                address
            }
        })
    
    } catch (error) {
        console.log("[STORE_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}