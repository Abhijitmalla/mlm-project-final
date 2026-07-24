import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

export const googleAuth = (req, res) => {

    console.log("Redirect URI:", process.env.GOOGLE_REDIRECT_URI);

    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/calendar"
        ]
    });

    console.log("Auth URL:", url);

    res.redirect(url);
};

export const googleCallback = async (req, res) => {

    try {

        const code = req.query.code;

        const { tokens } = await oauth2Client.getToken(code);

        console.log(tokens);

        res.json(tokens);

    } catch (err) {
        res.status(500).json(err);
    }

};