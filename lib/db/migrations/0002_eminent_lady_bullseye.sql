ALTER TABLE "comments" ADD COLUMN "text" text NOT NULL;--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "due_date" text;--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "urgency" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "content";