# CounterbenchAI Workshop Curriculum Deck

# AI for Legal Professionals: Hands-On Training That Actually Works

**Format:** In-person, full-day workshop (6 hours)
**Schedule:** 9:00 AM -- 4:00 PM (with breaks and lunch)
**Capacity:** 30--40 attendees per session
**Locations:** Boston, MA | Buffalo, NY
**Tiers:** Standard ($597) | Premium ($897) | Firm Package ($2,497 / up to 5 seats)

---

## Day-of Schedule Overview

| Time | Module | Format |
|------|--------|--------|
| 9:00 -- 9:15 | Welcome + Setup Check | Housekeeping |
| 9:15 -- 10:45 | Module 1: AI Fundamentals | Lecture + Live Demos |
| 10:45 -- 11:00 | Break | |
| 11:00 -- 12:30 | Module 2: Prompting That Works | Hands-On Workshop |
| 12:30 -- 1:15 | Lunch (provided) | |
| 1:15 -- 2:45 | Module 3: AI for Your Workflow | Applied Workshop |
| 2:45 -- 3:00 | Break | |
| 3:00 -- 4:00 | Module 4: Agents & Automation (40 min) + Module 5: Action Plan (20 min) | Demo + Individual Work |

---

## Pre-Workshop: Welcome + Setup Check (15 min)

**Purpose:** Get everyone logged in and ready. No wasted time once content starts.

**Facilitator checklist:**
- Confirm Wi-Fi connectivity for all attendees
- Verify everyone has a working ChatGPT or Claude account (free tier is fine)
- Distribute printed materials: Prompt Template Quick-Reference Card, exercise worksheets
- Quick show of hands: "Who has used ChatGPT/Claude before?" (calibrate pacing)
- Ground rules: No question is dumb. This is a judgment-free zone. Laptops open, phones away.

---

## Module 1: AI Fundamentals (90 min)

**Time split:** 50 min lecture/demo, 40 min interactive exercises

### Learning Objectives

1. Explain what AI and large language models actually do (and don't do) in plain language
2. Distinguish real AI capabilities from vendor hype and marketing claims
3. Identify 3+ legal tasks where AI adds immediate, measurable value today

### Key Talking Points

1. **What AI actually is:** Pattern recognition on text at massive scale. Not thinking. Not reasoning. Sophisticated autocomplete that's shockingly useful when you know what to ask.
2. **How LLMs work (no jargon version):** Trained on billions of documents. Predict the next word. Get better with context. Think of it like a very well-read junior associate who has read everything but experienced nothing.
3. **What AI is good at right now:** Summarization, drafting, pattern matching, research acceleration, classification, extraction. These are the bread and butter.
4. **What AI is bad at right now:** Citing real cases reliably (hallucination risk), understanding local court rules, nuanced legal judgment, anything requiring recent or jurisdiction-specific knowledge that wasn't in training data.
5. **The hallucination problem:** Why it happens, how to catch it, why "trust but verify" is the only acceptable approach. Reference the Mata v. Avianca case -- what went wrong and how to never be that lawyer.
6. **Hype vs. reality scorecard:** Walk through common vendor claims. "AI replaces paralegals" (false). "AI does 80% of discovery review" (overstated). "AI accelerates document review by 40-60%" (real, with caveats).
7. **The business case:** Firms billing 200+ hours/month on discovery review can realistically reclaim 30-50 hours with AI-assisted workflows. That's not replacement -- that's leverage.

### Live Demos (20 min within lecture time)

**Demo 1: Summarization (5 min)**
- Paste a 3-page deposition excerpt into Claude
- Show the raw output vs. a well-prompted summary
- Point: Same tool, wildly different results depending on how you ask

**Demo 2: Document Classification (5 min)**
- Feed 10 mixed documents (contracts, correspondence, pleadings) to AI
- Ask it to classify by type and relevance
- Point: This is 2 minutes of work that used to take 30

**Demo 3: Legal Research Starter (5 min)**
- Ask AI to outline arguments for/against a motion to compel
- Show where it's strong (issue spotting, argument structure) and where it fails (specific citations need verification)
- Point: Use AI as a research accelerator, not a research replacement

**Demo 4: The Hallucination Demo (5 min)**
- Deliberately ask AI to cite cases for an obscure legal question
- Show it generating plausible-sounding but fake citations
- Verify against Westlaw/Lexis
- Point: This is why you ALWAYS verify. The tool is powerful but not trustworthy on citations.

### Hands-On Exercise: "AI Capabilities Audit" (40 min)

**Setup:** Each table group (4-5 people) gets a worksheet listing 15 common legal tasks.

**Instructions:**
1. (10 min) For each task, rate it: "AI can do this well now" / "AI can help but needs human oversight" / "AI can't do this reliably yet." Work individually first.
2. (15 min) Compare answers at your table. Where do you disagree? Discuss why.
3. (10 min) Each table shares their top 3 surprises with the room.
4. (5 min) Facilitator reveals the "answer key" based on real-world data and addresses misconceptions.

**Task list for worksheet:**
1. Summarize a deposition transcript
2. Draft a demand letter from scratch
3. Review 500 documents for privilege
4. Cite relevant case law for a motion
5. Extract key dates from medical records
6. Draft interrogatory responses
7. Classify documents by issue/topic
8. Write a client-facing status update email
9. Identify inconsistencies across witness statements
10. Generate a medical chronology from records
11. Proofread a brief for Bluebook citation errors
12. Translate a contract clause into plain English
13. Draft a discovery plan
14. Analyze a contract for non-standard terms
15. Predict case outcome probability

**Materials needed:**
- Printed worksheet (one per attendee)
- Projector for live demos
- Facilitator laptop with ChatGPT Plus and Claude Pro accounts
- Pre-loaded demo documents (deposition excerpt, sample contracts, mixed document set)
- Wi-Fi password displayed prominently

---

## Module 2: Prompting That Works (90 min)

**Time split:** 30 min instruction, 60 min hands-on practice

### Learning Objectives

1. Write structured prompts that consistently produce usable legal work product
2. Identify and fix the 5 most common prompting mistakes legal professionals make
3. Build a personal prompt library of 5+ reusable templates for their daily tasks

### Key Talking Points

1. **Why most people get bad results:** They type vague, one-line prompts and blame the tool. "Summarize this document" is like telling a new hire "handle this case" with no context. Garbage in, garbage out.
2. **The anatomy of a good legal prompt:** Role + Context + Task + Format + Constraints. Every good prompt has these five elements. Skip one and results degrade.
3. **Role framing:** Tell the AI what it is. "You are an experienced litigation paralegal at a mid-size firm specializing in personal injury" produces dramatically different output than no role.
4. **Context loading:** Paste the actual document. Reference the jurisdiction. State the practice area. More relevant context = better output. But be selective -- don't dump 50 pages of irrelevant material.
5. **The 5 deadly prompting sins:** (a) Too vague. (b) No specified output format. (c) No constraints or guardrails. (d) Asking for too many things at once. (e) Not iterating -- treating the first output as final.
6. **Iteration is the skill:** The first output is a draft. Follow up: "Make this more concise." "Add citations for the privilege argument." "Format this as a table." The conversation IS the workflow.
7. **Temperature and tone control:** How to get formal vs. conversational output. When to ask for bullet points vs. narrative. How to request specific formatting that matches your firm's standards.

### Hands-On Exercise 1: "Fix This Prompt" (15 min)

**Setup:** Each attendee gets a handout with 5 bad prompts and their terrible outputs.

**Instructions:**
1. Read each bad prompt and its output
2. Rewrite the prompt using the Role + Context + Task + Format + Constraints framework
3. Test your rewritten prompt in ChatGPT or Claude
4. Compare your output to the bad version

**Bad prompts to fix:**
1. "Summarize this contract" --> Rewrite with specific extraction criteria
2. "Write me a letter to opposing counsel" --> Rewrite with tone, jurisdiction, and purpose
3. "What are the arguments for this motion?" --> Rewrite with case context and desired format
4. "Check this document for issues" --> Rewrite with specific review criteria
5. "Help me with discovery" --> Rewrite with specific discovery task and parameters

### Hands-On Exercise 2: "Build Your Prompt Library" (30 min)

**Setup:** Each attendee works on their own laptop.

**Instructions:**
1. (5 min) Write down 5 tasks you do every week that are repetitive and text-heavy
2. (20 min) Pick your top 3 and write a reusable prompt template for each. Use the framework. Test each one with real or sample data. Iterate until the output is genuinely useful.
3. (5 min) Save your templates somewhere you'll actually find them (Google Doc, Notion, Notes app, printed card)

**Facilitator circulates** during this exercise. Common coaching moments:
- "Your prompt is too long -- you're burying the actual task in context"
- "You didn't specify the output format -- that's why it's giving you a wall of text"
- "Try adding a constraint: 'Do not include any case citations unless I ask for them'"

### Hands-On Exercise 3: "Prompt Battle" (15 min)

**Setup:** Pair up with someone at your table.

**Instructions:**
1. Both partners write a prompt for the same task (provided by facilitator): "Draft a privilege log entry for an email between in-house counsel and the CEO discussing pending litigation strategy"
2. Both run their prompt
3. Compare outputs. Whose is more useful? Why?
4. Combine the best elements of both prompts into a final version
5. Volunteer pairs share their winning prompts with the room

**Materials needed:**
- Printed handout: 5 bad prompts + outputs
- Printed Prompt Template Quick-Reference Card (see appendix)
- Attendee laptops with ChatGPT or Claude access
- Sample documents for testing (redacted/anonymized)
- Timer visible to room (for pacing exercises)

---

## Module 3: AI for Your Workflow (90 min)

**Time split:** 35 min instruction/demo, 55 min hands-on practice

### Learning Objectives

1. Apply AI tools to at least 3 specific legal workflows they perform weekly
2. Build an end-to-end AI-assisted workflow for one high-volume task (discovery review, research, or intake)
3. Evaluate AI output quality and know when human review is non-negotiable

### Key Talking Points

1. **Discovery management with AI:** Bulk document classification, privilege review assistance, key document identification, deposition summary generation. This is where AI saves the most paralegal hours today.
2. **Document review automation:** Using AI to create first-pass review categories, extract key data points, flag anomalies, and generate review memos. The human still makes the call -- AI just surfaces what matters faster.
3. **Legal research acceleration:** AI as a research brainstorming partner. Generate issue lists, identify potential arguments, outline research memos. Then verify everything in Westlaw/Lexis. The AI cuts research time, not research rigor.
4. **Intake triage:** Using AI to process intake forms, extract case facts, identify potential claims, flag conflicts, and draft intake summaries. Turns a 30-minute intake write-up into 5 minutes of review and editing.
5. **Medical chronologies:** Feed medical records (or OCR'd versions) to AI. Extract dates, providers, diagnoses, treatments, procedures. Output a structured chronology. This alone justifies the workshop cost for PI firms.
6. **Contract review workflows:** Non-standard term identification, obligation extraction, comparison against playbook terms, risk flagging. Works especially well for high-volume, similar contracts (leases, NDAs, vendor agreements).
7. **Quality gates:** Every AI-assisted workflow needs a human checkpoint. Define where yours are BEFORE you start using AI in production. Document your QA process. Your firm's malpractice carrier will thank you.

### Hands-On Exercise 1: "Your Workflow, AI-Assisted" (30 min)

**Setup:** Choose your track based on practice area. Three tracks run simultaneously.

**Track A: Discovery & Document Review**
1. You have a set of 20 sample documents (emails, contracts, memos -- provided on USB or shared drive)
2. Use AI to: classify each document by type, identify the 5 most relevant to a hypothetical employment dispute, generate a privilege log for 3 flagged communications
3. Compare your AI-assisted output to the answer key
4. Time yourself -- how long did this take vs. your estimate for doing it manually?

**Track B: Legal Research & Drafting**
1. You receive a fact pattern (provided): Client slipped on ice in a commercial parking lot. Wants to know if they have a viable premises liability claim.
2. Use AI to: identify the key legal issues, outline arguments for and against liability, draft a 1-page research memo
3. Verify: Check at least 2 of the AI's legal assertions against a real source (Westlaw, Lexis, or Google Scholar)
4. Mark where the AI was right, where it was wrong, and where it was "close but not citable"

**Track C: Intake & Medical Records**
1. You receive a mock intake form and 5 pages of medical records (provided)
2. Use AI to: extract case facts from the intake form, generate a medical chronology from the records, draft an intake summary memo
3. Review the chronology: Are dates accurate? Are providers correctly attributed? Is anything missing?
4. Edit the intake summary into something you'd actually send to the supervising attorney

### Hands-On Exercise 2: "Build a Complete Workflow" (25 min)

**Setup:** Individual work. Everyone picks ONE task they do at least weekly.

**Instructions:**
1. (5 min) Map your current workflow: What are the steps? Where are the bottlenecks? What takes the most time?
2. (10 min) Redesign the workflow with AI assistance. Which steps does AI handle? Where are the human checkpoints? What's the QA process?
3. (5 min) Write the prompts you'd use at each AI-assisted step
4. (5 min) Estimate time savings. Be honest -- overestimating will disappoint you when you try this for real.

**Deliverable:** Each attendee leaves with a written 1-page workflow document they can implement immediately.

**Materials needed:**
- USB drives or shared folder with sample documents (20 docs for Track A, fact pattern for Track B, intake form + med records for Track C)
- Printed track instructions (color-coded: blue for A, green for B, orange for C)
- Workflow template worksheet (1 per attendee)
- Answer keys for Track A (facilitator reference only)
- Timer visible to room

---

## Module 4: Agents & Automation (60 min)

**Time split:** 35 min instruction/demo, 25 min hands-on

### Learning Objectives

1. Explain what AI agents are and how they differ from basic chatbot interactions
2. Identify 2-3 automation opportunities in their current workflows
3. Evaluate the major AI tools (Claude, ChatGPT, Copilot) and know when to use which

### Key Talking Points

1. **Chatbot vs. agent:** A chatbot answers one question. An agent completes a multi-step task. Think of it as the difference between asking someone a question and delegating a project. We're moving from Q&A to delegation.
2. **What agents can do today:** Process a batch of documents through a multi-step review pipeline. Monitor a docket and flag relevant filings. Automatically format and file intake summaries. These aren't sci-fi -- they're production-ready for firms willing to set them up.
3. **Simple automations anyone can build:** Using ChatGPT's Custom GPTs or Claude's Projects feature to create specialized assistants. A "contract reviewer" that always checks your firm's standard terms. An "intake processor" that follows your firm's intake protocol.
4. **Tool comparison -- honest assessment:**
   - **ChatGPT (OpenAI):** Best general-purpose tool. Wide plugin ecosystem. Custom GPTs are easy to build. Weakness: Tends to be verbose, citation hallucination rate is higher than Claude.
   - **Claude (Anthropic):** Best for long document analysis (200K token context window). More careful/conservative outputs. Weakness: Smaller ecosystem, fewer integrations.
   - **Microsoft Copilot:** Best if your firm is already on Microsoft 365. Native Word/Outlook/Teams integration. Weakness: Less powerful for complex legal tasks, pricing tied to enterprise licenses.
   - **Google Gemini:** Good for research tasks, strong multimodal capabilities. Weakness: Less proven in legal-specific workflows.
5. **When to use what:** Short tasks, quick drafts --> ChatGPT. Long documents, careful analysis --> Claude. In-app work (Word, email) --> Copilot. Pick the right tool for the job, not the one with the best marketing.
6. **Security and confidentiality:** Enterprise vs. free tiers. What happens to your data. How to use AI without violating client confidentiality. Opt-out of training data. Use enterprise plans. Never put client names in free-tier tools.
7. **Building your firm's AI policy:** Why you need one, what it should cover, how to get buy-in from partners. The firms that adopt AI fastest are the ones with clear guardrails, not the ones with no rules.

### Live Demo: Build a Custom GPT / Claude Project (10 min)

Walk through building a simple "Contract Review Assistant" in real time:
1. Create a new Custom GPT (or Claude Project)
2. Set the system prompt with firm-specific review criteria
3. Upload a sample contract playbook as reference material
4. Test it with a sample NDA
5. Show how the output matches your firm's review standards

### Hands-On Exercise: "Find Your Automation" (25 min)

**Setup:** Work in pairs.

**Instructions:**
1. (5 min) Each person lists their 3 most time-consuming repetitive tasks
2. (5 min) For each task, answer: Is it text-based? Is it repetitive? Does it follow a pattern? If yes to all three, it's an automation candidate.
3. (10 min) Pick one task and build a quick prototype:
   - Write the system prompt for a Custom GPT or Claude Project
   - Define what inputs it needs (document type, jurisdiction, etc.)
   - Test it once with sample data
4. (5 min) Share your automation idea with another pair. Get feedback.

**Materials needed:**
- Projector for live demo
- Facilitator laptop with ChatGPT Plus (Custom GPT creation) and Claude Pro (Projects)
- Printed "Automation Candidate Checklist" (one per attendee)
- Sample NDA and contract playbook for demo

---

## Module 5: Action Plan (30 min)

**Time split:** 5 min instruction, 20 min individual work, 5 min group share

### Learning Objectives

1. Create a concrete, personal 30-day AI adoption plan with specific milestones
2. Identify 3 "Monday morning" quick wins they can implement without any additional tools or approvals

### Key Talking Points

1. **The adoption curve is real:** Most people leave workshops excited and do nothing. The ones who succeed pick ONE thing and do it tomorrow. Not next week. Tomorrow.
2. **Monday morning wins:** Three things every attendee can do before Tuesday: (a) Set up a saved prompt for their most common task. (b) Use AI to summarize one document they'd normally read manually. (c) Share one thing they learned today with a colleague.
3. **The 30-day roadmap:** Week 1: Use AI for one task daily. Week 2: Build your prompt library to 10 templates. Week 3: Test AI on a real (non-critical) work task. Week 4: Present results to your team/supervisor and propose a broader workflow change.
4. **Getting buy-in:** How to talk to partners about AI adoption. Lead with time savings and dollar figures, not technology. "I can cut discovery review time by 30%" beats "I think we should use ChatGPT."
5. **Resources for continued learning:** CounterbenchAI community, recommended tools, follow-up materials. Premium attendees get a 1-on-1 follow-up session to troubleshoot.

### Hands-On Exercise: "My 30-Day AI Plan" (20 min)

**Setup:** Individual work on the printed Action Plan worksheet.

**Instructions:**

Fill in each section:

**Section 1: My Monday Morning Wins (do these before Tuesday)**
- Quick Win 1: _______________
- Quick Win 2: _______________
- Quick Win 3: _______________

**Section 2: My Top 3 AI-Ready Tasks**
(Tasks from your daily work that are text-heavy, repetitive, and pattern-based)
1. Task: _______________ | Tool I'll use: _______________ | Time savings estimate: ___
2. Task: _______________ | Tool I'll use: _______________ | Time savings estimate: ___
3. Task: _______________ | Tool I'll use: _______________ | Time savings estimate: ___

**Section 3: My 30-Day Milestones**
- Week 1 goal: _______________
- Week 2 goal: _______________
- Week 3 goal: _______________
- Week 4 goal: _______________

**Section 4: Who I Need Buy-In From**
- Person: _______________ | Their concern: _______________ | My pitch: _______________

**Section 5: My Accountability Partner**
(Exchange info with someone at the workshop. Check in weekly for 30 days.)
- Name: _______________ | Contact: _______________

**Group Share (5 min):**
3-4 volunteers share their Monday morning quick win with the room.

**Materials needed:**
- Printed Action Plan worksheet (one per attendee)
- Pens (yes, actual pens -- people fill in paper forms more thoughtfully)

---

## Appendix A: Prompt Template Quick-Reference Card

*Print double-sided on cardstock. One per attendee. Designed to live next to their keyboard.*

### THE 10 LEGAL PROMPTS THAT ACTUALLY WORK

**How to use this card:** Copy the template. Replace the [bracketed] sections with your specifics. Iterate on the output -- the first response is a draft, not a deliverable.

---

**1. Document Summary**
```
You are an experienced litigation paralegal. Summarize the following [document type] in [X] bullet points. Focus on: key parties, key dates, obligations/commitments, and any red flags. Output format: structured bullet points with headers.

[Paste document]
```

**2. Deposition Summary**
```
Summarize this deposition transcript. For each witness, list: (a) key admissions, (b) inconsistencies with prior statements or documents, (c) topics where the witness was evasive or non-responsive, (d) important dates/facts established. Keep it under [X] pages.

[Paste transcript]
```

**3. Privilege Log Entry**
```
Draft a privilege log entry for the following document. Include: date, author, recipient(s), document type, privilege asserted (attorney-client / work product / both), and a description that protects the privilege without revealing content. Jurisdiction: [state].

[Paste or describe document]
```

**4. Contract Review -- Non-Standard Terms**
```
Review this [contract type] against standard market terms. Flag any clauses that: (a) deviate significantly from market standard, (b) create unusual obligations for [our client's role], (c) contain ambiguous language that could be interpreted against us, (d) are missing but typically included. Output as a table: Clause | Issue | Risk Level | Recommendation.

[Paste contract]
```

**5. Legal Research Outline**
```
I'm researching [legal issue] in [jurisdiction]. Outline the key arguments for and against [specific position]. For each argument, note: the general legal principle, typical factual support, and common counterarguments. Do NOT cite specific cases -- I will verify case law separately. Structure as a numbered outline.
```

**6. Interrogatory Response Draft**
```
Draft responses to the following interrogatories on behalf of [party role] in a [case type] matter. Tone: professional, cooperative, but protective of privileged information. Include appropriate objections where the question is overbroad, unduly burdensome, or seeks privileged information. Jurisdiction: [state].

[Paste interrogatories]
```

**7. Medical Chronology**
```
Create a medical chronology from the following records. Format as a table with columns: Date | Provider | Facility | Diagnosis/Findings | Treatment/Procedure | Notes. List entries in chronological order. Flag any gaps in treatment longer than [X] days.

[Paste medical records or OCR text]
```

**8. Intake Summary**
```
From the following client intake notes, draft a case summary memo for the supervising attorney. Include: client information, incident summary (who/what/when/where), potential claims identified, statute of limitations considerations, immediate next steps recommended, and any red flags. Keep under 1 page.

[Paste intake notes]
```

**9. Email to Opposing Counsel (draft)**
```
Draft a professional email to opposing counsel regarding [topic]. Tone: firm but courteous. Key points to address: [list 3-5 points]. Do not concede [specific point]. Reference [specific agreement/order/rule] if relevant. Keep under [X] paragraphs.
```

**10. Document Classification**
```
Classify each of the following documents into these categories: [list categories, e.g., "Responsive/Non-Responsive/Privileged/Needs Further Review"]. For each document, provide: classification, confidence level (high/medium/low), and a one-sentence reason. Output as a numbered list matching the document numbers.

[Paste document descriptions or text]
```

---

## Appendix B: Pre-Workshop Prep Email

**Subject:** Your CounterbenchAI Workshop -- What to Bring + Quick Setup

Hi [First Name],

You're confirmed for the CounterbenchAI Workshop on [Date] at [Venue]. Here's what you need to do before you arrive.

**Bring:**
- Laptop (fully charged -- outlets available but limited)
- Charger
- A few sample documents from your work you'd like to try AI on (redact client names/PII -- use "Client A" and "Party B" as placeholders)

**Set up before you arrive (10 minutes):**

1. **Create a free ChatGPT account** at chat.openai.com (if you don't have one). Free tier works for the exercises, but ChatGPT Plus ($20/mo) gives better results. Your call.
2. **Create a free Claude account** at claude.ai (if you don't have one). Same deal -- free works, Pro is better.
3. **Test that both work:** Open each one, type "Hello," and confirm you get a response. That's it. If your firm's firewall blocks either site, let us know before the workshop: [support email].

**Don't worry about:**
- Being "good" at AI. That's literally why you're coming.
- Knowing anything about prompts, models, or technical AI terms. We start from zero.
- Bringing anything printed. We provide all materials.

**Day-of logistics:**
- Doors open at 8:45 AM. We start at 9:00 sharp.
- Address: [Venue address]
- Parking: [Parking info]
- Lunch is provided. Let us know about dietary restrictions by replying to this email.
- Dress code: Whatever you'd wear to a casual Friday. No suits required.

See you there.

-- CounterbenchAI Team

---

## Appendix C: Post-Workshop Resource List

### Tools

| Tool | Best For | Cost | Link |
|------|----------|------|------|
| ChatGPT (OpenAI) | General-purpose prompting, Custom GPTs | Free / $20/mo Plus | chat.openai.com |
| Claude (Anthropic) | Long document analysis, careful reasoning | Free / $20/mo Pro | claude.ai |
| Microsoft Copilot | In-app Word/Outlook/Teams integration | Included with M365 E3+ or $30/user/mo add-on | microsoft.com/copilot |
| Westlaw Edge AI | Legal research with verified citations | Via Thomson Reuters subscription | westlaw.com |
| Lexis+ AI | Legal research with verified citations | Via LexisNexis subscription | lexisnexis.com |
| CoCounsel | Thomson Reuters legal AI assistant | Via subscription | cocounsel.ai |

### Learning

| Resource | Type | Link |
|----------|------|------|
| Anthropic Prompt Engineering Guide | Free guide | docs.anthropic.com/en/docs/build-with-claude/prompt-engineering |
| OpenAI Prompt Engineering Guide | Free guide | platform.openai.com/docs/guides/prompt-engineering |
| CounterbenchAI Blog | Legal-specific AI content | counterbench.ai/blog |
| r/legaltech (Reddit) | Community discussion | reddit.com/r/legaltech |
| r/paralegal (Reddit) | Paralegal community | reddit.com/r/paralegal |

### Security & Compliance

| Topic | Resource |
|-------|----------|
| ChatGPT Enterprise data handling | openai.com/enterprise-privacy |
| Claude data retention policy | anthropic.com/privacy |
| ABA Formal Opinion 512 (Generative AI) | americanbar.org (search "Opinion 512") |
| Your state bar's AI ethics guidance | Check your state bar's website |

### Your Workshop Materials

All attendees receive digital copies of:
- This curriculum deck (PDF)
- Prompt Template Quick-Reference Card (printable)
- Exercise worksheets and answer keys
- Sample documents used in exercises
- Slide deck (PDF)

**Premium and Firm Package attendees also receive:**
- Recorded video walkthrough of all demos
- Extended prompt library (25 additional templates)
- 1-on-1 follow-up session booking link (Premium) or team debrief booking link (Firm)
- 30-day Slack community access (Firm Package)

---

## Appendix D: Facilitator Notes

### Room Setup
- Tables of 4-5 (not theater-style). People need to work in groups and on laptops.
- Projector + screen visible from all seats
- Whiteboard or flip chart for live notes
- Power strips at every table
- Printed materials pre-placed at each seat before doors open

### Pacing Notes
- Module 1 tends to run long because of Q&A. Cap Q&A at end of demos and redirect to break time if needed.
- Module 2 is the highest-energy module. The Prompt Battle exercise gets competitive -- lean into it.
- Module 3 tracks need clear signage. People will wander to the wrong track. Color-coded handouts help.
- Module 4 is after lunch -- energy dips. Open with the live demo to re-engage. Keep instruction tight.
- Module 5 feels short but it's intentional. People are tired. Respect their time. End 5 minutes early rather than dragging.

### Common Attendee Questions to Prepare For
1. "Is this going to replace my job?" -- No. Directly address this in Module 1. AI handles volume; paralegals handle judgment, client relationships, and quality. The paralegal who uses AI is more valuable, not less.
2. "My firm won't pay for ChatGPT Plus." -- Free tier works for most tasks. Claude's free tier is generous. Frame the $20/mo as a personal investment in career competitiveness.
3. "What about client confidentiality?" -- Address in Module 4. Enterprise tiers don't use your data for training. Free tiers might. Firm should have a policy. If they don't, we help them build one.
4. "This seems too complicated." -- It's not. If you can write an email, you can write a prompt. Module 2 proves this.
5. "I tried ChatGPT and it gave me bad results." -- That's a prompting problem, not an AI problem. Module 2 exists specifically for this.

### Post-Workshop Follow-Up Sequence
- **Day 0 (same day):** Thank-you email + digital materials download link
- **Day 3:** "Did you try your Monday morning quick win?" check-in
- **Day 7:** One new prompt template + tip
- **Day 14:** "How's Week 2 going?" + link to book Premium 1-on-1 (upsell for Standard attendees)
- **Day 21:** Case study from another attendee who implemented AI in their workflow
- **Day 30:** "Your 30-day plan ends today" + survey + invitation to CounterbenchAI platform (product funnel entry point)
