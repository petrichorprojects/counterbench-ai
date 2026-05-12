import { pgTable, varchar, text, timestamp, numeric } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const contactSubmissionsTable = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  firmName: text("firm_name"),
  firmSize: text("firm_size"),
  helpArea: text("help_area"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const complianceTemplatesTable = pgTable("compliance_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  state: varchar("state").notNull(),
  ruleType: text("rule_type").notNull(),
  constraintText: text("constraint_text").notNull(),
  exampleCompliant: text("example_compliant"),
  exampleNonCompliant: text("example_non_compliant"),
  sourceCitation: text("source_citation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const receptionistFirmsTable = pgTable("receptionist_firms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  attorneyEmail: text("attorney_email").notNull(),
  attorneyPhone: text("attorney_phone").notNull(),
  caseTypes: text("case_types"),
  callbackTime: text("callback_time").default("30 minutes"),
  active: text("active").default("true"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const receptionistCallsTable = pgTable("receptionist_calls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firmId: varchar("firm_id").notNull(),
  callerNumber: text("caller_number"),
  transcript: text("transcript"),
  structuredData: text("structured_data"),
  duration: numeric("duration"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
