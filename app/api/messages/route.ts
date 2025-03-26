import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  try {
    const { db } = await connectToDatabase();
    const messages = await db
      .collection("messages")
      .find({})
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json(messages);
  } catch (error) {
    console.log("api message route error: ", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { db } = await connectToDatabase();
    const newMessage = { ...body, timestamp: new Date() };

    const result = await db.collection("messages").insertOne(newMessage);
    return NextResponse.json({ ...newMessage, _id: result.insertedId });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
