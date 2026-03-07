# Statushere Solid

A variation of the app from the [AT Proto Get Started tutorial](https://atproto.com/guides/statusphere-tutorial). This uses Solid and Convex instead of React and better-sqlite3.

## Setup

make sure `pnpm` is installed, and do a `pnpm install` to install other dependencies.

install `go` and `tap`, which is used to listen for at proto changes
and forward them to the webhook endpoint on this app:

```bash
brew install go
go install github.com/bluesky-social/indigo/cmd/tap
```

you need a `.env.local` file with contents like this:

```bash
# Deployment used by `npx convex dev`
CONVEX_DEPLOYMENT=GET_FROM_CONVEX_CLI

VITE_CONVEX_URL=http://127.0.0.1:3210

VITE_CONVEX_SITE_URL=http://127.0.0.1:3211
TAP_ADMIN_PASSWORD=ADD_YOUR_PASSWORD_HERE
```

## Developing

You need to have 3 terminals open to run Vite, Convex, and Tap:

```bash
$(go env GOPATH)/bin/tap run --webhook-url=http://localhost:3000/webhook --collection-filters=xyz.statusphere.status --admin-password="ADD_YOUR_PASSWORD_HERE"
```

```bash
pnpm dev
```

```bash
pnpm convex dev
```
