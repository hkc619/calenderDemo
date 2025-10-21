import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  const accessToken = (session as any).access_token;
  // ✅ Debug：看這裡是不是 undefined
  //console.log("🔑 access token:", accessToken);
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

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
      return new Response("Unuthorized", { status: 401 });
    }

    const { title, start, end } = await req.json();

    if (!title || !start) {
      return new Response("Invalid request body", { status: 400 });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: (session as any).access_token });

    const calendar = google.calendar({ version: "v3", auth });
    // ✅ 檢查 start 是全日還是含時間
    const isAllDay = !start.includes("T");

    const event = {
      summary: title,
      description: JSON.stringify({
        type: "meal",
        status: "pending",
        mealType: "breakfast", // breakfast | lunch | dinner
        recipeId: recipe.id,
      }),
      start: isAllDay
        ? { date: start }
        : { dateTime: start, timeZone: "America/New_York" },
      end: isAllDay
        ? { date: end || start }
        : { dateTime: end || start, timeZone: "America/New_York" },
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

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new Response("Unauthorized", { status: 401 });

    const { id } = await req.json();
    if (!id) return new Response("Missing event ID", { status: 400 });

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: (session as any).access_token });
    const calendar = google.calendar({ version: "v3", auth });

    await calendar.events.delete({
      calendarId: "primary",
      eventId: id,
    });

    return new Response("Deleted", { status: 200 });
  } catch (err) {
    console.error("DELETE /api/events Error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new Response("Unauthorized", { status: 401 });

    const { id, status } = await req.json(); // 前端傳 event ID 與新狀態

    if (!id || !status)
      return new Response("Missing parameters", { status: 400 });

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: (session as any).access_token });
    const calendar = google.calendar({ version: "v3", auth });

    // 讀取舊的事件內容（以保留其他欄位）
    const oldEvent = await calendar.events.get({
      calendarId: "primary",
      eventId: id,
    });

    const oldData = oldEvent.data.description
      ? JSON.parse(oldEvent.data.description)
      : {};

    // ✅ 更新事件描述中的狀態
    await calendar.events.patch({
      calendarId: "primary",
      eventId: id,
      requestBody: {
        description: JSON.stringify({ ...oldData, status }),
      },
    });

    return new Response("Event updated", { status: 200 });
  } catch (err) {
    console.error("PATCH /api/events Error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
