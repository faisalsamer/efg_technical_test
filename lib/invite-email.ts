// Invitation email for candidates, shared by the add-candidate flow and the "Send Email" dialogs.

interface InviteEmailInput {
  name: string
  email: string
  password: string
  timeLimitMinutes: number
  expiryAt: string
  loginUrl: string
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  const parts = []
  if (hours) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`)
  if (rest || !hours) parts.push(`${rest} minute${rest === 1 ? '' : 's'}`)
  return parts.join(' ')
}

export function buildInviteEmail({ name, email, password, timeLimitMinutes, expiryAt, loginUrl }: InviteEmailInput) {
  const expiry = new Date(expiryAt).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' }) + ' (MYT)'
  const duration = formatDuration(timeLimitMinutes)

  const subject = 'Upcoming Technical Assessment - Full-Stack Developer'
  const body = `Hi ${name},

Thank you for your interest in the Full-Stack Developer role at EzyFusion Group.

You have been invited to complete a timed technical assessment. Below is what to expect and your login credentials.

--- WHAT TO EXPECT ---

You will build part of a rent collection system for property managers: leases, invoices, cash, bank transfer and online payments, and access control for managers, staff and tenants. You will have ${duration}.

The test is designed for developers who use AI assistants such as Claude Code, and AI tools are allowed. What we assess is whether you understand and control what you build:
- Hidden automated tests check the edge cases.
- You will submit the logs of your AI sessions.
- If you pass, the interview starts with a walkthrough of your code.

Tech stack:
- Next.js 16 (App Router) with TypeScript
- Supabase (PostgreSQL, Auth, Row Level Security, Storage)
- Prisma ORM
- shadcn/ui + Tailwind CSS

You will be evaluated on:
- Correct money and date handling (rounding, timezones)
- Database design, Row Level Security and server-side authorization
- Concurrency and idempotency (payments and webhooks)
- Code quality, and how well you can explain your decisions

--- PREPARE BEFOREHAND ---

You will develop against a LOCAL Supabase stack (Docker + Supabase CLI), not a cloud project. We grade by running your migrations and seed script on our machine. Your timer starts at your first login, so set this up first:
- Node.js 20.9 or newer, Git and a GitHub account
- Docker Desktop, installed and running
- Supabase local development, following this guide: https://supabase.com/docs/guides/local-development
- Check it works: in an empty folder, run "npx supabase init" and then "npx supabase start", and open Supabase Studio at the URL it prints. The first start downloads several GB of images, so do this well before the test.
- Your AI tool of choice, signed in and working

--- YOUR CREDENTIALS ---

Login URL: ${loginUrl}
Email: ${email}
Password: ${password}

Time Limit: ${duration}
Account Expires: ${expiry}

--- IMPORTANT ---

- Your timer starts as soon as you log in for the first time.
- The timer cannot be paused or reset.
- You can edit your submission until your time runs out; after that it is final.
- Your account will expire on ${expiry}, after which you will no longer be able to access the test.

Candidates who pass will proceed directly to the interview stage.

Good luck!

Best regards,
EzyFusion Group`

  return { subject, body }
}
