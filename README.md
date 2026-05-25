# ToolShed

Community tool sharing for your house. List tools, borrow from neighbors, build community.

## Local development

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run seed        # adds demo data (optional)
npm run dev
```

Open http://localhost:3000. Demo accounts: `alice@toolshed.local` / `bob@toolshed.local` (password: `password123`).

## Deploy to Railway

1. Create a free account at [railway.app](https://railway.app)
2. Click **New Project** > **Deploy from GitHub repo** > select this repo
3. Add a **Volume** (mount path: `/data`)
4. Set environment variables:
   - `DATABASE_URL` = `file:/data/toolshed.db`
   - `JWT_SECRET` = any long random string
5. Railway auto-detects the Dockerfile and deploys
6. Open the generated URL on your phone and share it with housemates

After first deploy, seed demo data (optional):
```bash
railway run npm run seed
```
