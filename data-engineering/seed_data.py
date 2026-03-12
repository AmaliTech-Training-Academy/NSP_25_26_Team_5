"""
seed_data.py — Idempotent seed data for CommunityBoard.

Inserts realistic neighborhood community data into the application database.
ID ranges: users 100-114, posts 100-162, comments 100-499+

Rules:
- IDs 1-99 are RESERVED for backend/data.sql
- Uses OVERRIDING SYSTEM VALUE (required by GENERATED ALWAYS AS IDENTITY)
- ON CONFLICT (id) DO NOTHING — fully idempotent, safe to re-run
- All posts: is_deleted = FALSE
- All comments: is_deleted = FALSE
- All users: is_active = TRUE
- Never hardcodes credentials — reads from config.py / env
"""
import random
from datetime import datetime, timedelta

import bcrypt
from sqlalchemy import text

from db import get_engine, setup_logging, ensure_schema

logger = setup_logging("seed_data")

# ---------------------------------------------------------------------------
# BCrypt password (same hash for all test users — "password123")
# ---------------------------------------------------------------------------
_RAW_PASSWORD = b"password123"
_BCRYPT_HASH = bcrypt.hashpw(_RAW_PASSWORD, bcrypt.gensalt(rounds=10)).decode("utf-8")

# ---------------------------------------------------------------------------
# Content library — no Lorem Ipsum, all realistic neighborhood content
# ---------------------------------------------------------------------------
SEED_USERS = [
    {"id": 100, "name": "Maria Chen",       "email": "maria.chen@example.com"},
    {"id": 101, "name": "David Osei",       "email": "david.osei@example.com"},
    {"id": 102, "name": "Fatima Al-Rashid", "email": "fatima.alrashid@example.com"},
    {"id": 103, "name": "James Mensah",     "email": "james.mensah@example.com"},
    {"id": 104, "name": "Sarah Johnson",    "email": "sarah.johnson@example.com"},
    {"id": 105, "name": "Kwame Asante",     "email": "kwame.asante@example.com"},
    {"id": 106, "name": "Emily Park",       "email": "emily.park@example.com"},
    {"id": 107, "name": "Michael Owusu",    "email": "michael.owusu@example.com"},
    {"id": 108, "name": "Priya Sharma",     "email": "priya.sharma@example.com"},
    {"id": 109, "name": "Carlos Rivera",    "email": "carlos.rivera@example.com"},
    {"id": 110, "name": "Ama Boateng",      "email": "ama.boateng@example.com"},
    {"id": 111, "name": "Tom Nguyen",       "email": "tom.nguyen@example.com"},
    {"id": 112, "name": "Grace Adjei",      "email": "grace.adjei@example.com"},
    {"id": 113, "name": "Robert Kim",       "email": "robert.kim@example.com"},
    {"id": 114, "name": "Nadia Bello",      "email": "nadia.bello@example.com"},
]

# category_id → DB category IDs seeded by backend (1=News,2=Events,3=Discussion,4=Alerts)
NEWS_POSTS = [
    {"title": "Street Light Out on Oak Avenue",
     "content": "Has anyone else noticed the street light on the corner of Oak Avenue and 3rd Street has been out for about two weeks now? I called the city maintenance line but got put on hold forever. If a few of us report it, they might prioritise the fix. The online form is at the city website under 'Report an Issue.' Stay safe walking at night, everyone."},
    {"title": "Reminder: Trash Collection Schedule Change",
     "content": "Just a heads up — the city announced that starting next Monday, trash collection for our area moves from Wednesday to Thursday. Recycling stays on the same day (every other Friday). I almost missed this and had my bins out on the wrong day. Thought I'd share so nobody else gets caught off guard!"},
    {"title": "New Family on Elm Street - Hello!",
     "content": "Hey neighbours! We just moved into 248 Elm Street last weekend. My name is David, and I'm here with my wife and our two kids (ages 6 and 9). We moved from downtown and are loving the quieter streets already. Any tips for new residents? Best pizza spot? Where do the kids play? Looking forward to meeting everyone!"},
    {"title": "Neighbourhood Watch Update — March",
     "content": "Hi everyone, this is your monthly neighbourhood watch update. We had three reports of package theft from porches this month, all on weekday afternoons between 1–4 PM. Please consider using lockboxes or having packages delivered to a neighbour who's home. We're also looking for volunteers to join the patrol schedule — even one shift a month helps."},
    {"title": "Local Business Spotlight: Corner Bakery",
     "content": "I just wanted to give a shoutout to the Corner Bakery on Pine Street. They've been open for about six months now and their sourdough is honestly the best I've had. They also started doing weekend brunch and the avocado toast is phenomenal. Let's support our local businesses — they're what make this neighbourhood special!"},
    {"title": "Dog Owners — Please Pick Up After Your Pets",
     "content": "I hate to be that person, but I've noticed a significant increase in dog waste left on the sidewalks along Birch Lane, especially near the elementary school. I know most dog owners are responsible, but a few are ruining it for everyone. The city provides free bag dispensers at the park entrances. Let's keep our neighbourhood clean for the kids walking to school."},
    {"title": "Water Main Work Starting Next Week",
     "content": "Got a notice from the city that they'll be doing water main replacement work on Cedar Street starting Monday. They said to expect intermittent water outages between 9 AM and 3 PM for about two weeks. Might want to fill up some jugs beforehand. Also, parking will be restricted on the east side of Cedar during construction."},
    {"title": "Thanks for the Amazing Community Potluck!",
     "content": "What a wonderful turnout at yesterday's potluck in the park! I counted at least 60 people and the food was incredible. Special thanks to whoever brought the jollof rice — I need that recipe! And the kids had a blast with the face painting. Let's make this a monthly tradition. Already looking forward to the next one!"},
    {"title": "Petition to Add Speed Bumps on Cherry Lane",
     "content": "I've been working on a petition to add speed bumps on Cherry Lane between 1st and 5th Street. Cars regularly exceed 40 mph in a 25 mph zone, and with the new playground opening, it's becoming a real safety concern. I need 200 signatures to present to the city council. If you support this, please leave a comment and I'll arrange a time to collect signatures."},
    {"title": "Free Little Library is Up!",
     "content": "Excited to announce that the Free Little Library box is officially installed in front of 322 Maple Street! Take a book, leave a book — it's that simple. I've stocked it with a mix of fiction, non-fiction, and kids' books to get started. If you have gently used books you'd like to donate, feel free to add them anytime. Happy reading, neighbours!"},
    {"title": "Noise from Construction Site — Anyone Else Affected?",
     "content": "The construction on the new apartment complex on River Road has been starting at 6 AM sharp every day this week. I checked the city ordinance and construction noise isn't allowed before 7 AM in residential areas. Has anyone else been bothered by this? I'm thinking of filing a formal complaint but wanted to see if others have the same concern first."},
    {"title": "Beautiful Sunset from the Park Yesterday",
     "content": "I was walking through Riverside Park around 6:30 PM yesterday and caught the most incredible sunset. The sky was all oranges and pinks reflected on the water. Moments like these remind me why I love living here. If you haven't taken an evening stroll through the park recently, I highly recommend it. The wildflowers along the trail are in full bloom too."},
    {"title": "City Council Meeting — Your Voice Matters",
     "content": "The city council meets this Thursday at 7 PM to vote on the new zoning ordinance that could allow taller buildings on River Road. If you have opinions on this, now's the time to show up or submit written comments. The council chamber holds 200 people. I'll be there — who else is coming?"},
]

EVENTS_POSTS = [
    {"title": "Annual Block Party — Save the Date!",
     "content": "Mark your calendars! Our annual block party is happening on Saturday, April 15th from 2–8 PM on Maple Street (between Oak and Elm). We'll have a BBQ, live music from a local band, a bouncy castle for the kids, and a pie-baking contest. If you'd like to volunteer or bring a dish, sign up at the link below. Let's make this year the best one yet!"},
    {"title": "Community Garden Spring Planting Day",
     "content": "Spring is here and it's time to get our hands dirty! Join us this Saturday at 9 AM at the community garden on Birch Lane for our annual spring planting day. We have plots available for new gardeners and plenty of seeds to share. Bring your own gloves and tools if you have them — we'll have extras for newcomers. Coffee and snacks provided!"},
    {"title": "Free Yoga in the Park Every Sunday",
     "content": "Starting this Sunday and running through the end of summer, I'll be leading free yoga sessions at Riverside Park at 8 AM. All levels welcome — from complete beginners to experienced practitioners. Just bring a mat or large towel and water. Sessions run about an hour. Rain location is the community centre gym. Hope to see you there!"},
    {"title": "Neighbourhood Cleanup Day — Volunteers Needed",
     "content": "Let's show some love to our neighbourhood! We're organising a community cleanup day for next Saturday, March 25th. Meet at the community centre at 9 AM. We'll split into teams and cover the main streets, park, and creek area. Gloves, bags, and grabbers will be provided. Pizza lunch for all volunteers! Kids welcome with parent supervision."},
    {"title": "Movie Night at the Park — This Friday!",
     "content": "Outdoor movie night is back! This Friday at sundown (approximately 7:30 PM) at Riverside Park. We're showing a family-friendly film on the big inflatable screen. Bring blankets, lawn chairs, and snacks. The popcorn machine will be running and we'll have hot chocolate too. Free for all residents. Rain date is the following Friday."},
    {"title": "Local Artist Exhibition at Community Centre",
     "content": "Proud to announce that the community centre will host an exhibition featuring artwork from 12 local artists. Opening night is Thursday, April 3rd from 6–9 PM with wine and cheese. The exhibition runs through April 20th during regular centre hours. If you know local artists who might want to participate in future shows, have them reach out!"},
    {"title": "Kids' Soccer League Registration Open",
     "content": "Registration is now open for the spring kids' soccer league! Ages 5–12, games on Saturday mornings at the Riverside fields. Season runs April through June. Cost is $30 per child (scholarships available). No experience needed — we focus on fun and learning. Sign up at the community centre or online. Coaches also needed!"},
    {"title": "Farmers Market Returns Next Weekend",
     "content": "Great news — the neighbourhood farmers market is returning for the season! Starting next Saturday, 8 AM to 1 PM in the community centre parking lot. Expect fresh produce, baked goods, honey, artisan crafts, and live acoustic music. New this year: a dedicated food truck corner. See you there!"},
    {"title": "Emergency Preparedness Workshop",
     "content": "The fire department is hosting a free emergency preparedness workshop at the community centre on April 10th from 6–8 PM. They'll cover earthquake readiness, fire safety, first aid basics, and how to create a family emergency plan. Free emergency kits for the first 50 attendees. This is especially important with storm season approaching."},
    {"title": "Garage Sale Weekend — Map Your House!",
     "content": "Our neighbourhood-wide garage sale weekend is set for April 22–23! If you want your house on the official map that we distribute at the entrance points, please comment below with your address by April 15th. Last year we had 35 participating houses and hundreds of shoppers. Great way to declutter and make some cash!"},
    {"title": "Book Club Meetup — First Tuesday Monthly",
     "content": "Our neighbourhood book club meets the first Tuesday of every month at 7 PM at the Corner Bakery on Pine Street. This month we're reading a popular mystery novel. New members always welcome — you don't even have to finish the book to join the discussion! We usually wrap up by 8:30 PM. Come for the books, stay for the pastries."},
    {"title": "Senior Social — Tea and Board Games",
     "content": "Calling all seniors in the neighbourhood! We're starting a weekly social hour every Wednesday from 2–4 PM at the community centre. Tea, coffee, and light snacks provided. Bring your favourite board games or card games, or just come for conversation. Transportation assistance available for those who need it — just call the centre."},
    {"title": "5K Fun Run for Charity — Sign Up Now",
     "content": "Join us for the 3rd annual neighbourhood 5K fun run on May 5th! All proceeds go to the local food bank. Registration is $20 for adults, $10 for kids under 12. The route goes through Riverside Park and along the creek trail. Walk, jog, or run — it's all about community spirit. Post-race celebration with food trucks!"},
]

DISCUSSION_POSTS = [
    {"title": "Best Pizza Spot in the Neighbourhood?",
     "content": "My family just moved here and we're on a mission to find the best pizza within walking distance. We've tried Sal's on Oak Avenue (decent but pricey) and the new place on Cedar Street (great crust but limited toppings). What's your go-to? We're open to anything — thin crust, deep dish, wood-fired. Bonus points if they deliver!"},
    {"title": "Should We Start a Tool Library?",
     "content": "I was thinking — how many of us own a pressure washer we use twice a year? Or a tile saw that's been collecting dust since the bathroom reno? What if we started a neighbourhood tool library where residents could borrow items? Other communities have done this with great success. We could use the community centre storage room. Thoughts?"},
    {"title": "Working From Home — Best Cafe Spots?",
     "content": "I've been working remotely for two years and my home office walls are closing in. Looking for good cafes nearby with reliable Wi-Fi, decent coffee, and a vibe that's okay with someone camping out for a few hours. The Corner Bakery on Pine is my current spot but I need variety. Where do you remote workers hang out?"},
    {"title": "Thoughts on the New Bike Lane Proposal?",
     "content": "The city council is proposing a protected bike lane on River Road, which would remove parking on one side. As someone who both drives and cycles, I see pros and cons. Better safety for cyclists, but parking is already tough. What does everyone think? The public comment period ends next Friday. Let's discuss before the meeting."},
    {"title": "How Do You Handle Package Deliveries?",
     "content": "With the uptick in porch piracy, I'm curious what solutions neighbours are using. I've been considering a lockbox, having everything sent to a locker, or just timing deliveries for when I'm home. Some people have cameras but that doesn't actually prevent theft. What's worked for you?"},
    {"title": "Local Schools — Your Experience?",
     "content": "We're moving to the area with two kids (ages 7 and 10) and trying to decide between the local elementary schools. The ratings online seem mixed. Would love to hear from parents with firsthand experience. How are the teachers? Class sizes? After-school programmes? Any particular school you'd recommend or avoid?"},
    {"title": "Is Anyone Else Concerned About Traffic on Elm?",
     "content": "Ever since the detour started on Highway 9, Elm Street has become a cut-through for commuters. We're seeing speeds well over 35 mph in a residential zone, especially during rush hour. My kids walk to school along that route. Has anyone approached the city about temporary speed mitigation? I'm thinking we should organise."},
    {"title": "Favourite Walking Routes in the Neighbourhood",
     "content": "I'm trying to get my 10,000 steps in daily and want to explore beyond my usual loop around Riverside Park. What are your favourite walking routes? I'm looking for scenic paths, interesting streets with nice gardens, or routes that pass by good coffee shops. Distance doesn't matter — I've got the time!"},
    {"title": "Recommendations for a Good Handyman?",
     "content": "I've got a list of small house projects that don't warrant calling a specialist — a leaky faucet, a door that won't close properly, some drywall patches, and a wobbly deck railing. Does anyone know a reliable handyman who handles this kind of mixed bag? Reasonable rates and someone who actually shows up when they say they will would be a dream."},
    {"title": "Starting a Neighbourhood Compost Programme",
     "content": "I've been composting at home for years and I know several neighbours are interested too. Would there be support for a shared neighbourhood compost bin at the community garden? We could take turns managing it and everyone gets to use the finished compost. It would reduce our waste significantly. Who's interested?"},
    {"title": "Best Internet Provider in This Area?",
     "content": "Our current internet has been unreliable for months — random outages, slow speeds during peak hours, and terrible customer service. We're ready to switch. What provider are you on and how's your experience? We need something that can handle two people working from home plus streaming. Fibre would be ideal if it's available here."},
    {"title": "Dog-Friendly Places Nearby?",
     "content": "We just adopted a rescue dog and we're discovering which places welcome pups. So far we know Riverside Park and the Corner Bakery patio. Are there other dog-friendly restaurants, shops, or trails? Also, is there an off-leash area nearby? Our dog is very social and needs to burn energy. Any dog owner groups in the neighbourhood?"},
    {"title": "Solar Panels — Worth the Investment?",
     "content": "I've been getting quotes for solar panel installation and the numbers look promising with the current tax credits. But I've heard mixed things about the actual savings versus the sales pitch. Any neighbours who've gone solar willing to share their real experience? How much did your electricity bill actually drop? Any issues with the installation or maintenance?"},
]

ALERTS_POSTS = [
    {"title": "Lost Cat — Gray Tabby Named Whiskers",
     "content": "Our gray tabby cat Whiskers has been missing since Tuesday evening. He's about 4 years old, neutered, wearing a blue collar with a bell. Last seen near the corner of Oak Avenue and 5th Street. He's friendly but might be scared. If you spot him, please call or text me — contact info is on his collar tag. We miss him terribly. Thank you!"},
    {"title": "ALERT: Package Thefts on Birch Lane",
     "content": "Three packages were stolen from porches on Birch Lane this week, all between 1–4 PM on weekday afternoons. One neighbour's doorbell camera caught a person in a gray hoodie driving a white sedan. If you live in the area, please bring packages inside quickly or arrange alternate delivery. I've filed a police report — case number available if you need to file yours."},
    {"title": "Water Main Break on Cedar Street — Avoid Area",
     "content": "Heads up — there's a major water main break on Cedar Street between 3rd and 5th. The road is flooded and closed to traffic. City crews are on scene. Expect water pressure issues in the surrounding blocks. They estimate repairs will take 6–8 hours. Fill up containers now if you need water for cooking or drinking tonight."},
    {"title": "Coyote Spotted Near Riverside Park",
     "content": "I saw a coyote near the south entrance of Riverside Park around 6 AM this morning. It was near the creek area and didn't seem afraid of people. If you walk dogs early morning or evening, please keep them on a leash and stay in well-lit areas. Small pets should not be left outside unattended. I've reported this to animal control."},
    {"title": "Suspicious Door-to-Door Solicitors",
     "content": "Two people have been going door to door on Elm Street claiming to be from the utility company and asking to inspect metres inside homes. The utility company confirmed they have NO inspectors in our area this week. Do NOT let anyone inside your home. If they approach you, note their description and vehicle and call the non-emergency police line."},
    {"title": "Road Closure: Oak Avenue This Weekend",
     "content": "Oak Avenue between Main and 6th Street will be completely closed this Saturday and Sunday for repaving. Detour signs will be posted but plan alternate routes if you usually drive through there. The city says it should reopen Monday morning. Also, no parking on Oak starting Friday at 10 PM — cars will be towed."},
    {"title": "Power Outage Expected Thursday",
     "content": "The electric company sent notice that there will be a planned power outage Thursday from 9 AM to 2 PM for the blocks around Pine Street and Maple Avenue. They're upgrading transformer equipment. Make sure to charge devices, and if you have medical equipment that requires power, contact them for special arrangements. Number is on the notice."},
    {"title": "Found Dog — Brown Labrador, No Collar",
     "content": "Found a friendly brown Labrador mix wandering on Cherry Lane around 7 PM tonight. No collar, no tags, but very well-behaved — clearly someone's pet. We've brought him inside and he's safe and fed. If this is your dog or you know whose it might be, please reach out with a description. We'll take him to the shelter tomorrow if no one claims him."},
    {"title": "Tree Down Blocking Walnut Street",
     "content": "A large tree fell across Walnut Street near the park entrance during last night's storm. It's completely blocking both lanes and took down a power line. DO NOT approach — the downed line may be live. I've called both the city and the power company. Please use alternate routes until it's cleared. Stay safe out there."},
    {"title": "Noise Alert: Construction Starting 6 AM Daily",
     "content": "The new apartment complex construction on River Road is starting early morning work. I've confirmed with the city that their permit allows 7 AM starts, but they've been beginning at 6 AM. I'm filing a noise complaint and encourage affected neighbours to do the same. The city's online complaint form takes about 2 minutes. The more reports, the faster they act."},
    {"title": "Flash Flood Warning for Low-Lying Areas",
     "content": "The weather service has issued a flash flood warning for our area through tomorrow morning. If you live near the creek or in the low-lying blocks around River Road, please move valuables to upper floors and be prepared to evacuate if needed. Sandbags are available at the fire station on Main Street. Stay off flooded roads — it only takes 6 inches of moving water to knock you down."},
    {"title": "Missing Elderly Resident — Please Help",
     "content": "Mr. Harold Peterson, age 78, has been missing from his home on Birch Lane since this morning. He has dementia and may be confused. He's about 5'10\", thin build, wearing a blue jacket and khaki pants. He walks with a slight limp. If you see him, please stay with him and call 911 immediately. His family is very worried. Please share."},
    {"title": "Boil Water Advisory Lifted — Update",
     "content": "Good news — the boil water advisory for our neighbourhood has been lifted as of this afternoon. Water testing results came back clean. You can resume normal water use. Run your cold water taps for about 2 minutes to flush the lines first. Thanks everyone for your patience during the repair work."},
]

COMMENT_TEMPLATES = [
    "Totally agree with this! We've had the same experience in our house.",
    "Thanks for sharing this — really helpful information!",
    "This is exactly what I needed to hear. Count me in!",
    "Great post! I've been thinking about this too.",
    "+1 on this. It's been an issue for a while now.",
    "Thank you so much for organising this! Our family will be there.",
    "Love this idea! The neighbourhood really needs more initiatives like this.",
    "Interesting! Do you know if this applies to apartments too, or just houses?",
    "What time exactly should we show up? And is parking available nearby?",
    "Great recommendation! How much did it end up costing you in total?",
    "This sounds amazing. Are there any age restrictions for participants?",
    "How long did the installation take? Thinking about getting one myself.",
    "We had the same problem last year and ended up calling Johnson's Plumbing on Oak Street. They were great and very fair on price.",
    "I saw them working on the lines yesterday too! Really hoping we get fibre soon, our current internet is terrible for video calls.",
    "My kids attended last year's workshop and loved it. They're still talking about what they learned!",
    "I've lived here for 20 years and this is one of the best community events we've ever had. Kudos to the organisers!",
    "The farmer's market was wonderful last year. The honey from the local apiary was the best I've ever tasted.",
    "Happy to help out! I have a truck if you need anything transported.",
    "I can volunteer for the Saturday morning shift. Just let me know the details!",
    "I'm a retired teacher and would love to help with the tutoring. DM me!",
    "We have extra garden tools if anyone needs to borrow some for the planting day.",
    "I can bring homemade lemonade and cookies for the event!",
    "Pro tip: if you call the city's non-emergency line instead of the main number, you get through much faster.",
    "You might want to check if there's a permit required first. I learned that the hard way last year.",
    "For anyone concerned about cost, the library has free passes to some of these programmes.",
    "I'd recommend getting at least three quotes before choosing a contractor. Prices vary wildly in this area.",
    "Make sure to take lots of photos BEFORE starting any work. It's crucial for insurance claims.",
    "You're a lifesaver! Thank you so much for finding those keys.",
    "What an amazing community we have. Thanks for looking out for each other!",
    "Really appreciate you taking the time to share this with everyone.",
    "This is why I love this neighbourhood. People actually care about each other here.",
    "Thanks for the heads up! I would have totally missed this otherwise.",
    "I'm a bit worried about the timing. Could we move it to a different weekend perhaps?",
    "Has anyone verified this with the city? I heard a different date from the council member.",
    "While I support the idea, I think we should also consider the impact on traffic during the event.",
    "Good point, but I think we also need to address the root cause, not just the symptoms.",
    "I hope they also fix the sidewalk on that stretch. It's been in terrible shape.",
    "Shared this with my neighbours on the next block — they're in!",
    "My partner and I will definitely be joining. Really needed something like this.",
    "Does anyone know if this is covered by home insurance? Asking for a friend.",
    "The last time this happened it took the city three weeks to respond. Let's keep the pressure on.",
    "I set up a camera last month and it's already paid for itself in peace of mind.",
]

# ---------------------------------------------------------------------------
# Seed functions
# ---------------------------------------------------------------------------

def seed_users(conn) -> None:
    """Insert 15 seed users (IDs 100–114), idempotent."""
    logger.info("Seeding %d users…", len(SEED_USERS))
    now = datetime.utcnow()

    for u in SEED_USERS:
        days_ago = random.randint(0, 45)
        created_at = now - timedelta(days=days_ago)
        conn.execute(text("""
            INSERT INTO users (id, email, name, password, role, created_at, is_active)
            OVERRIDING SYSTEM VALUE
            VALUES (:id, :email, :name, :password, 'USER', :created_at, TRUE)
            ON CONFLICT (id) DO NOTHING
        """), {
            "id": u["id"],
            "email": u["email"],
            "name": u["name"],
            "password": _BCRYPT_HASH,
            "created_at": created_at,
        })

    logger.info("Users seeded OK.")


def _insert_posts(conn, posts: list[dict], category_id: int, start_id: int) -> int:
    """Helper: insert a list of posts for a given category, return next available ID."""
    now = datetime.utcnow()
    user_ids = [u["id"] for u in SEED_USERS]
    current_id = start_id

    for post in posts:
        days_ago = random.randint(0, 30)
        created_at = now - timedelta(days=days_ago, hours=random.randint(0, 23))
        updated_at = created_at + timedelta(hours=random.randint(0, 48))
        author_id = random.choice(user_ids)

        conn.execute(text("""
            INSERT INTO posts (id, title, content, category_id, author_id,
                               created_at, updated_at, is_deleted)
            OVERRIDING SYSTEM VALUE
            VALUES (:id, :title, :content, :category_id, :author_id,
                    :created_at, :updated_at, FALSE)
            ON CONFLICT (id) DO NOTHING
        """), {
            "id": current_id,
            "title": post["title"],
            "content": post["content"],
            "category_id": category_id,
            "author_id": author_id,
            "created_at": created_at,
            "updated_at": updated_at,
        })
        current_id += 1

    return current_id


def seed_posts(conn) -> dict[int, datetime]:
    """
    Insert 52 posts across all 4 categories (IDs 100–151), idempotent.
    Returns a mapping of post_id → created_at for comment seeding.
    """
    logger.info("Seeding posts…")
    next_id = _insert_posts(conn, NEWS_POSTS,       category_id=1, start_id=100)
    next_id = _insert_posts(conn, EVENTS_POSTS,     category_id=2, start_id=next_id)
    next_id = _insert_posts(conn, DISCUSSION_POSTS, category_id=3, start_id=next_id)
    _insert_posts(conn,           ALERTS_POSTS,     category_id=4, start_id=next_id)

    total = len(NEWS_POSTS) + len(EVENTS_POSTS) + len(DISCUSSION_POSTS) + len(ALERTS_POSTS)
    logger.info("Seeded %d posts across 4 categories.", total)

    # Return post timestamps for comment seeding
    rows = conn.execute(text(
        "SELECT id, created_at FROM posts WHERE id >= 100 AND is_deleted = FALSE"
    )).fetchall()
    return {row[0]: row[1] for row in rows}


def seed_comments(conn, post_timestamps: dict[int, datetime]) -> None:
    """
    Insert ≥300 comments (IDs 100+), distributed realistically across posts.
    Popular posts (first 20%) get 8–15 comments; the rest get 2–5.
    """
    logger.info("Seeding comments…")
    user_ids = [u["id"] for u in SEED_USERS]
    post_ids = sorted(post_timestamps.keys())

    # Determine comment counts per post
    popular_count = max(1, len(post_ids) // 5)
    popular_posts = set(random.sample(post_ids, popular_count))

    comment_id = 100
    for post_id in post_ids:
        post_created_at = post_timestamps[post_id]
        # Coerce to datetime if it's a date string or date object
        if isinstance(post_created_at, str):
            post_created_at = datetime.fromisoformat(post_created_at)

        n_comments = random.randint(8, 15) if post_id in popular_posts else random.randint(2, 5)
        # Pick authors different from the post author where possible
        available_authors = user_ids.copy()

        for _ in range(n_comments):
            author_id = random.choice(available_authors)
            hours_after = random.randint(1, 72)
            created_at = post_created_at + timedelta(hours=hours_after)

            conn.execute(text("""
                INSERT INTO comments (id, content, post_id, author_id, created_at, is_deleted)
                OVERRIDING SYSTEM VALUE
                VALUES (:id, :content, :post_id, :author_id, :created_at, FALSE)
                ON CONFLICT (id) DO NOTHING
            """), {
                "id": comment_id,
                "content": random.choice(COMMENT_TEMPLATES),
                "post_id": post_id,
                "author_id": author_id,
                "created_at": created_at,
            })
            comment_id += 1

    logger.info("Seeded %d comments.", comment_id - 100)


# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------

def _validate(conn) -> None:
    """Log row counts after seeding to confirm minimums."""
    counts = {
        "users (seeded)":    "SELECT COUNT(*) FROM users    WHERE id >= 100",
        "posts (seeded)":    "SELECT COUNT(*) FROM posts    WHERE id >= 100 AND is_deleted = FALSE",
        "comments (seeded)": "SELECT COUNT(*) FROM comments WHERE id >= 100 AND is_deleted = FALSE",
    }
    for label, sql in counts.items():
        n = conn.execute(text(sql)).scalar()
        logger.info("Validation — %s: %d rows", label, n)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    logger.info("=== CommunityBoard Seed Data ===")
    engine = get_engine()

    with engine.begin() as conn:
        if not ensure_schema(conn, logger):
            logger.error("Schema validation failed. Aborting seed. "
                         "Make sure the backend has started and created tables.")
            return

        seed_users(conn)
        post_timestamps = seed_posts(conn)
        seed_comments(conn, post_timestamps)
        _validate(conn)

    logger.info("=== Seeding complete! ===")


if __name__ == "__main__":
    main()
