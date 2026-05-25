import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tool = await prisma.tool.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, apartment: true, phone: true } },
      borrowRequests: {
        include: { borrower: { select: { id: true, name: true, apartment: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!tool) {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  }

  return NextResponse.json({ tool });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const tool = await prisma.tool.findUnique({ where: { id } });
  if (!tool || tool.ownerId !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const data = await request.json();
  const updated = await prisma.tool.update({ where: { id }, data });
  return NextResponse.json({ tool: updated });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const tool = await prisma.tool.findUnique({ where: { id } });
  if (!tool || tool.ownerId !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  await prisma.borrowRequest.deleteMany({ where: { toolId: id } });
  await prisma.tool.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
