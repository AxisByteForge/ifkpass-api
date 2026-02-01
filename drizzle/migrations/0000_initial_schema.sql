CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"cpf" varchar(20),
	"phone" varchar(20),
	"birth_date" timestamp,
	"city" varchar(255),
	"dojo" varchar(255),
	"rank" varchar(255),
	"sensei" varchar(255),
	"photo_url" varchar(500),
	"card_id" varchar(255),
	"payment_details" jsonb,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "status_idx" ON "users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "created_at_idx" ON "users" USING btree ("created_at");