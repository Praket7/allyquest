from pathlib import Path
from playwright.sync_api import sync_playwright
import os,json
P=Path(__file__).parent;Q=P/'qa';Q.mkdir(exist_ok=True);passed=[];errors=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=os.getenv('AQ_CHROMIUM','/usr/bin/chromium'),args=['--no-sandbox']);p=b.new_page(viewport={'width':1280,'height':900},accept_downloads=True);p.on('pageerror',lambda e:errors.append(str(e)));p.set_content((P.parent/'Ally_Quest_Content_Studio.html').read_text());p.locator('#loadBranch').click()
 def ok(s):passed.append(s);print('PASS',s,flush=True)
 assert p.locator('#pick').input_value()=='reunion-lab';assert p.locator('#graphEdges .graph-edge').count()==2;ok('New archetype and graph appear in editor')
 p.locator('#graphPrompt').fill('Inspect the current record or consult Ms. Rivera.');p.locator('#graphUpdate').click();p.locator('#graphApply').click();assert 'Applied' in p.locator('#authorStatus').inner_text();ok('Graph prompt edits validate')
 p.locator('#graphNode').select_option('arranged');p.locator('#graphEdges .graph-edge').last.locator('button').first.click();p.locator('#edgeKind').select_option('use');p.locator('#edgeSave').click();p.locator('#graphApply').click();assert 'adult consultation' in p.locator('#authorStatus').inner_text();ok('Unauthorized completion blocked in editor');p.locator('#authorReset').click()
 p.locator('#graphNew').fill('orphan');p.locator('#graphAdd').click();p.locator('#graphApply').click();assert 'unreachable' in p.locator('#authorStatus').inner_text();p.locator('#authorReset').click();ok('Unreachable graph node rejected')
 p.locator('#graphNode').select_option('evidence');p.locator('#edgeKind').select_option('gesture');p.locator('#edgeObject').select_option('board');p.locator('#edgeNext').select_option('arrived');p.locator('#edgeCount').fill('3');p.locator('#edgeLabel').fill('Recheck');p.locator('#edgeLesson').fill('Recheck the record.');p.locator('#edgeSave').click();p.locator('#graphApply').click();assert 'Applied' in p.locator('#authorStatus').inner_text();ok('New recovery transition authored and validated')
 d=json.loads(p.locator('#npcProfiles').input_value());d['peer']['goals'][0]['speed']=100;p.locator('#npcProfiles').fill(json.dumps(d));p.locator('#npcApply').click();assert 'Applied' in p.locator('#authorStatus').inner_text();ok('NPC goal policy edited')
 a=json.loads(p.locator('#themeData').input_value());a['theme']['accent']='#ffe0aa';p.locator('#themeId').fill('reunion-custom');p.locator('#themeData').fill(json.dumps(a));p.locator('#themeApply').click();assert 'Applied' in p.locator('#authorStatus').inner_text();ok('New room archetype authored without runtime changes')
 with p.expect_download() as event:p.locator('#export').click()
 event.value.save_as(Q/'graph-editor-export.json');pack=json.loads((Q/'graph-editor-export.json').read_text());r=pack['rooms']['reunion-lab'];assert r['meta'][1]=='reunion-custom' and r['crew']['profiles']['peer']['goals'][0]['speed']==100 and any(e['kind']=='gesture' for e in r['graph']['nodes']['evidence']['edges']);ok('All authoring changes export as plain data')
 p.locator('#graphAuthor').scroll_into_view_if_needed();p.screenshot(path=str(Q/'graph-editor.png'));assert not errors,errors;b.close()
(Q/'graph-editor-results.json').write_text(json.dumps({'passed':passed,'errors':errors},indent=2))
