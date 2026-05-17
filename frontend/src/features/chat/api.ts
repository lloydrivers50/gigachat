import type { Message } from "./types";

export async function postMessage(text: string): Promise<Message> {
  try {
    const response = await fetch("/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Error posting message: ${response.statusText}`);
    }
    const data = await response.json();
    return data as Message;
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
