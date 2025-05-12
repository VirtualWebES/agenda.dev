CREATE TABLE "user_settings" (
	"user_id" text PRIMARY KEY NOT NULL,
	"reminder_minutes" integer DEFAULT 30 NOT NULL,
	"ai_suggested_reminders" boolean DEFAULT false NOT NULL,
	"weekly_review" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;