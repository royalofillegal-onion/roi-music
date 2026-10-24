# Welcome to your ROI Music project

## Project info

**URL**: https://roi-music.app

## How can I edit this code?

There are several ways of editing your application.

**Use ROI Development Platform**

Simply visit the [ROI Music Project](https://roi-music.app) and start developing.

Changes made via ROI platform will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in ROI platform.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [ROI Music Platform](https://roi-music.app) and click on Share -> Publish.

## Can I connect a custom domain to my ROI Music project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://roi-music.app/docs/custom-domain)

## MongoDB catalog and protected admin uploads

The web app keeps its bundled catalog for offline/static fallback. It also reads published songs from the optional Express/MongoDB API and combines those songs in Home and Search. Admin operations are always authorized by the backend: the current app's Supabase Auth access token is verified server-side and its user ID must be listed in `ADMIN_USER_IDS`. A frontend button or user-editable role is never trusted.

### Local setup (PowerShell)

1. Create a MongoDB Atlas database and a dedicated database user with access only to the `roi_music` database. Copy `backend/.env.example` to `backend/.env` and fill in the MongoDB URI, Supabase project URL and server-only service-role key, an administrator's Supabase user UUID, allowed frontend origins, and Cloudinary credentials. Do not put service role, MongoDB, or Cloudinary secrets in any `VITE_*` variable or commit `.env` files.
2. In the repository root run `npm install`, then `npm --prefix backend install`.
3. Seed sample metadata with `npm run seed:mongodb` (while `backend/.env` is configured).
4. Start the API in one terminal with `npm run dev:api`; start the Vite app in another with `npm run dev`.
5. Log in to the app with the Supabase account whose UUID is in `ADMIN_USER_IDS`. Open the account page and choose **Admin catalog** to upload MP3 and cover files, manage publishing, and delete records.

Run backend validation tests with `npm --prefix backend test`; run the frontend checks with `npm run lint` and `npm run build`.

The seed script writes only song metadata and the supplied public media URLs; it does not copy MP3 files into MongoDB. Confirm you have permission to distribute audio and artwork before publishing them. New uploads are stored through Cloudinary; configure the upload size, retention, and access policy for your deployment. The current upload flow uses publicly addressable Cloudinary delivery URLs, so it is intended for content you are authorized to make public, not private audio.

### Deployment/security notes

Deploy `backend/` as a separate Node service and set its environment variables in the host's secret manager. Set `FRONTEND_ORIGINS` to exact deployed origins, `ADMIN_USER_IDS` to approved Supabase UUIDs, and `VITE_MUSIC_API_URL` in the frontend build environment to the HTTPS API base URL (empty uses same-origin `/api`). Restrict MongoDB Atlas network access and user privileges. The API provides `/api/health` and MongoDB readiness at `/api/ready`; catalog reads are public but only published documents are returned. Admin list, create, update, delete, and uploads require a valid Supabase token and allowlisted ID. Uploads are capped at 30 MB and checked by content signature. Configure the production host with HTTPS, backups, dependency monitoring, and appropriate Cloudinary policies.

This optional API currently adds the Song catalog and admin upload/CRUD paths only; account, history, favorites, and playback state remain on the existing Supabase/local-storage implementation. There are no automated API integration tests yet, and a successful local app build does not verify live MongoDB, Supabase, or Cloudinary credentials.
