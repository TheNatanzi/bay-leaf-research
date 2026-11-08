import importlib.util,unittest
from pathlib import Path
p=Path(__file__).with_name('source-resource-audit.py');spec=importlib.util.spec_from_file_location('audit',p);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class ResourceTests(unittest.TestCase):
 def test_generic_button_keeps_guide_context(self):
  rows=m.inventory('<h2>View the Sonoma County Wedding Guide</h2><a href="https://mydigitalpublication.com/publication/?m=45969&l=1">View Now</a>','https://www.sonomacounty.com/weddings/')
  self.assertEqual(rows[0]['kind'],'interactive_publication');self.assertIn('Wedding Guide',rows[0]['context_heading']);self.assertFalse(m.resources_reviewed(rows))
 def test_pdf_buttons_images_and_embeds(self):
  rows=m.inventory('<h2>Resources</h2><button data-url="/brochure.pdf">Download</button><a href="/pricing.pdf"><img alt="Wedding pricing"></a><iframe src="https://issuu.com/a/b"></iframe><iframe src="https://www.googletagmanager.com/ns.html"></iframe>','https://venue.example/')
  self.assertEqual([r['kind'] for r in rows],['pdf_document','pdf_document','interactive_publication'])
 def test_inline_button_target_is_read_not_executed(self):
  rows=m.inventory('''<h2>Packages</h2><button onclick="window.open('/prices.pdf')">View</button>''','https://venue.example/')
  self.assertEqual(rows[0]['url'],'https://venue.example/prices.pdf')
 def test_actions_and_pagination_are_not_discarded(self):
  rows=m.inventory('<a href="https://forms.example/">Submit Wedding Venue RFP</a><a href="?_p=11">11</a><a href="https://example.org/weddings/">Home</a>','https://example.org/weddings/wedding-venues/')
  self.assertEqual([r['kind'] for r in rows],['outbound_form','pagination','source_home']);self.assertEqual(rows[0]['state'],'excluded_action')
 def test_partial_or_empty_documents_never_count_as_reviewed(self):
  row={'kind':'interactive_publication','state':'reviewed','reviewed_utc':'2026-11-08T00:00:00Z','page_count':50,'reviewed_pages':[44]}
  self.assertFalse(m.resources_reviewed([row]));row['state']='unreadable_response';self.assertFalse(m.resources_reviewed([row]));row.update(state='reviewed',page_count=2,reviewed_pages=[1,2]);self.assertTrue(m.resources_reviewed([row]))
 def test_empty_accepted_response_is_not_a_download(self):
  self.assertFalse(m.usable_download(202,b''));self.assertFalse(m.usable_download(200,b'  '));self.assertTrue(m.usable_download(200,b'<html>Venue guide</html>'))
 def test_named_room_links_are_preserved(self):
  rows=m.inventory('<h2>Indoor Spaces</h2><a href="/165/Centre-Concord">Centre Concord</a><a href="/169/Willow-Pass">Willow Pass Community Center</a>','https://city.example/')
  self.assertEqual([x['kind'] for x in rows],['facility_profile','facility_profile']);self.assertTrue(all(x['state']=='pending' for x in rows))
 def test_navigation_and_footer_do_not_become_venue_leads(self):
  rows=m.inventory('<nav><h2>Facility Rentals</h2><a href="/x">City Hall</a><img></nav><main><h2>Facilities</h2><a href="/y">Garden Room</a></main><footer><a href="/z">Town Hall</a></footer>','https://city.example/')
  self.assertEqual([x['label'] for x in rows],['Garden Room'])
 def test_literal_assignment_target_is_not_executed(self):
  rows=m.inventory('''<button onclick="window.location.href='/guide.pdf'">View now</button>''','https://venue.example/')
  self.assertEqual(rows[0]['url'],'https://venue.example/guide.pdf')
 def test_reviewed_pages_must_be_actual_complete_page_range(self):
  row={'kind':'pdf_document','state':'reviewed','reviewed_utc':'2026-11-08','page_count':2,'reviewed_pages':[99,100]}
  self.assertFalse(m.resources_reviewed([row]));row['reviewed_pages']=[1,2];self.assertTrue(m.resources_reviewed([row]))
 def test_truncated_bytes_are_not_success(self):
  self.assertFalse(m.usable_download(200,b'123',content_length=8));self.assertFalse(m.usable_download(200,b'123',limit=3));self.assertTrue(m.usable_download(200,b'123',content_length=3,limit=4))
 def test_publication_host_lookalikes_are_not_publication_sites(self):
  self.assertIsNone(m.classify('https://issuu.com.example.net/'))
  self.assertEqual(m.classify('https://viewer.heyzine.com/issue'),'interactive_publication')
 def test_room_anchors_and_accessible_labels_survive(self):
  rows=m.inventory('<h2>Facilities</h2><a href="#main" aria-label="Main Hall"></a><a href="#side">Side Room</a><a href="#" data-href="/fees.pdf" title="Rental fees"></a>','https://city.example/rentals')
  self.assertEqual(len(rows),3);self.assertEqual(rows[0]['url'],'https://city.example/rentals#main');self.assertEqual(rows[1]['url'],'https://city.example/rentals#side');self.assertEqual(rows[2]['kind'],'pdf_document')
 def test_unvalued_accessibility_attributes_do_not_drop_brochures(self):
  rows=m.inventory('<h2>Wedding Information</h2><a href="/fees.pdf" title><img alt>Download pricing</a><button data-url="/floor-plan.pdf" aria-label title>View floor plan</button>','https://venue.example/')
  self.assertEqual([x['url'] for x in rows],['https://venue.example/fees.pdf','https://venue.example/floor-plan.pdf'])
if __name__=='__main__':unittest.main()
