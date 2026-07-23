const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

async function getAccessToken() {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
        return null;
    }

    const response = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            refresh_token: GOOGLE_REFRESH_TOKEN,
            grant_type: "refresh_token"
        })
    });
    const data = await response.json();
    if (!response.ok || !data.access_token) {
        throw new Error(data.error_description || "Unable to authenticate with Google Calendar.");
    }
    return data.access_token;
}

export async function createGoogleMeetEvent({ name, email, startTime, endTime }) {
    const accessToken = await getAccessToken();
    if (!accessToken) {
        console.warn("Google Calendar is not configured. Returning a mock Meet link for development.");
        return { 
            eventId: `mock-event-${Date.now()}`, 
            meetLink: `https://meet.google.com/mock-link-${Math.random().toString(36).substring(2, 8)}` 
        };
    }
    const calendarId = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID || "primary");
    const requestId = `vk-live-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?conferenceDataVersion=1&sendUpdates=all`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                summary: "VK Services Enterprise — Live Session",
                description: `Live session scheduled for ${name}. The Google Meet joining details are included in this invitation.`,
                start: { dateTime: startTime, timeZone: "Asia/Kolkata" },
                end: { dateTime: endTime, timeZone: "Asia/Kolkata" },
                attendees: [{ email }],
                conferenceData: {
                    createRequest: {
                        requestId,
                        conferenceSolutionKey: { type: "hangoutsMeet" }
                    }
                }
            })
        }
    );
    const data = await response.json();
    const meetLink = data.hangoutLink || data.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri;
    if (!response.ok || !meetLink) {
        throw new Error(data.error?.message || "Google did not return a Meet link. Please try again.");
    }
    return { eventId: data.id, meetLink };
}
