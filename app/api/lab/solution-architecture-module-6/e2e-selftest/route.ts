import { NextResponse } from "next/server";

const branchFunctionUrl = "https://xblzfoqbryibmabjhdyj.supabase.co/functions/v1/adaptive-runtime-e2e";
const branchAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibHpmb3FicnlpYm1hYmpoZHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMjk2MDMsImV4cCI6MjEwMzcwNTYwM30.kpNznZv0--AM7p7y4QqpUfqxFDZlFbAX1qybQicbjxU";

export async function GET() {
  if (process.env.VERCEL_ENV === "production") return new NextResponse(null, { status: 404 });

  const response = await fetch(branchFunctionUrl, {
    method: "POST",
    headers: {
      apikey: branchAnonKey,
      Authorization: `Bearer ${branchAnonKey}`,
      "content-type": "application/json",
    },
    body: "{}",
    cache: "no-store",
  });

  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
