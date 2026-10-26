# Bay Leaf: numeric comparison and data audit

Audit of the saved research dataset on October 25, 2026 Pacific. This audits existing evidence; it does not newly verify venue policies, availability or quotes.

## Recommended structure

**A compact numeric comparison, backed by a full venue accordion.** One metric per column, one unit per metric. Keep source wording, dates, conditions, contradictions and all 194 workbook fields in the breakdown.

The first version is implemented in Compare, Government and Potential spaces. Compare defaults to numeric columns and supports numeric minimum/maximum filtering, sorting and reset. The old research/category column views remain available. A dash means Unknown; it never means zero or No. Available platform ratings share one review column; unavailable platforms and search placeholders are omitted there.

## What is already usable as structured numbers

Counts refer to **discovery records**, not independent businesses. Values can be historic, directory-reported, conditional or incomplete; inspect the source and status in the accordion.

| Metric | Records with a structured value | Remaining Unknown |
|---|---:|---:|
| Max published capacity | 968 | 697 |
| Published seated capacity | 437 | 1,228 |
| Published standing capacity | 290 | 1,375 |
| Event fee lower bound | 247 | 1,418 |
| Event fee upper bound | 244 | 1,421 |
| Per-guest package lower bound | 61 | 1,604 |
| Per-guest package upper bound | 59 | 1,606 |
| Sourced numeric review score | 21 | 1,644 |
| Structured numeric construction year | 70 | 1,595 |

There are 1,665 records and 649 distinct parent-property **labels**; those labels have not been verified as unique independent properties. The records include 1,336 spaces, 244 property records, site groups and configurations/packages. A renamed property can create duplicate labels. Combined rooms and their subdivisions can describe the same inventory. A property-level rollup should use a stable property ID, not a name match.

Some usable numbers remain in narrative workbook answers. This table deliberately counts only typed numeric fields. An Unknown numeric cell does **not** mean the source contains no answer. Extracting those additional numbers with source and scope review is the next data-cleaning task.

## How Max capacity works

Max capacity is the largest **structured published figure attached to the same record**: seated, standing, generic, indoor or outdoor. It is not a sum of those alternatives or a legal occupancy determination. The winning figure's basis stays in the accordion.

Example: 150 seated and 225 standing becomes **Max capacity 225**, **Seated capacity 150**. A separate ballroom's count cannot be added. A theater's seated count does not establish tables and a dance floor. Among the 968 records with a max figure, **531 have no separately structured seated figure**.

For selecting an actual wedding, add a distinct **Dinner + dance capacity** metric after the layout is documented. Keep indoor rain-backup capacity separate too. A property rollup should take the highest individually bookable approved layout; it must not add simultaneous rooms unless concurrent use is explicitly supported.

## One combined review column

Show a sortable numeric score, followed by available platform scores, for example **GOOGLE: 3.5 · YELP: 2.7**. This is illustrative; it is not a score assigned to a venue in this dataset.

- Include only a recorded numeric score on a 0–5 scale with a source profile URL. Missing values and unverified search links contribute nothing.
- Deduplicate identical profile URLs if they appear in more than one review slot.
- When all available platform review counts are known and positive, use `sum(rating × count) ÷ sum(count)`.
- If a count is missing, use an equal-platform average and label that method in the breakdown. A single platform retains its own rating; it is not a multi-platform score.
- The displayed rating count is a sum of platform counts, **not deduplicated people**. People can review on multiple platforms. Platform audiences/scales differ, so this is an approximate comparison index, not a statistically calibrated quality measure.
- Preserve each platform's rating, count, URL, check date and scope. A hotel-stay, park or restaurant rating may say little about weddings; a property rating is not room-specific.

Currently Google and Yelp have **zero verified numeric scores** in the saved dataset. The 21 rated records use other recorded platforms. Combining columns does not manufacture Google or Yelp ratings or add new review research. Source checks date from the earlier research run; they are not refreshed by this audit.

## Next fields to quantify, in priority order

| Priority | Comparison field | Type / units | Required qualification kept in accordion |
|---|---|---|---|
| 1 | Dinner + dance guests; rain-backup guests | Separate integer counts | Exact room/layout, dance floor, concurrent use, seated versus standing |
| 1 | Venue fee min / max | Two USD/event numbers | Rental hours, season/day, residency/member status, effective date, refundable versus expense |
| 1 | Food min/max; bar min/max | USD/guest, separate components | Minimum guest count, package duration, service/tax bases, actual food included or service-only |
| 1 | Mandatory fixed charges; service %; tax %; minimum spend | Separate USD and percentage fields | Taxable base, mandatory versus optional, no deposits or booking credits counted twice |
| 1 | Scenario event total and cost/guest | Computed low/high USD | Same guest count, date/day, duration and inclusions; show known subtotal when any mandatory component is missing, never label it all-in |
| 1 | Indoor/outdoor music cutoff, guest departure, cleanup | Separate clock times; sortable minutes from event-day midnight | Next-day rollover, weekday/season, amplification, permission versus advertised availability; 8-hour duration is not an 8 PM cutoff |
| 2 | Parking spaces, lodging rooms, beds, toilets, included chairs/tables | Separate integer counts | Exclusive versus shared inventory, item sizes/types, shuttle/valet obligations, rooms versus beds |
| 2 | Event area; property area | Square feet; acres | Usable rentable area versus campus size; parcel scope and indoor/outdoor separation |
| 2 | Required security/coordination staff, labor hours, hourly rates | Counts, hours, USD/hour | Minimum booking/staffing rules, setup/breakdown responsibility, overtime |
| 2 | Hotel/airport travel | Minutes and miles | Named origin/destination, route, mode and time-of-day/date assumptions |
| 3 | Building year; first wedding year; current operator start | Separate years/dates | Different facts; preserve multiple-building scope and conflicts, never derive operation from copyright |
| 3 | Assessed value; asking price; actual closed sale; current appraisal; business value | Separate USD and dates | Full parcel/asset scope, evidence type, earnings basis, land owned versus leased; do not add duplicated real-estate/business earnings |

Prices already in the compact view are **components**, not normalized all-in event totals. A picnic site fee and a resort's base venue fee differ in what they buy; a range alone does not make them equivalent. A package upper bound stays Unknown if only a starting price is published.

## What should remain categorical

Keep county, property/room identity, venue type, vendor policy, wedding permission, accessibility status, restrictions and evidence quality as controlled categories. Binary fields may use Yes / No / Unknown only when the evidence explicitly supports that answer; conditional permission needs its own status. Do not treat category codes as quantities or turn Unknown into No.

Tables/chairs included, outside catering, BYOB, dance floor, amplified music and legal event use are useful explicit flags with conditions in the breakdown. They should not be inferred from marketing photos, a generic rental listing or a venue's silence.

## Evidence model and quality controls

Each normalized fact should carry **value, unit, record/property/room scope, capacity or price basis, source URL, original effective/publication date when known, checked date, evidence status and conflict note**. Maintain original text alongside normalized facts; never replace it.

Recommended field statuses: **Not yet extracted/researched; Searched—no reliable public answer; Requires venue confirmation; Conflicting evidence; Published evidence; Current written confirmation; Not applicable.** A numeric null alone cannot distinguish these. Migrate statuses using actual research logs, not a blanket assumption that every empty field was searched.

The current Fields answered (%) metric counts nonempty answers excluding explicit Unknown/pending text across the 194 criterion slots. It measures recorded-answer coverage, not confidence, completeness of mandatory costs, legal permission or business quality. Not-applicable fields still need a separate documented treatment before using this as a ranking score.

## Implementation now versus next work

**Implemented:** numeric summary, capacity basis preserved, separate seated metric, component price bounds, available-review aggregate, lazy full-record accordion including all workbook fields, numeric range filters, missing-value handling, reset and total-versus-matching record counts. No source facts were discarded and no new venue claims were researched.

**Next:** manually review/extract high-value narrative fields into typed facts; establish stable property and room IDs; normalize comparable event scenarios; verify missing review profiles and dates; introduce field-level research-status filters. Only then add user-adjustable weighted suitability rankings. A numeric-looking score without those foundations would hide uncertainty.

[Machine-readable audit and derived metrics](numeric-audit.json) · [Original research dataset](research.json)
