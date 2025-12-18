# Supabase MCP Setup

This project provides scripts to run Model Context Protocol (MCP) servers for
Supabase, allowing AI assistants (Claude, Cursor, etc.) to interact with your
project.

## Options

### 1. Official Supabase MCP (Recommended for Management)

Allows you to manage your Supabase project (deploy functions, manage secrets,
etc) and potentially query data via the API.

**Prerequisites:**

- You must have a **Supabase Access Token**.
- Generate one here:
  [https://supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
- Add it to `.env.local`:
  ```bash
  SUPABASE_ACCESS_TOKEN=sbBp_...
  ```

**Config:** Add to your client configuration:

```json
"supabase": {
  "command": "/Users/miakh/source/akhweb/scripts/start-mcp-supabase.sh",
  "args": []
}
```

### 2. Postgres Raw Access (Recommended for Coding/Data)

Allows direct SQL access to the database using the connection string. Best for
inspecting schema and writing SQL queries during development.

**Prerequisites:**

- `DATABASE_URL` must be set in `.env.local` (Already verified).

**Config:** Add to your client configuration:

```json
"supabase-db": {
  "command": "/Users/miakh/source/akhweb/scripts/start-mcp-db.sh",
  "args": []
}
```

## Client Configuration Files

- **Claude Desktop:**
  `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Cursor:** `.cursor/mcp.json` (or Global Settings > MCP)

## Example Complete Config

```json
{
  "mcpServers": {
    "supabase": {
      "command": "/Users/miakh/source/akhweb/scripts/start-mcp-supabase.sh",
      "args": []
    },
    "supabase-db": {
      "command": "/Users/miakh/source/akhweb/scripts/start-mcp-db.sh",
      "args": []
    }
  }
}
```
