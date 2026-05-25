import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const tools = await prisma.tool.findMany({
    where,
    include: { owner: { select: { id: true, name: true, apartment: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tools });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { name, description, category, imageUrl, deposit } = await request.json();

  if (!name || !description || !category) {
    return NextResponse.json({ error: "Name, description, and category are required" }, { status: 400 });
  }

  const tool = await prisma.tool.create({
    data: {
      name,
      description,
      category,
      imageUrl: imageUrl || null,
      deposit: deposit ? parseFloat(deposit) : null,
      ownerId: user.id,
    },
    include: { owner: { select: { id: true, name: true, apartment: true } } },
  });

  return NextResponse.json({ tool }, { status: 201 });
}
