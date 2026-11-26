# Disabled docs (hidden from docs.esimfly.net)

Phone-number line endpoints hidden on 2026-11-26 at Akam's request (the endpoints still exist in the API):
Renew eSIM, Replace eSIM (new number), Auto-renew.

Nothing here is built or served: Docusaurus only builds docs/ and serves static/.
To bring a page back: git mv it back to docs/api/ (and its prompt to static/llm/), then re-add it to
sidebars.js, src/prompts/index.js, static/llms.txt, docs/llm-integration.md and the links in
create-order.md / cancel-esim.md / packages.md / api-reference.md - see git commit 0155970 for the original wiring.
