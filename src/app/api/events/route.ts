import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: (session as any).access_token });

  const calendar = google.calendar({ version: "v3", auth });
  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 20,
    singleEvents: true,
    orderBy: "startTime",
  });

  const events = res.data.items?.map((e) => ({
    id: e.id!,
    title: e.summary ?? "(No title)",
    start: e.start?.dateTime ?? e.start?.date ?? "",
    end: e.end?.dateTime ?? e.end?.date ?? "",
  }));

  return Response.json(events ?? []);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { title, start, end } = await req.json();

    if (!title || !start) {
      return new Response("Invalid request body", { status: 400 });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: (session as any).access_token });

    const calendar = google.calendar({ version: "v3", auth });

    const event = {
      summary: title,
      start: { dateTime: start },
      end: { dateTime: end || start },
    };

    const result = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    return Response.json(result.data);
  } catch (err: any) {
    console.error("POST /api/events Error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
