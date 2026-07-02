# Quick Start

## Prerequisites

- Node.js (recommended v18+)
- npm  11.16.00
- .NET 10 SDK

## Backend Setup

```bash
git clone https://github.com/MicahArmantrout/TaskOrchestratorAPI
cd TaskOrchestratorAPI
```

Add your Google Client ID to `appsettings.json`:

```json
"Authentication": {
  "Google": {
    "ClientId": "your-google-client-id.apps.googleusercontent.com"
  }
}
```

The email will have the Client ID. 

Run the API:

```bash
dotnet run
```

## Frontend Setup

```bash
git clone https://github.com/MicahArmantrout/TaskOrchestratorUI
cd TaskOrchestratorUI
npm install
```

Create a `.env` file in the project root:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_API_BASE_URL=http://localhost:5112
```


Notes:

- `VITE_GOOGLE_CLIENT_ID` is required for Google Sign-In thus required for the app to work correctly. 
- `VITE_API_BASE_URL` is optional. If omitted, the app calls `/api` (Vite proxy).
- The Client ID is shared by email and intentionally not committed to source control.

Run the UI:

```bash
cd TaskOrchestratorAPI
npm run dev
```

Open the URL printed by Vite (typically `http://localhost:5173`).

## Google Sign-In Configuration

If ports or hostnames change from defaults, Google Sign-In may fail with `Access blocked: Authorization Error`.

Make sure your OAuth client in Google Cloud has the correct Authorized JavaScript origins, for example:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

Also make sure:

- `VITE_GOOGLE_CLIENT_ID` matches the configured OAuth client.
- The backend validates the ID token `aud` claim against that same client ID.

If needed, you can create your own OAuth client. This short guide will help:
https://www.youtube.com/shorts/KT5yqal1-7A

## Backend Test Notes

Backend test file: `TaskOrchestratorAPI.http`

To get a Google ID token for testing, temporarily log the credential in the UI callback(app.tsx line 89): 

```ts
console.log('token: ' + response.credential);
```

After signing in, copy the token from the browser console and use it for your API tests.

For the current test setup, you need credentials from two different Google users who's tokens can be set at the top of `TaskOrchestratorAPI.http`.

## Features

- Dark / Light mode
- Add tasks
- Edit tasks
- Multi-user support
- Google Sign-In
- Data persists when API/UI restarts
- Security-focused API usage

## If I Had Another Day

- Share tasks with another user
- Sub-tasks
- Export / import tasks
- Import Outlook task format
- Reminders (with browser popups)
- add O-Auth Microsoft sign-in, Github sign-in, apple sign-in

## Out of Scope / Known Notes

- Due dates were intentionally excluded to keep complexity low (time zones and date formats).
- Advanced grid features were not included (could be added later with a third-party grid).
- You may see a 403 in browser console. This is non-fatal background traffic.
- You may see `The given origin is not allowed for the given client ID` in browser console when origin configuration is missing. This is non-fatal error in this app.
- You may see `Cross-Origin-Opener-Policy policy would block the window.postMessage call` in browser console. This is non-fatal error in this app.
- you may see `Access blocked: Authorization Error` if the OAuth setup betweeen google and the react app / api is incorrect
