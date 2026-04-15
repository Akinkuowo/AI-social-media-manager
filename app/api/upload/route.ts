import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdirSync, existsSync } from "fs";

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = file.name.replace(/[^a-zA-Z0-9.\-]/g, "_");
    const newFilename = `${uniqueSuffix}-${filename}`;

    const uploadDir = join(process.cwd(), 'public/uploads');

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const path = join(uploadDir, newFilename);

    await writeFile(path, buffer);

    const fileUrl = `/uploads/${newFilename}`;

    return NextResponse.json({ url: fileUrl }, { status: 201 });

  } catch (error) {
    console.error("UPLOAD_ERROR", error);
    return NextResponse.json(
      { message: "Failed to upload file" },
      { status: 500 }
    );
  }
}
