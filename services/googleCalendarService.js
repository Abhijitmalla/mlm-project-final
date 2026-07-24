import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);
console.log("Refresh Token:", process.env.GOOGLE_REFRESH_TOKEN);    
oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const calendar = google.calendar({
    version: "v3",
    auth: oauth2Client
});

export async function createGoogleMeetEvent({
    name,
    email,
    startTime,
    endTime
}) {

    const event = {
        summary: `Live Session - ${name}`,
        description: "VK Services Enterprise Live Session\n\nImportant Note:\n- If you need to reschedule, please confirm before the meeting starts.\n- If you do not wish to join the meeting, please inform us at least 1 hour before the meeting starts.",

        start: {
            dateTime: startTime,
            timeZone: "Asia/Kolkata"
        },

        end: {
            dateTime: endTime,
            timeZone: "Asia/Kolkata"
        },

        attendees: [
            {
                email
            }
        ],

        conferenceData: {
            createRequest: {
                requestId: Date.now().toString(),
                conferenceSolutionKey: {
                    type: "hangoutsMeet"
                }
            }
        }
    };

    const response = await calendar.events.insert({

        calendarId: process.env.GOOGLE_CALENDAR_ID,

        conferenceDataVersion: 1,

        sendUpdates: "all",

        resource: event

    });

    return {

        eventId: response.data.id,

        meetLink:
            response.data.conferenceData.entryPoints.find(
                e => e.entryPointType === "video"
            ).uri

    };

}