import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return new Response("Webhook secret missing", { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch {
    return new Response("Webhook verification failed", { status: 400 });
  }

  const { type: eventType, data } = evt;

  if (eventType === "user.created" || eventType === "user.updated") {
    const {
      id,
      username,
      first_name,
      last_name,
      email_addresses,
      image_url,
    } = data;

    const name =
      [first_name, last_name].filter(Boolean).join(" ") || username || "User";
    const email = email_addresses?.[0]?.email_address ?? "";
    const finalUsername = username ?? `user_${id.slice(-8)}`;

    await prisma.user.upsert({
      where: { id },
      create: {
        id,
        username: finalUsername,
        name,
        email,
        avatarUrl: image_url,
      },
      update: {
        username: finalUsername,
        name,
        email,
        avatarUrl: image_url,
      },
    });
  }

  if (eventType === "user.deleted") {
    const { id } = data;
    if (id) {
      await prisma.user.delete({ where: { id } }).catch(() => {});
    }
  }

  return new Response("OK", { status: 200 });
}
