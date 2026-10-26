# Quantification implementation — October 25, 2026 Pacific

The approved audit changes are now implemented in the data model and comparison tools. Existing source facts remain preserved. **Implementation is not the same as finishing source verification:** conditional facts, missing quotes, inaccessible review profiles and unresolved property identities remain explicitly open.

## Use the comparison

1. **Column group:** choose Capacity, Costs, Time cutoffs, Amenities, Travel, History, Valuation or Policies to compare the typed facts. Numeric comparison remains the compact default; the original 194-field research views remain available.
2. **Property groups, research status & review coverage:** switch between all 1,665 records and one representative per source property group; filter a property name/ID; choose any typed fact or one of 194 workbook fields and its research status; find missing review platforms or identity-review cases.
3. **Comparable event scenario & optional assumptions:** set the guest count above, date, rental hours and scope. Blank assumptions stay Unknown. Choose the exact service/tax bases; custom subtotals are available. Use the Scenario columns and each venue's accordion for the cost breakdown.
4. **Optional preference ranking:** choose weights, desired indoor/outdoor music cutoff, vendor preference and optional cost target. No weights or budget target are imposed. Default evidence threshold is 100%. Use Ranking columns to sort the results and inspect the score's evidence coverage.

Settings are temporary planning inputs in this page; they do not change shared venue facts or send inquiries. Reset filters clears filtering; Clear scenario assumptions clears scenario inputs. Ranking weights remain under your control.

## Typed evidence, not numeric-looking guesses

88 typed field definitions now cover capacities, costs, deadlines, inventory, travel, history, valuation and categorical policies. Each extracted fact has a value, status, record scope, extraction method and reference to the original evidence. Unit definitions are centralized; original wording, source URLs/status, source checked date and known effective date are resolved from the referenced record. A missing original publication/effective date stays Unknown. Normalization date does not replace a source's checked date.

Seven statuses distinguish **Not yet extracted/researched; Searched—no reliable public answer; Requires venue confirmation; Conflicting evidence; Published evidence; Current written confirmation; Not applicable.** Empty original slots default to Not yet extracted; they are not automatically marked searched or unavailable. No current written confirmation is invented from an operator brochure or blank contract.

Source-derived values can still be old, conditional, directory-reported or part of a proposal. Provenance displays those limitations. Proposed hourly schedules remain Requires venue confirmation and are excluded from automatic scenario pricing. Conflicting alternatives are held out of the sortable scalar until reviewed.

## Results of the first extraction pass

| Field | Records with an extracted value |
|---|---:|
| Max published capacity | 968 |
| Seated capacity | 438 |
| Explicit dinner + dance count | 12 |
| Event fee minimum | 248 |
| Food-only minimum / guest | 24 |
| Refundable deposit | 157 |
| Indoor music cutoff | 22 |
| Outdoor music cutoff | 34 |
| Cleanup deadline | 22 |
| Security hourly rate | 16 |
| Recorded tables inventory | 27 |

These are counts of records, including repeated rooms/packages, not independent venues or current confirmed bookings. Many numbers are still in conditional narrative. The extraction review queue contains **3254 record/field cases**; they were not converted into unqualified numbers. For example,300seated with unknown dance-floor impact is not a300dinner/dance approval, and a rain tent for 50 does not establish full-event backup.

Explicit dinner/dance examples include county-published dine-and-dance layouts, the Argonaut Maritime Room's 2025 package, and V. Sattui's 170 with-dance versus 200 without-dance layout. These retain date/approval caveats. Picnic table counts are labeled as picnic inventory, not banquet rounds or added occupancy. Bedrooms, beds, tents/cabins and restroom rooms have separate units.

## Stable property and space IDs

All 1,665 records now have stable space/offer IDs and a property-group ID. The registry currently has **649 provisional source groups**. Existing record assignments persist across rebuilds; name edits do not silently recreate IDs. Grouping is not a title/ownership verification or a guarantee of independent inventory.

The property view shows the **highest max-capacity matching record** as representative. Its prices and other metrics belong to that same record; this is not an aggregate of cheapest prices and largest capacities from different rooms. Related rooms/packages remain in the accordion. No capacities, repeated reviews, tax assessments or transaction amounts are summed across alternative configurations.

There are **37 shared-source identity cases** queued for review. Shared government/directory/campus URLs do not prove duplicate properties, so no fuzzy identity merges are made. Actual property-level reconciliation remains research work.

## Cost scenarios

- Event fees, venue-only per-guest rates, food, bar, combined packages, service-only packages and food/bar spend floors are separate. A service-only outside-catering package is not food cost; unresolved allocation remains a gap. A venue-only per-guest charge is multiplied by guest count and compared against its venue minimum, not treated as a food/bar package. Separately identified cleaning charges remain separate components.
- Event fee min/max, hourly rates, included hours and overtime are distinct. Historic proposed rates are never silently treated as current adopted charges.
- Combined food/bar is used once; separate food/bar overrides use a separate-component scenario. A minimum spend contributes only a shortfall. A food/bar floor's service treatment needs a matching selected base.
- Service and tax need explicit charge bases; custom service-charge and taxable subtotals support exceptions. Tax rates are not supplied or guessed by this tool.
- Published additional ceremony charges need a choice to include/exclude them. Security can be calculated from explicit rate, guard count and billable hours, or explicitly treated as included in a fixed-cost assumption. Setup/cleanup staffing conditions remain in the evidence.
- Refundable security/damage deposits are cash requirements, not expenses. Credited booking payments are not charged twice. Conditional deposit tiers are held for review instead of choosing the largest amount.
- Missing mandatory components produce **Known subtotal—incomplete**, with an unresolved-item count and no complete upper total. A full set of user assumptions produces a **Planning estimate**, never a verified all-in venue quote. Date, guest layout, permit and contract applicability still need confirmation.

## Preference rankings

Selected weights use published dinner/dance capacity versus the guest target, indoor/outdoor music versus a chosen deadline, explicit outside-catering policy versus your rule, sourced reviews/5, and complete planning cost versus an optional cost target. Larger-than-needed capacity is not rewarded beyond full credit. Closed/explicitly disallowed sites are not ranked.

Missing criteria reduce ranking evidence coverage; they are not converted into No or zero. Default ranking needs evidence for every selected weight. If you lower the threshold, partial scores remain labeled with their coverage. A score is a preference aid, not proof of lawful wedding use, actual profitability or a completed feasibility study.

## Review verification update

Two additional exact venue/address profiles on **The Knot** were checked through the platform's web reader: [Deer Park Villa](https://www.theknot.com/marketplace/deer-park-villa-fairfax-ca-610322), 4.6 / 40 reviews; [Preservation Park](https://www.theknot.com/marketplace/preservation-park-oakland-ca-286295), 4.7 / 14 reviews. They are added as observations without overwriting the earlier WeddingWire source. Platform populations may overlap; summed counts are not unique people.

Deer Park Villa's operator page displays a Google 4.6 / 225 claim. It remains an **excluded candidate**, not a verified Google aggregate: the linked map yielded no readable rating/profile aggregate. Direct operator download failed certificate validation; direct platform downloads returned 403. No security check was disabled or access block bypassed. Original publication/update dates for those aggregate pages remain Unknown; checked dates are stored separately. No Yelp rating was invented.

## Remaining data work

The feature implementation and first whole-dataset extraction pass are complete. The identity and ambiguous-fact queues, missing review-profile verification, field-specific current quotes, current legal/permit approval and full-source completion remain research tasks. Numeric blanks are visible rather than fabricated. Travel counts and other source-unsupported metrics can legitimately remain Unknown.

[Normalization counts](normalization-audit.json) · [Original and normalized evidence](research.json)


## Documented search outcomes — October 26
A source-reviewed field with no reliable public answer now uses `research_attempts`: field ID, outcome, source URLs, checked date and factual search result. This is distinct from an unsearched blank. Numeric observations take precedence; a negative search never erases a known value. An unresolved capacity conflict remains null/conflicting with its evidence visible. Six new exact Zola profile aggregates preserve counts, platform URL, checked date and mixed couple/professional scope. No new Google/Yelp values were inferred.


## Food assumptions and dated booking holds — October 26

A food-cost override now requires its basis. The user-reported $50/person outside buffet is not prefilled globally. An outside-caterer estimate needs a sourced yes for outside catering; an approved list alone does not establish that the chosen caterer qualifies. A venue-specific quote can instead be entered as an explicit user assumption. Staffing, bar, rentals, taxes and other charges remain separate. Ralston White’s published own licensed/insured-caterer permission is recorded; its transport requirements can add costs.

Sourced date-limited booking holds now make a selected-date scenario incomplete and suppress its preference grade. Villa Chanticleer’s published January1–April9,2027hold is inclusive; absence of a matching hold does not establish availability. Invalid dates do not create complete estimates. Six event hours are not automatically six paid rental hours.

The comparison percentage is labeled Workbook answered: it counts recorded answers to194planner questions, separately from typed facts and research attempts. A low percentage does not mean no research occurred.
