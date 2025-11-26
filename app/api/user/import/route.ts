import { validateCsvFile } from "@/lib/pipes";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import Papa from "papaparse";
import bcrypt from "bcryptjs";
import { RegisterUserSchema } from "@/dto/user.dto";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("File is required", { status: 400 });
    }

    const isValid = validateCsvFile(file);

    if (!isValid) {
      return new NextResponse("Invalid file format", { status: 400 });
    }

    const text = await file.text();
    const parsed = Papa.parse(text, { 
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase()
    });

    const valid: any[] = [];
    const invalid: any[] = [];
    const skipped: any[] = [];

    for (let index = 0; index < parsed.data.length; index++) {
      const row: any = parsed.data[index];
      
      const userData = {
        name: row.name?.trim() || "",
        email: row.email?.trim() || "",
        password: row.password?.trim() || "",
        role: row.role?.trim().toUpperCase() as "USER" | "ADMIN" | undefined,
      };

      const validation = RegisterUserSchema.safeParse(userData);

      if (!validation.success) {
        const errors = validation.error.issues.map(err => 
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        
        invalid.push({ 
          row: index + 2,
          reason: errors,
          data: row 
        });
        continue;
      }

      try {
        const existingUser = await prismadb.user.findUnique({
          where: { email: validation.data.email },
        });

        if (existingUser) {
          skipped.push({
            row: index + 2,
            reason: "User already exists",
            email: validation.data.email
          });
          continue;
        }
      } catch (error) {
        console.error(`Error checking user at row ${index + 2}:`, error);
        invalid.push({
          row: index + 2,
          reason: "Database error checking user",
          email: validation.data.email
        });
        continue;
      }

      valid.push(validation.data);
    }

    const created = [];
    const creationErrors = [];

    for (const userData of valid) {
      try {
        const hashedPassword = await bcrypt.hash(userData.password, 16);

        const user = await prismadb.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role || "USER",
          },
        });

        created.push({
          email: user.email,
          name: user.name,
          role: user.role
        });
      } catch (error) {
        console.error(`Error creating user ${userData.email}:`, error);
        creationErrors.push({
          email: userData.email,
          reason: "Failed to create user in database"
        });
      }
    }

    return NextResponse.json({
      message: "File processed",
      imported: created.length,
      skipped: skipped.length,
      invalid: invalid.length + creationErrors.length,
      details: {
        created,
        skipped,
        invalid: [...invalid, ...creationErrors]
      }
    });
  } catch (error) {
    console.log("[USER_IMPORT_CSV]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}