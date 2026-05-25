import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const [incoming, outgoing] = await Promise.all([
    prisma.borrowRequest.findMany({
      where: { lenderId: user.id },
      include: {
        tool: { select: { id: true, name: true, category: true } },
        borrower: { select: { id: true, name: true, apartment: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.borrowRequest.findMany({
      where: { borrowerId: user.id },
      include: {
        tool: { select: { id: true, name: true, category: true } },
        lender: { select: { id: true, name: true, apartment: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({ incoming, outgoing });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { toolId, message, startDate, endDate } = await request.json();

  if (!toolId || !startDate || !endDate) {
    return NextResponse.json({ error: "Tool, start date, and end date are required" }, { status: 400 });
  }

  const tool = await prisma.tool.findUnique({ where: { id: toolId } });
  if (!tool) {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  }
  if (tool.ownerId === user.id) {
    return NextResponse.json({ error: "You can't borrow your own tool" }, { status: 400 });
  }

  const borrowRequest = await prisma.borrowRequest.create({
    data: {
      toolId,
      borrowerId: user.id,
      lenderId: tool.ownerId,
      message: message || null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
  });

  return NextResponse.json({ request: borrowRequest }, { status: 201 });
}
