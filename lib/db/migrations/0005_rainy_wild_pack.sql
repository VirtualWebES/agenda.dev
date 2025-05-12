ALTER TABLE "todos" ALTER COLUMN "workspace_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workspace_members" ALTER COLUMN "workspace_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workspace_members" ALTER COLUMN "user_id" SET NOT NULL;