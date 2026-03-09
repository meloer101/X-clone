type SSEController = ReadableStreamDefaultController<Uint8Array>;

const connections = new Map<string, SSEController>();

export function addConnection(userId: string, controller: SSEController) {
  connections.set(userId, controller);
}

export function removeConnection(userId: string) {
  connections.delete(userId);
}

export function sendNotification(userId: string, data: object) {
  const controller = connections.get(userId);
  if (!controller) return;

  try {
    const encoder = new TextEncoder();
    const message = `data: ${JSON.stringify(data)}\n\n`;
    controller.enqueue(encoder.encode(message));
  } catch {
    connections.delete(userId);
  }
}
