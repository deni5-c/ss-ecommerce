import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { upperCasePipe } from "@/lib/pipes";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);        
    const isUppercase = searchParams.get("isUppercase") === "true";
    let name = searchParams.get("name");

    let users = await prismadb.user.findMany({
      where: name
        ? {
            name: {
              contains: name,
              mode: "insensitive",
            },
          }
        : {},
    });

    users = isUppercase
      ? users.map((user) => ({
          ...user,
          name: upperCasePipe(user.name),
        }))
      : users;

    return NextResponse.json(users);
  } catch (error) {
    console.log("[USER_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}