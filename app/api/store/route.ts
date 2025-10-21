import { CreateStoreDTO, CreateStoreSchema } from "@/dto/store.dto";
import { requireAuth } from "@/lib/auth";
import { validationPipe } from "@/lib/pipes";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(
    req: Request
) {
    try {
        const auth = requireAuth(req);
        const body = await req.json();

        if (auth instanceof NextResponse) {
            return auth;
        }

        const { id: userId } = auth;
        const { name, address } = await validationPipe<CreateStoreDTO>(CreateStoreSchema, body);

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const store = await prismadb.store.create({
            data: {
                name,
                userId,
                address,
            },
        });

        return NextResponse.json({ message: "Store created", store });
    } catch (error) {
        if (error instanceof Error) {
            return new NextResponse(error.message, { status: 400 });
        }

        console.log("[STORE_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(
    req: Request
) {
    try {
        const stores = await prismadb.store.findMany();
        return NextResponse.json(stores);
    } catch (error) {
        console.log("[STORE_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}