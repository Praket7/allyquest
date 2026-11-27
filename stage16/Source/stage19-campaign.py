"""Stage 19: deterministic, authored world/venue matrix for the 300-adventure edition.
Each venue uses a compatible Stage 18 geometry and interaction vocabulary. This
is not 275 bespoke art sets: room architecture is deliberately reused by type.
The original 25 adventure and room records are preserved without edits.
"""
from pathlib import Path
import json, copy, sys
P=Path(__file__).resolve().parent
# Each row: architectural base, chapter name, five (adventure title, venue, incident).
# Each incident is a distinct fictional situation, not a claim about a real person/product.
WORLDS=[
('maplewood','Maplewood School','Nia','#4e8297',0,[
('substitute-teacher','Morning routines',[
('The Breakfast Club','Breakfast classroom','A breakfast reward is announced before the teacher checks the individual plan.'),('The New Seating Chart','Year group classroom','A friend is asked to sit apart from everyone because of an allergy.'),('The Substitute Folder','Homeroom','The substitute teacher cannot find the staff procedure envelope.'),('The Birthday Calendar','Class meeting','A birthday calendar promises food treats for every student.'),('The Homework Prize','Study classroom','A student is worried that earning a homework prize requires eating a snack.')]),
('shared-lunch','Lunch with friends',[
('A Place at Lunch','Main cafeteria','A friend offers to exchange a lunch tray with a classmate.'),('The Extra Sandwich','Lunch overflow room','Someone wants to share an extra sandwich without checking the ingredients.'),('The Mixed-up Trays','Junior cafeteria','Two lunch trays have been put next to each other and their ownership is unclear.'),('The Table Switch','After-school cafeteria','Students have changed tables without checking the seating plan.'),('The Lunch Club','Lunch club room','A group thinks its conversation game should include snack trading.')]),
('class-science','Curiosity for everyone',[
('The Egg Carton Model','Science classroom','A model activity uses a previously used egg carton.'),('The Flour Experiment','Science preparation lab','A flour demonstration is proposed without checking the material list.'),('The Seed Sorting Tray','STEM classroom','A seed sorting activity includes an unverified food container.'),('The Edible Model','Project lab','The class wants to build an edible model rather than a paper model.'),('The Experiment Fair','Science fair classroom','A display material is not on the teacher’s reviewed supply list.')]),
('sports-break','Recess team',[
('The Shared Football','PE equipment room','Students have eaten snacks and then handled the football.'),('Relay Break','Indoor gym','A relay team wants to pass shared snacks around the equipment area.'),('The Borrowed Racquet','Sports store','A racquet was handled during snack break.'),('The Skipping Rope','Activity gym','The skipping ropes were returned to a shared pile after lunch.'),('The Open Team','School sports hall','One player is told to miss the next game because of snack rules.')]),
('club-bullying','A school that listens',[
('The Cafeteria Joke','Student support office','A joke about allergies has made a friend uncomfortable.'),('The Group Chat Rumor','Counseling room','A rumor about a classmate’s health information is being passed around.'),('The Excluded Partner','Mentor room','A group leaves a classmate out of a partner activity.'),('The Quiet Concern','Student council room','A friend wants to report teasing privately.'),('The School Promise','School meeting room','The students want a respectful rule for activities that does not demand medical disclosure.')])]),
('riverside','Riverside Market','Omar','#4a8275',1,[
('market-stall','Receiving records',[
('The Unmarked Delivery','Produce receiving','A delivery container has no current ingredient information.'),('The Missing Invoice','Market office','An invoice lists a snack but its actual package is absent.'),('The Wrong Carton','Dry goods receiving','A different carton has arrived from the item on the order.'),('The Loose Bin','Bulk food station','A loose food bin has an incomplete supplier record.'),('The Changed Supplier','Receiving desk','A familiar snack now comes from another supplier.')]),
('recipe-revision','Current labels',[
('The Chip Label','Snack label desk','The current chip package must be compared with the order.'),('The New Flavor','Flavor records office','The familiar brand has introduced a different flavor.'),('The Color Question','Ingredient records','A customer asks about added colors separately from their allergy plan.'),('The Old Printout','Purchase records','A printed ingredient list may not describe the current package.'),('The Advisory Line','Market review desk','A package mentions possible cross-contact and needs adult review.')]),
('festival-supply','Shared tools',[
('The Sample Spoon','Sampling preparation','A serving spoon has been returned from a sample tray.'),('The Packing Conveyor','Packing room','A practice tray has been placed on the wrong receiving conveyor.'),('The Returned Scoop','Stock handling room','A scoop used elsewhere is placed with the clean equipment.'),('The Stacking Problem','Warehouse','A questionable tray and the reviewed supplies have been stacked together.'),('The Morning Reset','Market preparation','The staff are resetting work surfaces after the previous order.')]),
('cafe-order','Ask at the counter',[
('The Market Cafe','Market cafe','The menu does not answer a customer’s question about shared equipment.'),('The Takeout Bag','Takeout counter','A takeout order has been marked complete without an adult review.'),('The Tasting Offer','Sample counter','A child is offered a taste to decide whether a snack is okay.'),('The Unclear Menu','Market restaurant','A menu name does not identify all ingredients.'),('The Separate Utensil','Food service counter','A used serving spoon has been placed by the order tickets.')]),
('accessible-fair','Market community day',[
('The Shopping Game','Market activity booth','The booth offers a food prize without a participation alternative.'),('The Sticker Stall','Community booth','A friend wants to join the stall game without accepting a snack.'),('The Recipe Swap','Recipe information booth','A recipe exchange is being treated as food approval.'),('The Market Passport','Visitor booth','The market passport requires tasting at every stall.'),('The Riverside Welcome','Market community tent','The event needs a non-food activity available to every visitor.')])]),
('baker-row','Baker’s Row','Sofia','#b27a58',2,[
('bakery-order','Order investigation',[
('The Cookie Recipe','Bakery order desk','The cookie recipe and actual ingredient packages need review.'),('The Cupcake Box','Cupcake collection','A decorated cupcake box has no complete ingredient record.'),('The Bread Order','Bread counter','A different bread order was supplied than the one requested.'),('The Sprinkles Tray','Decorating counter','Added colors and individual allergens are separate questions.'),('The Party Delivery','Bakery dispatch','The party delivery is about to leave without the missing details being checked.')]),
('recipe-revision','Recipe changes',[
('The New Flour','Recipe archive','The baker has changed the flour supplier.'),('The Frosting Note','Recipe office','A frosting ingredient has been changed since the earlier note.'),('The Chocolate Packet','Ingredient desk','The chocolate package needs checking rather than relying on the recipe title.'),('The Oil Substitution','Kitchen records','A substitution appears in the updated recipe.'),('The Batch Card','Bakery records','The old batch card does not establish the current ingredients.')]),
('cafe-order','Counter conversations',[
('The Morning Cafe','Bakery cafe','A cafe order needs an answer about shared preparation equipment.'),('The Counter Offer','Pastry counter','A sample is offered before the responsible adult has checked it.'),('The Display Case','Pastry display','A pastry in the display has no reliable ingredient information at the counter.'),('The Take-home Order','Pickup counter','The takeaway ticket is missing a preparation question.'),('The Baker’s Question','Service counter','The baker wants to understand the exact concern before proposing an order.')]),
('festival-supply','Preparation space',[
('The Used Piping Tip','Decorating preparation','A used utensil has been put near the next order.'),('The Crumb Tray','Baking preparation','A practice tray has crumbs from a different activity.'),('The Mixing Bowl','Kitchen preparation','A used mixing tool needs to be separated for staff review.'),('The Cooling Rack','Bakery equipment room','Equipment history is unclear after a previous order.'),('The Closing Shift','Bakery receiving','The adult needs a clear record of items held and equipment returned.')]),
('birthday-invitation','Celebrations',[
('The Cookie Party','Party planning room','A party invitation implies everyone must eat a cookie.'),('The Decorating Club','Decorating activity','A child wants to join without using food materials.'),('The Birthday Ticket','Celebration room','The invitation makes cake the entrance ticket.'),('The Baker’s Badge','Activity room','A bakery tour reward is only offered as food.'),('The Bakery Welcome','Community party room','The bakery wants an invitation that welcomes children without food pressure.')])]),
('cedar-sports','Cedar Sports Park','Jaden','#477d85',3,[
('sports-break','Equipment care',[
('The Team Ball','Basketball gym','The shared ball was handled during snack break.'),('The Training Cones','Training hall','Training cones have been touched after eating.'),('The Racquet Rack','Racquet hall','Equipment was returned from a break without checking the procedure.'),('The Bench Break','Team gym','A snack has been placed on the team equipment cart.'),('The Tournament Reset','Tournament hall','The next team needs the shared equipment prepared under staff direction.')]),
('handwash-club','Indoor games',[
('The Board-game Break','Games lounge','Shared game pieces were touched after eating.'),('The Score Tokens','Recreation room','A used score token was returned to the game box.'),('The Puzzle Table','Puzzle club','A puzzle piece has been touched during a snack break.'),('The Team Cards','Indoor club','The group plans to pass shared cards around after eating.'),('The Game Return','Equipment games room','Returned game pieces need staff-directed cleaning and handwashing.')]),
('bus-trip','Away matches',[
('The Away Game','Travel office','The team needs the responsible staff procedure before leaving.'),('The Late Bus','Coach pickup office','The bus schedule changed and supervision needs confirming.'),('The Visiting Team','Visitor desk','Visiting staff need the current procedure without public health details.'),('The Match Itinerary','Team planning','The match itinerary omits the meeting point for adult help.'),('The Overnight Plan','Trip office','A travel schedule needs a responsible adult to review the individual arrangements.')]),
('club-bullying','Team respect',[
('The Sideline Comment','Coach meeting room','A teammate mocks a friend for not sharing food.'),('The Captain’s Choice','Team support','The captain is excluding someone because of allergy precautions.'),('The Changing-room Rumor','Sports support office','A private health concern is being discussed without permission.'),('The Quiet Teammate','Mentor office','A player wants to talk privately about exclusion.'),('The Team Agreement','Team meeting room','Players want a respectful team agreement that does not demand food participation.')]),
('accessible-fair','Sports day',[
('The Medal Table','Sports day booth','A finish-line prize is a snack with unknown ingredients.'),('The Team Challenge','Field event booth','A team challenge is tied to accepting a food reward.'),('The Spectator Game','Spectator activity','A friend wants a way to take part without eating.'),('The Open Relay','Relay registration','A prize rule could leave a child out.'),('The Cedar Cup','Tournament booth','The final celebration needs an adult-reviewed non-food prize plan.')])]),
('discovery','Discovery Campus','Leah','#507e99',4,[
('class-science','Laboratory discoveries',[
('The Eggshell Model','Discovery lab','A previously used food container is proposed for a model.'),('The Flour Volcano','Demonstration lab','A flour-based activity is proposed without material review.'),('The Plant Samples','Botany lab','A food-derived material is on the experiment bench.'),('The Paper Alternative','Model lab','The proposed activity could use paper rather than an edible material.'),('The Exhibition Bench','Exhibit preparation lab','An unfamiliar material arrives before the group demonstration.')]),
('art-supplies','Maker spaces',[
('The Modeling Dough','Maker studio','Craft dough has incomplete ingredient details.'),('The Paste Bottle','Design studio','A craft paste lacks a current material record.'),('The Paint Recipe','Color studio','A homemade craft mixture has unverified ingredients.'),('The Collage Kit','Exhibit studio','A food-based craft supply is mixed with paper shapes.'),('The Discovery Mural','Community maker studio','The group needs a reviewed non-food material alternative.')]),
('recipe-revision','Evidence lab',[
('The Formula Card','Records laboratory','A previous ingredient record differs from the current one.'),('The Dye List','Color records lab','The color names must be checked separately from the allergy plan.'),('The Supplier Note','Science records','A supplier changed a material without updating the old record.'),('The Unknown Packet','Material review office','The current packet has incomplete ingredient information.'),('The Evidence File','Research records','The group needs to report the missing details instead of guessing.')]),
('library-club','Discovery library',[
('The Reading Reward','Science library','The reading reward is a mystery food prize.'),('The Museum Passport','Learning library','The passport requires tasting at each activity.'),('The Exhibit Story','Story gallery','A visitor wants to read about food without tasting it.'),('The Model Challenge','Reading workshop','A model-building prize could exclude a visitor.'),('The Discovery Bookmark','Museum resource room','The group wants a non-food reward for learning.')]),
('substitute-teacher','Guides and visitors',[
('The New Guide','Museum classroom','A new guide has not seen the current staff procedure.'),('The School Visit','Visitor classroom','The school group’s plan needs staff review.'),('The Group Choice','Activity classroom','A demonstration assumes everyone must touch food materials.'),('The Private Question','Learning classroom','A child wants help without telling the whole group medical details.'),('The Discovery Promise','Museum learning hall','The guide wants a learning plan that offers everyone a choice.')])]),
('arts-quarter','Arts Quarter','Amara','#936d91',5,[
('art-supplies','Studio materials',[
('The Dough Sculpture','Sculpture studio','A dough sculpture uses unverified craft material.'),('The Paper Collage','Collage studio','A food-based craft supply needs to be held for review.'),('The Festival Paint','Painting studio','The material list for a homemade paint is incomplete.'),('The Costume Paste','Costume workshop','A paste used on costumes has no current ingredient record.'),('The Art Wall','Gallery workshop','The mural needs reviewed paper alternatives for the group.')]),
('welcome-rehearsal','Music together',[
('The First Beat','Band rehearsal room','Shared snacks have been offered before instruments are handled.'),('The Bell Chorus','Music classroom','A friend wants to join the rhythm activity without accepting a snack.'),('The Drum Circle','Percussion studio','The rehearsal plan needs a non-food way to participate.'),('The Stage Break','Performance rehearsal','A shared snack is placed near music supplies during the break.'),('The Concert Count-in','Concert rehearsal room','The music group wants everyone included in the final practice.')]),
('library-club','Stories and scripts',[
('The Theatre Script','Script library','Reading the script aloud comes with a mystery food reward.'),('The Poetry Club','Poetry library','A friend wants to attend poetry club without a snack.'),('The Drawing Story','Story workshop','An activity prize is tied to eating food.'),('The Gallery Guide','Art library','The guide offers a tasting reward rather than a non-food option.'),('The Story Festival','Library performance room','The club wants bookmarks instead of food rewards.')]),
('club-bullying','Backstage kindness',[
('The Casting List','Theatre support office','A performer is excluded from a group because of allergy precautions.'),('The Costume Comment','Backstage support room','A joke about a friend’s allergy has made them uncomfortable.'),('The Private Rehearsal','Mentor room','A performer wants to discuss a concern privately.'),('The Group Photo','Arts support room','A friend is pressured to explain why they are not eating.'),('The Backstage Agreement','Company meeting room','The group needs a respectful backstage participation rule.')]),
('birthday-invitation','Opening night',[
('The Gallery Invitation','Gallery event room','The opening invitation assumes every visitor must eat a treat.'),('The Concert Reception','Reception planning room','A music reception needs a non-food activity choice.'),('The Opening Ticket','Theatre party room','The entry ticket is tied to accepting food.'),('The Audience Welcome','Audience activity','A visitor wants to join without disclosing their health information.'),('The Arts Quarter Opening','Community event room','The artists want an opening that welcomes everyone.')])]),
('crossroads','Crossroads Station','Ishaan','#607e94',6,[
('bus-trip','Travel planning',[
('The Departure Board','Bus dispatch office','The trip plan needs confirmation from responsible staff before departure.'),('The Platform Change','Station planning office','The meeting point has moved to another platform.'),('The Visitor Ticket','Visitor desk','A visitor needs the group procedure without public medical disclosure.'),('The Rest Stop','Travel planning room','The schedule includes an unfamiliar rest stop.'),('The Return Journey','Station staff office','The return schedule changes who is supervising the group.')]),
('cafe-order','Station counters',[
('The Platform Cafe','Station cafe','An order needs current ingredients and equipment information.'),('The Travel Snack','Snack counter','A child is offered an unfamiliar snack on the trip.'),('The Takeaway Ticket','Station pickup','The takeaway ticket does not answer a shared equipment question.'),('The Changed Menu','Waiting-room cafe','The menu has changed since the previous visit.'),('The Station Lunch','Station food service','The staff need to review the order and return a used utensil.')]),
('market-stall','Travel supplies',[
('The Luggage Snack','Travel stockroom','A snack carton has no complete package record.'),('The Restock Cart','Station receiving','The delivered item differs from the one on the receipt.'),('The Unmarked Bag','Travel supply room','A loose bag has incomplete ingredient information.'),('The Kiosk Delivery','Station market receiving','A kiosk restock is missing a current label.'),('The Supply Handover','Dispatch stockroom','The outgoing supplies need a record of what remains on hold.')]),
('club-bullying','Travel companions',[
('The Bus Seat','Travel support office','A child is told to sit apart because of their allergy.'),('The Waiting Room','Passenger support','A friend is pressured to share snacks while waiting.'),('The Group Ticket','Group travel support','A friend is excluded from a group activity.'),('The Quiet Passenger','Station mentor room','A passenger wants to report teasing privately.'),('The Travel Agreement','Travel group meeting room','The group needs a respectful travel plan.')]),
('emergency-rehearsal','Practice getting help',[
('The Platform Drill','Station first-aid room','Fictional drill: a friend has trouble breathing after eating near the platform.'),('The Bus-stop Drill','Travel first-aid office','Fictional drill: a friend reports throat tightness after a snack.'),('The Waiting-room Drill','Station health room','Fictional drill: a friend has difficulty breathing after eating.'),('The Rest-stop Drill','Travel health station','Fictional drill: a friend reports a tight throat after eating.'),('The Arrival Drill','Station clinic','Fictional drill: a friend suddenly has difficulty breathing after a snack.')])]),
('willow-park','Willow Nature Park','Zoe','#6b8d62',7,[
('picnic-weather','Picnic plans',[
('The Rain Shelter','Picnic pavilion','Rain moves the picnic and an uncertain tray is left in the new area.'),('The Lakeside Picnic','Lakeside shelter','A shared tray is placed near an activity station.'),('The Trail Lunch','Trail shelter','The trail group changes its lunch location and needs a new plan.'),('The Garden Table','Garden pavilion','A visitor wants to join the picnic without eating the offered food.'),('The Windy Afternoon','Park shelter','A wind change requires moving the event and reviewing supplies.')]),
('art-supplies','Nature crafts',[
('The Leaf Print','Nature craft studio','An unverified craft mixture is offered for leaf prints.'),('The Seed Collage','Garden craft room','A food-derived material is mixed with craft supplies.'),('The Clay Trail','Nature workshop','The craft dough does not have a complete ingredients record.'),('The Bird Model','Visitor craft studio','The group plans a model with an unreviewed food container.'),('The Nature Mural','Park art room','The nature mural needs reviewed non-food craft supplies.')]),
('sports-break','Outdoor play',[
('The Trail Game','Park recreation room','Shared equipment has been handled after snacks.'),('The Park Ball','Activity gym','A ball is returned from a snack break.'),('The Orienteering Kit','Outdoor equipment room','The shared markers were touched during lunch.'),('The Picnic Relay','Park sports room','The team wants to share food during the relay break.'),('The Willow Challenge','Recreation hall','The shared equipment needs staff-directed preparation.')]),
('handwash-club','Shared equipment',[
('The Nature Tokens','Park game room','A used game token is placed in the shared box.'),('The Trail Puzzle','Visitor game room','A puzzle has been handled during lunch.'),('The Shared Cards','Park activity room','Students are passing game cards around after eating.'),('The Visitor Game','Nature center club','A returned game piece needs adult-directed cleaning.'),('The Park Reset','Recreation workshop','The shared game supplies need a handwashing and cleaning plan.')]),
('accessible-fair','Park celebrations',[
('The Trail Passport','Visitor activity booth','The passport requires tasting rather than exploring.'),('The Garden Prize','Garden fair booth','The prize is an unverified snack.'),('The Nature Challenge','Activity booth','A child wants to complete a challenge without accepting food.'),('The Ranger Badge','Park booth','The ranger reward needs a non-food alternative.'),('The Willow Welcome','Park celebration booth','The park festival needs an inclusive reward plan.')])]),
('helping-hands','Helping Hands Center','Mateo','#4f8a87',8,[
('club-bullying','Listening and privacy',[
('The Welcome Desk','Community support office','A visitor feels uncomfortable with allergy-related teasing.'),('The Private Note','Support room','A friend wants to tell a responsible adult about exclusion privately.'),('The Volunteer Comment','Volunteer support office','A volunteer asks a child to explain private health information to a group.'),('The Activity Partner','Mentor room','A participant has been left out of a group activity.'),('The Listening Promise','Community meeting room','The group wants to agree how to include everyone respectfully.')]),
('emergency-rehearsal','Emergency rehearsals',[
('The First-aid Drill','First-aid classroom','Fictional drill: a friend reports throat tightness after eating.'),('The Clinic Drill','Practice clinic','Fictional drill: a friend has trouble breathing after a snack.'),('The Volunteer Drill','Health practice room','Fictional drill: a friend has difficulty breathing after eating.'),('The Community Drill','First-aid room','Fictional drill: a friend reports a tight throat after eating.'),('The Immediate Help Drill','Emergency practice clinic','Fictional drill: a friend has difficulty breathing after a snack.')]),
('substitute-teacher','Responsible adults',[
('The Volunteer Folder','Volunteer classroom','A new volunteer does not know the staff procedure.'),('The Activity Schedule','Training classroom','An activity schedule includes a proposed food reward.'),('The New Coordinator','Community classroom','A coordinator needs the procedure without public medical disclosure.'),('The Small Group','Learning room','A participant wants a non-food way to join a group activity.'),('The Staff Handover','Training room','Staff need to review the activity plan before changing shifts.')]),
('library-club','Community learning',[
('The Book Reward','Community library','A reading reward is a mystery snack.'),('The Volunteer Story','Reading room','A visitor wants to join a story group without eating.'),('The Badge Club','Resource library','A badge requires accepting food.'),('The Reading Circle','Learning library','The circle needs an alternative to snack prizes.'),('The Helping Hands Bookmark','Community story room','The group wants to recognize everyone with a non-food reward.')]),
('welcome-promise','Community action',[
('The Supplies Promise','Community assembly','A community activity has an unverified supply carton.'),('The Welcome Workshop','Community event room','The activity needs reviewed supplies and non-food alternatives.'),('The New Volunteer Day','Volunteer assembly','A volunteer event needs an inclusive plan and adult review.'),('The Open House','Community hall','The open house wants to welcome every visitor without food pressure.'),('The Helping Hands Promise','Community assembly hall','The center needs a final adult-reviewed plan for supplies and participation.')])]),
('lantern-fair','Lantern Fairgrounds','Kai','#ae8050',9,[
('accessible-fair','Games and prizes',[
('The Ring Toss','Ring toss booth','The ring toss prize is an unverified food item.'),('The Lantern Game','Lantern activity booth','The game offers no alternative to a snack reward.'),('The Ticket Counter','Fair registration','A ticket requires accepting a food prize.'),('The Prize Wheel','Prize activity booth','The prize wheel includes mystery snacks.'),('The Fair Passport','Visitor activity booth','The fair passport needs non-food participation rewards.')]),
('festival-supply','Fair preparation',[
('The Receiving Cart','Fair stockroom','A questionable tray is placed near reviewed supplies.'),('The Sample Utensil','Fair service prep','A used serving spoon is returned to the wrong area.'),('The Vendor Transfer','Fair receiving','The history of a shared tray is unclear.'),('The Delivery Reset','Fair packing room','The work area needs staff-directed preparation after a delivery.'),('The Lantern Supplies','Fair distribution','The final supplies need clear separation and adult review.')]),
('bakery-order','Food stands',[
('The Cookie Stand','Fair bakery counter','A cookie recipe is not enough to approve actual preparation.'),('The Treat Stall','Fair order desk','A stall has incomplete current ingredient information.'),('The Decorated Snack','Fair collection','Added colors and a person’s allergens need separate review.'),('The Vendor Box','Fair pickup counter','A vendor delivers a different carton than expected.'),('The Fair Order','Fair bakery dispatch','The staff need to hold the uncertain delivery and document what is missing.')]),
('welcome-rehearsal','Live performances',[
('The Drum Tent','Fair rehearsal','A shared snack is placed next to the rehearsal supplies.'),('The Bell Show','Fair music room','A visitor wants to join the show without food.'),('The Lantern Rhythm','Fair stage rehearsal','The rhythm activity needs inclusive participation.'),('The Performer Break','Fair backstage rehearsal','A snack break raises a shared equipment concern.'),('The Evening Count-in','Fair concert room','The performers want a non-food way to celebrate together.')]),
('birthday-invitation','The evening fair',[
('The Lantern Invitation','Fair party room','An invitation requires eating a treat before joining.'),('The Family Ticket','Fair planning room','The family activity ticket is linked to food.'),('The Evening Games','Fair event room','The celebration needs an adult-reviewed non-food option.'),('The Welcome Sign','Fair welcome room','The sign should invite visitors without asking them to disclose an allergy.'),('The Lantern Closing','Fair celebration hall','The closing celebration needs a welcoming invitation for everyone.')])]),
('friendship-festival','Friendship Festival','Lina','#876c99',10,[
('market-stall','Festival arrivals',[
('The International Delivery','Festival receiving','A food container arrives without a complete translated ingredient record.'),('The Vendor Receipt','Festival stockroom','A receipt identifies a product but not its current ingredients.'),('The Supplier Change','Festival receiving office','A familiar supplier has sent a different product.'),('The Missing Information','Festival inventory','A container has no current package details.'),('The Arrival Report','Festival distribution','The staff need a record of every unresolved delivery concern.')]),
('shared-lunch','Eating together',[
('The Festival Table','Festival lunch room','Visitors offer to share food without reviewing the individual plan.'),('The Extra Meal','Festival cafeteria','An extra tray is offered to a friend with an allergy.'),('The Mixed Seating','Festival dining room','A seating change is proposed without staff review.'),('The Conversation Circle','Festival lunch club','A group can enjoy a conversation activity without exchanging food.'),('The Open Table','Festival dining hall','Everyone needs a welcoming meal arrangement without food pressure.')]),
('art-supplies','Shared celebrations',[
('The Flag Craft','Festival craft studio','A craft mixture has no complete ingredient information.'),('The World Mural','Festival art room','Food-based craft supplies are mixed with paper materials.'),('The Paper Lantern','Festival workshop','A homemade paste has incomplete material details.'),('The Friendship Shapes','Festival maker studio','The craft group needs an adult-reviewed alternative.'),('The Festival Display','Festival gallery','The final display should use reviewed non-food materials.')]),
('welcome-rehearsal','The final performance',[
('The Parade Rhythm','Festival rehearsal room','A snack is offered beside shared music equipment.'),('The Bell Parade','Festival percussion room','A friend wants to join the music without eating.'),('The Dance Break','Festival stage rehearsal','The rehearsal needs a non-food participation option.'),('The Chorus Practice','Festival music hall','The group is preparing a rhythm activity after a snack break.'),('The Friendship Song','Festival concert rehearsal','All performers should have a way to participate.')]),
('welcome-promise','The world promise',[
('The Festival Supply Plan','Festival planning assembly','A celebration carton has missing current information.'),('The Welcome Cards','Festival community hall','The celebration needs reviewed supplies and inclusive activity choices.'),('The Neighborhood Handover','Festival assembly room','Volunteers need the final adult-reviewed supplies plan.'),('The Promise Rehearsal','Festival meeting hall','The friends want a welcoming event without food pressure.'),('Everyone, Everywhere','Friendship assembly hall','The crew is ready to bring together evidence, hygiene, inclusion and adult review for the final celebration.')])])]

# Contextual prop names by structural template. Venue prefix makes record and task identities
# specific without falsifying a real ingredient label. Gameplay still uses actual geometry.
LABELS={
 'birthday-invitation':{'record':'Invitation draft','invitation':'Food-only invitation','games':'Non-food game kit','activity':'Activity table','board':'Welcome sign','review':'Staff review folder'},
 'bakery-order':{'record':'Order record','label':'Ingredient information','parcel':'Unverified order','ticket':'Missing-details report','review':'Staff review desk','hold':'Hold bin'},
 'library-club':{'record':'Reward plan','prize':'Unverified snack prize','bookmarks':'Bookmark pack','activity':'Reading circle','board':'Participation plan','hold':'Staff hold bin'},
 'shared-lunch':{'record':'Meal arrangement','tray':'Unreviewed meal tray','cards':'Conversation cards','activity':'Conversation table','board':'Seating plan','hold':'Staff review area'},
 'sports-break':{'record':'Equipment procedure','snack':'Snack near equipment','sink':'Handwashing sink','cloth':'Practice cleaning cloth','counter':'Equipment cart','hold':'Staff holding bin'},
 'recipe-revision':{'record':'Previous ingredient record','label':'Current ingredient information','parcel':'Unverified carton','ticket':'Change report','review':'Records desk','hold':'Hold bin'},
 'class-science':{'record':'Activity material list','label':'Material record','material':'Unreviewed material','kit':'Paper model supplies','activity':'Experiment bench','hold':'Materials hold bin'},
 'art-supplies':{'record':'Material order','label':'Current material details','material':'Unverified craft supply','heartpiece':'Paper heart','sunpiece':'Paper sun','activity':'Craft bench','board':'Display board','hold':'Materials review bin'},
 'bus-trip':{'record':'Current itinerary','plan':'Private staff plan','schedule':'Updated schedule','notice':'Help contact reminder','activity':'Staff planning desk','review':'Staff folder','board':'Meeting points'},
 'market-stall':{'record':'Delivery record','label':'Current package information','parcel':'Unverified container','ticket':'Missing-label report','review':'Inventory desk','hold':'Hold bin'},
 'handwash-club':{'record':'Shared equipment notice','piece':'Returned game piece','cloth':'Cleaning cloth','sink':'Handwashing sink','counter':'Cleaning bench','hold':'Equipment review bin'},
 'picnic-weather':{'record':'Updated event plan','tray':'Unreviewed tray','signcard':'Non-food activity sign','board':'Event notice board','activity':'Activity table','sink':'Handwashing sink','hold':'Staff holding bin'},
 'club-bullying':{'record':'Private concern card','report':'Concern envelope','invite':'Inclusive activity invitation','activity':'Meeting table','notice':'Trusted adult contacts','board':'Respect agreement','review':'Staff report box'},
 'cafe-order':{'record':'Current menu','label':'Ingredient and equipment question','order':'Order ticket','utensil':'Used utensil','review':'Staff review desk','hold':'Equipment return bin'},
 'substitute-teacher':{'record':'Current activity plan','envelope':'Private procedure folder','snack':'Proposed food reward','kit':'Non-food activity cards','activity':'Activity desk','board':'Choice board','review':'Staff folder','hold':'Staff hold bin'},
 'emergency-rehearsal':{'record':'Practice drill notice','board':'Emergency plan reminder'},
 'accessible-fair':{'record':'Prize plan','prize':'Unverified food prize','ticket':'Non-food reward cards','signcard':'Open-to-all sign','board':'Booth sign stand','activity':'Activity table','hold':'Staff hold bin'},
 'festival-supply':{'record':'Current receiving record','label':'Delivery details','tray':'Questionable tray','spoon':'Used utensil','counter':'Practice work surface','hold':'Staff hold bin','returnbin':'Equipment return box'},
 'welcome-rehearsal':{'record':'Rehearsal plan','snack':'Shared snack prop','notice':'Rhythm sequence','claps':'Clap pads','bell':'Bell','drum':'Drum','hold':'Staff holding area'},
 'welcome-promise':{'record':'Event promise','label':'Current supply details','parcel':'Unverified supply carton','signcard':'Everyone belongs card','kit':'Non-food activity kit','board':'Welcome board','activity':'Activity table','sink':'Handwashing sink','hold':'Staff hold bin'},
}
ENDS={
 'birthday-invitation':'Invite everyone; eating is never a requirement.', 'bakery-order':'Keep uncertain food on hold until an adult reviews the current ingredients and preparation.', 'library-club':'Recognize participation with a reviewed non-food reward.', 'shared-lunch':'Enjoy time together without sharing food; follow the individual plan.', 'sports-break':'Keep food and equipment separate and follow adult-directed handwashing and cleaning.', 'recipe-revision':'Check current information; old ingredient records do not authorize a new item.', 'class-science':'Use adult-reviewed non-food activity materials.', 'art-supplies':'Hold uncertain craft materials and arrange reviewed paper alternatives.', 'bus-trip':'Keep the current plan with responsible staff and protect private information.', 'market-stall':'Hold an uncertain delivery and document the missing information.', 'handwash-club':'Wash with soap and water; let the adult direct equipment cleaning.', 'picnic-weather':'Keep uncertain food separate and offer a non-food activity.', 'club-bullying':'Listen, report concerns privately and include friends without pressure.', 'cafe-order':'Ask about current ingredients and preparation; the adult reviews the order.', 'substitute-teacher':'Share staff procedures privately and offer choices without food pressure.', 'emergency-rehearsal':'Get adult and emergency help immediately. Do not delay for investigation.', 'accessible-fair':'Offer adult-reviewed non-food prizes and activities.', 'festival-supply':'Separate uncertain supplies and return used equipment for adult-directed cleaning.', 'welcome-rehearsal':'Enjoy music together without requiring food.', 'welcome-promise':'Keep uncertain supplies on hold, follow hygiene procedures, include everyone and obtain adult review.'}

def compile_worlds(pack):
    base=copy.deepcopy(pack)
    assert len(base['levels'])==25
    pack['worlds']=[dict(id='welcome',name='Welcome Street',friend='Ally Crew',color='#557c86',backdrop='ws-community',start=0,count=25,chapters=['The first festival','A place at the table','Learning together','Speaking up','The neighborhood promise'])]
    pack['roomTemplates']={}
    pack['worldCharacters']={}
    original={l['id']:l for l in base['levels']}
    for wi,(wid,name,friend,color,atlas,groups) in enumerate(WORLDS,1):
        assert len(groups)==5 and all(len(g[2])==5 for g in groups)
        peer='w19-'+wid
        pack['worldCharacters'][peer]={'name':friend,'world':wid,'atlas':atlas}
        pack['worlds'].append(dict(id=wid,name=name,friend=friend,character=peer,color=color,backdrop='w19-bg-'+wid,start=wi*25,count=25,chapters=[x[1] for x in groups]))
        for gi,(template,chapter,episodes) in enumerate(groups):
            for ei,(title,venue,problem) in enumerate(episodes):
                index=wi*25+gi*5+ei; rid=f'w{wi+1:02}-{gi*5+ei+1:02}'
                room=copy.deepcopy(base['rooms'][template]); lev=copy.deepcopy(original[template]); end=ENDS[template]
                # A compatible actual floor plan is reused, not a cosmetic fake room.
                # Distinct venue-specific signs, props, palette and optional routes are authored.
                old_names={o['id']:o['label'] for o in room['objects']}; new_names={**old_names,**LABELS[template],'charm':title+' charm'}
                new_names['record']=venue+' record'
                if template=='emergency-rehearsal':new_names['record']='Fictional drill notice'
                for o in room['objects']:o['label']=new_names[o['id']]
                # Keep adult identities aligned with the available adult sprite and role.
                adult=new_names['adult']; emergency=room['education']['emergency']
                for nk,n in room['graph']['nodes'].items():
                    if n.get('complete'):n['prompt']=end+' Return outside.';continue
                    if emergency:
                        n['prompt']='Fictional drill: get adult and emergency help now.'
                        continue
                    for edge in n['edges']:
                        kind,oid=edge['kind'],edge['id']; label=new_names[oid]
                        if kind=='consult':
                            edge['label']='Review with '+adult if edge['next']=='done' else 'Ask '+adult
                            if edge['next']=='done':edge['lesson']=end
                            elif nk=='arrived':edge['lesson']=problem+' '+adult+' will direct the practice plan.'
                            else:edge['lesson']='Thank you for reporting the concern. Follow the individual plan and keep uncertain items out of use.'
                        else:
                            edge['label']=label
                            if oid=='record':edge['lesson']=problem
                            elif oid=='label':edge['lesson']='Check the current record. Missing or changed information must be reported; do not guess.'
                            elif kind=='move':edge['lesson']='Move '+label.lower()+' to '+new_names[edge['to']].lower()+'. '+end
                            # Keep gesture counts, washing time and existing exact lesson.
                    prompts=[]
                    for edge in n['edges']:
                        kind,oid=edge['kind'],edge['id']; label=new_names[oid]
                        prompts.append(('Ask '+adult if kind=='consult' else 'Carry '+label.lower()+' to '+new_names[edge['to']].lower() if kind=='move' else 'Practice '+label.lower() if kind=='gesture' else 'Inspect '+label.lower()))
                    n['prompt']=' or '.join(prompts)+'.'
                room['meta'][0]=venue;room['look'][3]=venue.upper();room['lesson']={'title':title,'theme':venue,'why':problem,'end':end}
                room['story']=[title,problem,end,'Friendship note','Give the note to '+friend+'.','Invite without pressure.','activity'];room['charm']=title+' charm';room['education']['objective']=rid
                room['crew']['jobs']=['Check '+new_names['record'].lower(),'Make participation welcoming'];room['crew']['favor']=['friendship note','Listen and invite without food pressure.']
                # Small but collision-aligned layout variation. Move whole supported fixture groups
                # only if no overlaps and in bounds. Limit changes to safe interior circulation.
                # A deterministic mirrored jitter on fixtures gives per-venue variation, while
                # preserving the known architectural model (gym stays a gym, etc.).
                for si,f in enumerate(room['shelves']):
                    dx=(((wi*11+gi*7+ei*3+si*2)%5)-2)*4;dz=(((wi*5+gi*3+ei+si*3)%3)-1)*3
                    old=(f['x'],f['z']); bx1,bx2=f['x']-f['w']/2+dx,f['x']+f['w']/2+dx;bz1,bz2=f['z']-f['d']/2+dz,f['z']+f['d']/2+dz
                    if bx1<25 or bx2>1250 or bz1<8 or bz2>392:continue
                    if any(b.get('ref')!=['shelf',si] and max(bx1,b['x1'])<min(bx2,b['x2'])+4 and max(bz1,b['z1'])<min(bz2,b['z2'])+4 for b in room['solids']):continue
                    f['x']+=dx;f['z']+=dz
                    for o in room['objects']:
                        if o['surface']==si:
                            for key in ('x','ox','wx'):o[key]+=dx
                            o['wz']+=dz
                    for b in room['solids']:
                        if b.get('ref')==['shelf',si]:b['x1']+=dx;b['x2']+=dx;b['z1']+=dz;b['z2']+=dz
                theme=copy.deepcopy(base['archetypes'][room['meta'][1]]);theme['theme']['name']=venue.upper();theme['theme']['trim']=color
                for f in theme['wall']:
                    if f['kind']=='panel':f['title']=venue.upper();f['lines']=['Ask before acting','Everyone can join']
                room['meta'][1]='theme-'+rid;pack['archetypes'][room['meta'][1]]=theme
                pack['rooms'][rid]=room;pack['roomTemplates'][rid]=template
                # Eleven world-specific traversal families, with optional vertical star routes.
                # The required ground path stays accessible (no timed safety objective or forced jump).
                door=920+(wi*83+gi*57+ei*41)%390;finish=door+870+(gi*97+ei*61+wi*29)%420
                x1=420+(gi*47+ei*39)%180;x2=door+210+(wi*43+ei*37)%150
                p1={'x':x1,'y':445-(ei%3)*23,'w':145+(wi+gi)%4*20};p2={'x':x2,'y':432+(gi%3)*18,'w':165+(ei%3)*22}
                platforms=[p1,p2];springs=[]
                # School courtyards have low planters; market and bakery have loading platforms;
                # sports uses stepped practice ledges; science and transit use moving platforms;
                # arts and festivals have broad stages; park has stepping-stone tiers.
                if wi in (1,8):
                    platforms.append({'x':finish-300,'y':488-(ei%2)*24,'w':125+(gi%3)*15})
                elif wi in (2,3):
                    p1['y']=480-(gi%3)*18;p1['w']=205+(ei%3)*20
                    p2['y']=412+(ei%3)*18
                    platforms.append({'x':finish-270,'y':480,'w':140})
                elif wi in (4,6,10):
                    p1['y']=465-(ei%3)*18;p2['y']=450-(gi%3)*27
                    platforms.append({'x':finish-305,'y':p2['y']-38,'w':130})
                    # Springs are optional: placed beyond the checkpoint and away from the door.
                    if (gi+ei)%2==0:platforms[-1]['y']-=12
                elif wi in (5,7):
                    p2.update(moving=True,amplitude=38+(ei%3)*8,period=2.9+(gi%3)*.4)
                    p1['y']=475-(ei%2)*30
                    platforms.append({'x':finish-295,'y':475,'w':130})
                elif wi in (9,11):
                    p1['w']=220;p1['y']=470;p2['w']=210;p2['y']=445-(ei%3)*10
                    platforms.append({'x':finish-255,'y':493,'w':150})
                # Separate optional platform footprints and keep them out of the entry zone.
                for f in platforms:
                    f['x']=min(f['x'],finish-125-f['w'])
                lev.update(id=rid,name=title,subtitle=venue,backdrop='w19-bg-'+wid,color=color,npc=peer,npcName=friend,npcX=265,hero=['ethan','maya','leo','ari'][(wi+gi+ei)%4],width=finish+220,intro=problem,mission=title,mechanic='Explore and help',lesson=end,platforms=platforms,springs=springs,walls=[],gaps=[],stars=[{'x':350,'y':520},{'x':p1['x']+p1['w']/2,'y':p1['y']-48},{'x':door-120,'y':520},{'x':p2['x']+p2['w']/2,'y':p2['y']-48},{'x':finish-160,'y':520}],finishX=finish,finishName=name.upper())
                lev['tasks']=[dict(id='meet-'+rid,x=265,y=567,kind='npc',icon='💬',title='Meet '+friend,prompt='E · Talk to '+friend,speaker=friend,lines=[problem],choices=[dict(label='Let’s help',correct=True,reply='Let’s go to the '+venue.lower()+'. Ask the responsible adult.')]),dict(id=rid,x=door,y=567,kind='choice',icon='✦',title=venue,prompt='E · Enter '+venue,speaker=friend,lines=[problem],choices=[])]
                if emergency:lev['tasks'][0]['lines']=[problem+' '+friend+' is taking part in this practice drill. Enter the room and practice getting help immediately.'];lev['intro']=lev['tasks'][0]['lines'][0]
                pack['levels'].append(lev);pack['chapters'].append([str(index+1),title,problem,end])
    for i in range(25,len(pack['chapters'])-1):pack['chapters'][i][3]+=' Next: '+pack['levels'][i+1]['name']+'.'
    assert len(pack['levels'])==300 and len(pack['rooms'])==306
    assert len({l['name'] for l in pack['levels']})==300
    assert len({r['meta'][0] for k,r in pack['rooms'].items() if k in pack['roomTemplates']})>=250
    return pack
if __name__=='__main__':
    inp=Path(sys.argv[1]) if len(sys.argv)>1 else P/'welcome-street-25.json';out=Path(sys.argv[2]) if len(sys.argv)>2 else P/'ally-quest-300.json'
    p=compile_worlds(json.loads(inp.read_text()));out.write_text(json.dumps(p,ensure_ascii=False,separators=(',',':'))+'\n');print('Compiled',len(p['worlds']),'worlds,',len(p['levels']),'adventures,',len(p['rooms']),'interiors')
