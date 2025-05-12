-- Add workspaces table
CREATE TABLE workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Add workspace_members table
CREATE TABLE workspace_members (
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (workspace_id, user_id)
);

-- Add workspace_id column to todos for associating tasks with workspaces
ALTER TABLE todos ADD COLUMN workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE; 