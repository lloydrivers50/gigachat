import type { Message } from "./types";

export async function postMessage(text: string): Promise<{ id: string }> {
  try {
    const response = await fetch("/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      // As far as I can tell this gets thrown and nothing catches it. The error is logged in the console, but the user doesn't get any feedback. We should probably show some kind of error message in the UI when this happens.
      throw new Error(`Error posting message: ${response.statusText}`);
    }
    // This is now { id: assistantMessage.id } so the casting here is not true to what is actually returned. Therefore it must change to reflect the actual return type, which is { id: string }
    const data = await response.json();
    return data as { id: string };
  } catch (error) {
    console.error("Failed to post message:", error);
    throw error;
  }
}

export async function getMessages(): Promise<Message[]> {
  try {
    const response = await fetch("/messages");
    if (!response.ok) {
      throw new Error(`Error fetching messages: ${response.statusText}`);
    }
    const data = await response.json();
    return data as Message[];
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    throw error;
  }
}
