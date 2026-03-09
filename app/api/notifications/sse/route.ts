import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { addConnection, removeConnection } from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      addConnection(userId, controller);

      // Send initial ping to confirm connection
      controller.enqueue(encoder.encode(": ping\n\n"));
    },
    cancel() {
      removeConnection(userId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
