#!/usr/bin/env fish
# Weekly signal sourcing — opens 6 pre-scoped search tabs in default browser.
# Run every Monday morning. Work each tab ~2 min. Copy hits to tasks/pipeline.csv.
# SOP: tasks/signal-sourcing-sop.md

set -l URLS \
    "https://www.indeed.com/jobs?q=personal+injury+paralegal&sort=date&fromage=14" \
    "https://www.linkedin.com/jobs/search/?keywords=paralegal%20personal%20injury&f_TPR=r604800&sortBy=DD" \
    "https://www.linkedin.com/jobs/search/?keywords=intake%20specialist%20personal%20injury&f_TPR=r604800&sortBy=DD" \
    "https://www.google.com/search?q=%22personal+injury+paralegal%22+site%3Aindeed.com&tbs=qdr:m" \
    "https://www.reddit.com/r/LawFirm/search/?q=paralegal&t=week&sort=new" \
    "https://www.reddit.com/r/Lawyertalk/search/?q=personal+injury+paralegal&t=week"

set -l LABELS \
    "Tab 1: Indeed — recent PI paralegal jobs" \
    "Tab 2: LinkedIn — recent PI paralegal jobs" \
    "Tab 3: LinkedIn — intake specialist / case manager" \
    "Tab 4: Google — reposted paralegal ads (60d+ = unfilled)" \
    "Tab 5: Reddit r/LawFirm — paralegal threads this week" \
    "Tab 6: Reddit r/Lawyertalk — PI paralegal this week"

echo "═══════════════════════════════════════════════════════════"
echo "  Signal Sourcing — Monday Routine (~15 min)"
echo "═══════════════════════════════════════════════════════════"
echo
echo "Target: 20 signals → 10 into pipeline.csv"
echo "SOP: tasks/signal-sourcing-sop.md"
echo

for i in (seq (count $URLS))
    echo "  $LABELS[$i]"
end
echo
read -P "Press Enter to open all 6 tabs (or Ctrl-C to abort): "

for url in $URLS
    open "$url"
    sleep 0.3    # tiny stagger so browser doesn't drop tabs
end

echo
echo "Tabs opened. Work each for ~2 min."
echo "Copy hits to tasks/pipeline.csv with columns:"
echo "  Date Found,Signal Source,Firm Name,Firm Size,Practice Area,"
echo "  Decision Maker,Contact Email,Stage,Day-0 Sent,Day-5 Sent,"
echo "  Day-10 Sent,Reply,Notes"
echo
echo "Score each Tier 1/2/3 per SOP. Keep top 10 for Tuesday batch."
