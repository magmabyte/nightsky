import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await request.json();

  if (!["approved", "denied", "returned"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const borrowRequest = await prisma.borrowRequest.findUnique({ where: { id } });
  if (!borrowRequest) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (borrowRequest.lenderId !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const updated = await prisma.borrowRequest.update({
    where: { id },
    data: { status },
  });

  if (status === "approved") {
    await prisma.tool.update({
      where: { id: borrowRequest.toolId },
      data: { available: false },
    });
  } else if (status === "returned") {
    await prisma.tool.update({
      where: { id: borrowRequest.toolId },
      data: { available: true },
    });
  }

  return NextResponse.json({ request: updated });
}
