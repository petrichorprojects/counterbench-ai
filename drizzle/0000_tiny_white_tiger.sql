CREATE TABLE "receptionist_calls" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firm_id" varchar NOT NULL,
	"caller_number" text,
	"transcript" text,
	"structured_data" text,
	"duration" numeric,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "receptionist_firms" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone_number" text NOT NULL,
	"attorney_email" text NOT NULL,
	"attorney_phone" text NOT NULL,
	"case_types" text,
	"callback_time" text DEFAULT '30 minutes',
	"active" text DEFAULT 'true',
	"created_at" timestamp DEFAULT now() NOT NULL
);
