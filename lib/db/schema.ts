import { pgTable, varchar, text, timestamp, numeric, integer } from "drizzle-orm/pg-core";
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

// Anonymous benchmark rows from the Conflict Check Blind Spot Audit
// (/tools/conflict-check-audit). Deliberately carries NO PII: no name, no firm
// name, no email, no IP. Only the score, tier, and the three firmographics the
// user opts to share, so we can publish "firms like yours" benchmarks.
export const conflictAuditBenchmarksTable = pgTable("conflict_audit_benchmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  score: integer("score").notNull(), // 0–24
  tier: text("tier").notNull(), // documented | person_dependent | reactive | undocumented
  firmSize: text("firm_size"), // solo | 2-5 | 6-10 | 11-25 | 25+ | null
  state: varchar("state", { length: 2 }), // US 2-letter, or null
  practiceArea: text("practice_area"), // free text, clamped server-side, or null
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
