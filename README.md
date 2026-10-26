# Bay Leaf research atlas

Public map, venue comparisons, research wiki and inquiry drafts.

https://thenatanzi.github.io/bay-leaf-research/

Current coverage: 1665 discovery records across all nine Bay Area counties; not an exhaustive or fully verified venue census. Unknown facts are explicitly marked. Inquiry notes use browser-local storage and are not shared.

Edit the research and site deliberately, preserve source URLs and check dates, and push reviewed changes to main to update GitHub Pages. No private collaboration logs belong here.

Libraries: Leaflet 1.9.4 (BSD-2-Clause), Marked 15.0.12 (MIT), DOMPurify 3.2.6 (Apache-2.0/MPL-2.0). Inline distributions preserve license notices. Geography: US Census TIGERweb/geocoder. Basemap: OpenStreetMap.

Research update: Planner workbook has 194 fields across 18 categories, based on five reviewed PDFs plus practitioner and official guidance. Seventy-seven founder/education reading records have original publication dates or explicit unknown dates. Venue comparisons separate inclusions, catering/bar/other requirements, time cutoffs, building and operator history, cost-per-head basis, and property/business value. Values and history are unknown until supported. All comparison headings sort; search and category filters narrow results. Founder and planner-framework views are sortable/filterable. Sixty-seven discovery/fact-check audits are documented (65 venue passes plus two founder-library passes); full coverage and detailed fact verification remain underway.

## Per-venue planner tracking
Each venue has 194 criterion answer slots in `workbook_answers`. Null means unknown, never no or zero. Recorded answers include status, source URLs and evidence date. Comparison supports Wedding essentials, original overview, all criteria and 18 category views, column sorting and unanswered-field filtering. Visible horizontal navigation and pinned venue names keep the full table reachable. Editing shared research still happens in the repository; this comparison is a read-only research view.

## Census expansion (October 11, 2026 Pacific)
1665 discovery records, including properties, rooms, picnic sites, restricted facilities and aggregate site groups. 978 government-managed or partner records; 1164 unconventional records (categories overlap). Sixty-seven discovery/fact-check audits documented (65 venue passes plus two founder-library passes). 887 records have sourced approximate coordinates. Exact Census matches require matching state/county; failed, non-exact and ambiguous matches are held. Unmatched addresses and generic campus/office addresses remain unlocated. Rooms may share a campus point; these are not surveyed entrances. Government, Potential spaces and Coverage audit views are sortable/filterable; the audit contains 101 municipalities plus nine county/unincorporated workstreams. No county or full venue census is declared complete. Construction, operating dates and values remain unknown unless specific evidence supports them.

### Venue links and reviews
Venue names link to their operator website when identified, otherwise their rental or discovery source. Directory-only and excerpt-only evidence is labeled; operator permission is still unverified for those leads. Google, Yelp and other-review columns contain clearly labeled discovery search links until the exact venue listing is verified. Ratings, review counts and check dates remain Unknown until sourced; park or restaurant reviews do not automatically establish wedding quality.

Comparison loads 50 rows per page; filtering and sorting apply across every matching record. Six property WeddingWire aggregates and two Hyatt-displayed TripAdvisor aggregates have check dates and scope labels. Hotel-stay aggregates are not wedding or room-specific reviews. Direct TripAdvisor verification, Google and Yelp remain unverified.


## Numeric comparison and full breakdowns (October 25, 2026 Pacific)
Compare defaults to single numeric metrics with a lazy full-record accordion preserving all original notes and194workbook fields. Government and Potential use the same numeric summary. Max capacity is the highest structured published figure for a record, not a sum or approved dinner/dance occupancy. Separate seated capacity remains visible. Event fee and per-guest package bounds are component prices; inspect duration/basis/status in the breakdown.

Available sourced ratings share one review column; unavailable Google/Yelp/search placeholders are omitted. Count-weighted where all counts are known, equal-platform average otherwise; source scores/counts/dates/scope remain in the accordion. Review counts are not deduplicated people. Numeric filters and reset act across all matching records; pagination remains50rows. See the rendered Numeric comparison audit in the wiki, numeric-audit.md and numeric-audit.json for completeness counts, rules and next extraction priorities. No new venue/source facts were verified by this presentation audit. The older review-column description above documents the previous UI.


## Approved audit implementation — October25,2026Pacific
The current comparison includes a typed evidence layer, stable provisional property-group/space IDs, property representative view, field research-status filters, scope/type filters, source-aware cost scenarios and optional user-weighted preference rankings. See the rendered wiki route #normalization or normalization-guide.md. The original numeric audit is retained as the earlier baseline; its Next section predates this implementation. Research queues and missing/current-contract evidence remain explicit; software implementation does not certify complete venue research.

Rebuild typed facts with `python -I normalize-research.py`, then `python -I update_site.py` to embed the reviewed dataset. Run `node normalization-tests.cjs` for semantic/schema checks. Scripts use only the existing local dataset, no AI/API/network calls. Review extraction rules, source scope and generated queues before publishing. The ID registry is retained in research.json; do not discard it when refreshing source records. New primary-source observations are additive; never overwrite legacy source evidence silently.


## Overnight continuation — October26,2026Pacific
First new batch adds five distinct public spaces across two provisional properties: Crockett Community Center Auditorium and four Contra Costa College rooms.1670discovery records/651provisional groups,68historical-plus-new audits; not independent available wedding venues. New source registry and checkpoint page: overnight.html; all columns sort and search/category/status filters apply across the registry.31source channels queued, six indexes archived; no full-directory scrape claimed. Eventective/Zola profile candidates are pending exact-profile identity/county checks. Current public evidence includes Crockett eligibility-specific 8-hour rates and layout examples, retained without treating college fixed theater seats as banquet capacity or an eight-hour rental as a midnight cutoff.78municipal workstreams remain unaudited.


### Overnight checkpoint — October 26, 1:25 AM Pacific
1693 discovery records after audits69–71: ten further property/space leads and thirteen San Pablo municipal rooms. Six exact Zola venue-profile aggregates added (couple/professional review populations), one matched to existing Swedish American Hall. Plant Connection and Swedish headline/room capacity conflicts retained. Corte Madera policy confirms day-specific music21:00/22:00 and event22:00/23:00; Lefty Gomez requires20:00vacate. No midnight approval inferred. San Pablo PDF appendix effectiveSeptember1,2026 was rendered and checked; no maintenance/attendant double counting.76municipal workstreams remain unaudited. Sourced research_attempts now populate searched-no-answer/conflict statuses only where no numeric fact exists; known facts are preserved. Run normalization-tests.cjs and research-attempt-tests.cjs. Source/progress queue at overnight.html; legacy counts above describe earlier checkpoints.


### Overnight lodging checkpoint — October 26,2026Pacific
1695 discovery records /666provisional groups /72source audits; two additional package configurations are alternatives at existing properties, not two new independent venues. Comparison now has106typed fields and an Overnight stays group. Required and included lodging, minimum nights/unit-nights, late-night accommodation escalation and payer remain separate. Mandatory lodging totals stayUnknown without a proposal, and speculative guest payments are never deducted. Booking/security-hour minimums and overlapping percentage bases are guarded. See #lodging in the atlas and lodging-and-hidden-costs.md.76municipal workstreams still unaudited; the five final critical passes remain pending.


### Municipal checkpoint — October 26, 2026
1730 discovery records / 686 provisional property groups / 74 source audits. Audits73–74 add35 space/configuration records and reconcile existing Sausalito records.71 municipal workstreams remain unaudited; reviews elsewhere remain partial. Piedmont separates midnight event access from23:00 indoor music. Pleasanton October2026fees/policy and LARPD room/seasonal tables reviewed; food restrictions, vendor licensing, conditional staffing/dumpster/impact permits and refundable deposits remain distinct. Source registry now includes40 channels with actual collection/blocked states. No claim of a current complete all-in quote or comprehensive venue availability. Five final critical audit passes remain pending.
