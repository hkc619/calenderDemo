import { google } from "googleapis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: session.access_token });

  const calendar = google.calendar({ version: "v3", auth });
  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 20,
    singleEvents: true,
    orderBy: "startTime",
  });

  return Response.json(res.data.items);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  const body = await req.json();

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: session.access_token });

  const calendar = google.calendar({ version: "v3", auth });
  const event = {
    summary: body.title,
    description: body.description,
    start: { dateTime: body.start },
    end: { dateTime: body.end },
  };

  const result = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
  });

  return Response.json(result.data);
}
