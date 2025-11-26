import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import Papa from "papaparse";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const name = searchParams.get("name");
    const email = searchParams.get("email");

    const where: any = {};

    if (role) {
      where.role = role.toUpperCase() as "USER" | "ADMIN";
    }

    if (name) {
      where.name = {
        contains: name,
        mode: "insensitive",
      };
    }

    if (email) {
      where.email = {
        contains: email,
        mode: "insensitive",
      };
    }

    const users = await prismadb.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (users.length === 0) {
      return new NextResponse("No users found", { status: 404 });
    }

    const csvData = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
    }));

    const csv = Papa.unparse(csvData, {
      header: true,
      columns: ["id", "name", "email", "role", "created_at", "updated_at"],
    });

    const timestamp = new Date().toISOString().split('T')[0];
    let filename = `users_export_${timestamp}`;
    
    if (role) filename += `_${role.toLowerCase()}`;
    if (name) filename += `_name-${name}`;
    if (email) filename += `_email-${email}`;
    
    filename += '.csv';

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.log("[USER_EXPORT_CSV]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}