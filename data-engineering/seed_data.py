"""
CommunityBoard Seed Data Generator
Uses Faker to generate realistic neighbourhood content.

ID convention (per README):
  Backend seed data  : 1–99
  Data Engineering   : 100–999  ← this file
  Application runtime: 1000+

Actual DB schema (from inspection):
  users    : id, created_at, email, name, password, role
  posts    : id, content, created_at, image_url, title, updated_at, author_id, category_id
  comments : id, body, created_at, updated_at, author_id, post_id
  categories: id, description, name

Safe to re-run: ON CONFLICT (id) DO NOTHING on all tables.
Uses OVERRIDING SYSTEM VALUE to support GENERATED ALWAYS AS IDENTITY columns.
"""
import random
import bcrypt
from datetime import datetime, timedelta
from faker import Faker
from sqlalchemy import inspect, text
from db import get_engine, get_logger, validate_schema

logger     = get_logger("seed_data")
engine     = get_engine()

FAKER_SEED = 42
fake       = Faker("en_GB")
Faker.seed(FAKER_SEED)
random.seed(FAKER_SEED)

CATEGORIES      = ["NEWS", "EVENT", "DISCUSSION", "ALERT"]
HASHED_PASSWORD = bcrypt.hashpw(b"password123", bcrypt.gensalt()).decode("utf-8")


# ─────────────────────────────────────────
# FAKER CONTENT GENERATORS
# ─────────────────────────────────────────

def generate_title(category: str) -> str:
    templates = {
        "NEWS": [
            lambda: f"{fake.city()} Community Center Opens {fake.month_name()}",
            lambda: f"Road Works Planned for {fake.street_name()} Starting {fake.day_of_week()}",
            lambda: f"New Bus Route Through {fake.city_suffix()} District Launches {fake.month_name()}",
            lambda: f"Water Supply Interruption on {fake.street_name()}: {fake.day_of_week()}",
            lambda: f"Council Approves Budget for {fake.street_name()} Upgrade",
            lambda: f"Power Outage Scheduled for Sector {fake.bothify(text='?').upper()}: {fake.day_of_week()}",
            lambda: f"Local School Receives {random.randint(100, 800)} New Library Books",
        ],
        "EVENT": [
            lambda: f"Community Clean-Up Day – {fake.day_of_week()} {fake.time('%I%p')}",
            lambda: f"Annual {fake.city_suffix()} Cultural Festival – {fake.month_name()} {random.randint(1, 28)}",
            lambda: f"Free Health Screening at {fake.street_name()} Hall",
            lambda: f"Town Hall Meeting – {fake.day_of_week()} {fake.time('%I%p')}",
            lambda: f"Cooking Workshop: Traditional Recipes with {fake.first_name()}",
            lambda: f"Charity Run for Local Families – {fake.month_name()} {random.randint(1, 28)}",
            lambda: f"Neighbourhood Football Tournament – {random.randint(2, 5)} Weekends",
        ],
        "DISCUSSION": [
            lambda: f"Should We Add Speed Bumps on {fake.street_name()}?",
            lambda: f"Proposal: Weekly Farmers Market at {fake.street_name()}",
            lambda: f"Poor Mobile Coverage Near {fake.street_name()} – Anyone Else?",
            lambda: f"Stray Animals Near {fake.street_name()} Market – What Can We Do?",
            lambda: f"Ideas for the Vacant Lot on {fake.street_name()}",
            lambda: f"Late Night Construction Noise on {fake.street_name()} – Anyone?",
            lambda: f"Parking Issues Outside {fake.company()} – Suggestions?",
        ],
        "ALERT": [
            lambda: f"Large Pothole on {fake.street_name()} Junction – Avoid",
            lambda: f"Suspicious Activity Near {fake.street_name()} Market – Stay Alert",
            lambda: f"Planned Power Outage – Sector {fake.bothify(text='?').upper()} – {fake.day_of_week()}",
            lambda: f"Water Quality Advisory – Boil Before Use – {fake.street_name()} Area",
            lambda: f"Speeding Vehicles Near {fake.street_name()} School – Children at Risk",
            lambda: f"Flooding Risk on {fake.street_name()} – Heavy Rain Forecast",
            lambda: f"Lost {fake.first_name()} – Last Seen Near {fake.street_name()} Market",
        ],
    }
    return random.choice(templates[category])()


def generate_content(category: str) -> str:
    templates = {
        "NEWS": [
            lambda: (
                f"The {fake.city_suffix()} council has confirmed that {fake.street_name()} will undergo "
                f"major repairs starting {fake.month_name()} {random.randint(1, 28)}. "
                f"Residents can expect disruptions from {fake.time('%I%p')} to {fake.time('%I%p')} on weekdays. "
                f"A bypass route via {fake.street_name()} has been recommended. "
                f"Contact the council office on {fake.phone_number()} for further information."
            ),
            lambda: (
                f"A new community initiative backed by {fake.company()} will bring "
                f"{random.randint(50, 500)} resources to {fake.street_name()} starting next {fake.month_name()}. "
                f"The project aims to benefit over {random.randint(100, 2000)} local residents. "
                f"Registration opens {fake.day_of_week()} at the community office."
            ),
        ],
        "EVENT": [
            lambda: (
                f"Join us at {fake.street_name()} Park on {fake.day_of_week()} at {fake.time('%I%p')} "
                f"for our community event. This initiative welcomes all residents. "
                f"Refreshments provided. Contact {fake.first_name()} on {fake.phone_number()} to RSVP."
            ),
            lambda: (
                f"The annual {fake.city_suffix()} gathering returns on {fake.month_name()} {random.randint(1, 28)}. "
                f"Featuring {random.randint(5, 30)} stalls, live music, and activities for children. "
                f"Entry is free. Stall registration closes {fake.day_of_week()} — contact {fake.email()}."
            ),
        ],
        "DISCUSSION": [
            lambda: (
                f"I have noticed an ongoing issue near {fake.street_name()} that affects many of us. "
                f"Over the past {random.randint(2, 12)} weeks the situation has worsened. "
                f"Has anyone else experienced this? I spoke to {fake.first_name()} from the council "
                f"but received no clear response. What steps should we take as a community?"
            ),
            lambda: (
                f"Following a conversation with several neighbours on {fake.street_name()}, "
                f"I would like to propose a new community initiative. "
                f"The idea would benefit approximately {random.randint(50, 500)} households. "
                f"I need {random.randint(5, 20)} volunteers to get this off the ground. "
                f"Please reply here or contact me at {fake.email()}."
            ),
        ],
        "ALERT": [
            lambda: (
                f"URGENT: A safety issue has been identified near {fake.street_name()} "
                f"affecting residents in blocks {random.randint(1, 5)}–{random.randint(6, 15)}. "
                f"Please avoid the area between {fake.time('%I%p')} and {fake.time('%I%p')} if possible. "
                f"The relevant authority has been notified. "
                f"Contact {fake.phone_number()} for emergencies."
            ),
            lambda: (
                f"Residents near {fake.street_name()} are advised to take precautions. "
                f"The {fake.company()} authority issued this advisory at {fake.time('%I:%M%p')} today. "
                f"Estimated resolution: {fake.day_of_week()} {fake.time('%I%p')}. "
                f"Backup supplies available at {fake.street_name()} Community Hall."
            ),
        ],
    }
    return random.choice(templates[category])()


def generate_comment() -> str:
    templates = [
        lambda: f"Thanks for sharing this. {fake.sentence()} Will pass this on to neighbours on {fake.street_name()}.",
        lambda: f"I noticed the same thing near {fake.street_name()} last {fake.day_of_week()}. {fake.sentence()}",
        lambda: f"Has anyone contacted {fake.company()} about this? {fake.sentence()}",
        lambda: f"I fully support this. {fake.sentence()} Count me in for volunteering.",
        lambda: f"This affects our area on {fake.street_name()} too. {fake.sentence()}",
        lambda: f"Good point. {fake.sentence()} I will raise this at the next meeting.",
        lambda: f"I spoke to {fake.first_name()} from the council. {fake.sentence()}",
        lambda: f"{fake.sentence()} Is there a sign-up sheet or contact?",
        lambda: f"Shared this with our {fake.street_name()} group. {fake.sentence()}",
        lambda: f"Finally! {fake.sentence()} This has been an issue for {random.randint(2, 12)} months.",
    ]
    return random.choice(templates)()


# ─────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────

def random_date(days_back: int = 30) -> datetime:
    offset_minutes = random.randint(0, days_back * 24 * 60)
    return datetime.now() - timedelta(minutes=offset_minutes)


def uses_identity(table: str, column: str = "id") -> bool:
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT identity_generation
                FROM   information_schema.columns
                WHERE  table_name = :table AND column_name = :col
            """), {"table": table, "col": column}).fetchone()
        return result is not None and result[0] == "ALWAYS"
    except Exception:
        return False


# ─────────────────────────────────────────
# SEED FUNCTIONS
# ─────────────────────────────────────────

def seed_categories(conn) -> None:
    for name in CATEGORIES:
        conn.execute(text("""
            INSERT INTO categories (name, description)
            VALUES (:name, :description)
            ON CONFLICT (name) DO NOTHING
        """), {
            "name":        name,
            "description": f"Posts related to neighbourhood {name.lower()} updates.",
        })
    logger.info("Categories ensured: %s", CATEGORIES)


def seed_users(conn, count: int = 10) -> None:
    override = "OVERRIDING SYSTEM VALUE" if uses_identity("users") else ""
    inserted = 0
    for i in range(count):
        uid   = 100 + i
        name  = fake.name()
        email = f"seed.user{uid}@communityboard.test"
        ts    = random_date(45)

        result = conn.execute(text(f"""
            INSERT INTO users (id, name, email, password, role, created_at)
            {override}
            VALUES (:id, :name, :email, :password, 'USER', :created_at)
            ON CONFLICT (id) DO NOTHING
        """), {
            "id": uid, "name": name, "email": email,
            "password": HASHED_PASSWORD, "created_at": ts,
        })
        inserted += result.rowcount

    logger.info("Users: %d inserted, %d already existed", inserted, count - inserted)


def seed_posts(conn, num_posts: int = 60) -> list:
    override = "OVERRIDING SYSTEM VALUE" if uses_identity("posts") else ""

    user_rows = conn.execute(text("SELECT id FROM users WHERE role = 'USER'")).fetchall()
    cat_rows  = conn.execute(text("SELECT id, name FROM categories")).fetchall()

    user_ids = [r[0] for r in user_rows]
    cat_map  = {r[1]: r[0] for r in cat_rows}

    post_ids = []
    for i in range(num_posts):
        pid      = 200 + i
        cat_name = random.choice(CATEGORIES)
        ts       = random_date(30)

        conn.execute(text(f"""
            INSERT INTO posts (id, title, content, created_at, updated_at,
                               author_id, category_id, image_url)
            {override}
            VALUES (:id, :title, :content, :created_at, :updated_at,
                    :author_id, :category_id, NULL)
            ON CONFLICT (id) DO NOTHING
        """), {
            "id":          pid,
            "title":       generate_title(cat_name),
            "content":     generate_content(cat_name),
            "created_at":  ts,
            "updated_at":  ts,
            "author_id":   random.choice(user_ids),
            "category_id": cat_map[cat_name],
        })
        post_ids.append(pid)

    logger.info("Posts seeded: %d (IDs 200–%d)", len(post_ids), 200 + num_posts - 1)
    return post_ids


def seed_comments(conn, post_ids: list, num_comments: int = 240) -> None:
    override = "OVERRIDING SYSTEM VALUE" if uses_identity("comments") else ""

    user_rows = conn.execute(text("SELECT id FROM users")).fetchall()
    user_ids  = [r[0] for r in user_rows]

    weights = [random.uniform(0.5, 3.0) for _ in post_ids]
    total_w = sum(weights)
    weights = [w / total_w for w in weights]

    for i in range(num_comments):
        ts = random_date(29)
        conn.execute(text(f"""
            INSERT INTO comments (id, body, created_at, updated_at, post_id, author_id)
            {override}
            VALUES (:id, :body, :created_at, :updated_at, :post_id, :author_id)
            ON CONFLICT (id) DO NOTHING
        """), {
            "id":         500 + i,
            "body":       generate_comment(),
            "created_at": ts,
            "updated_at": ts,
            "post_id":    random.choices(post_ids, weights=weights, k=1)[0],
            "author_id":  random.choice(user_ids),
        })

    logger.info("Comments seeded: %d (IDs 500–739)", num_comments)


def advance_sequences(conn) -> None:
    for table in ["users", "posts", "comments", "categories"]:
        try:
            conn.execute(text(f"""
                SELECT setval(
                    pg_get_serial_sequence('{table}', 'id'),
                    GREATEST((SELECT COALESCE(MAX(id), 0) FROM {table}), 999) + 1
                )
            """))
            logger.info("Sequence advanced for table: %s", table)
        except Exception as e:
            logger.warning("Could not advance sequence for %s: %s", table, e)


# ─────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────

def run_seed() -> None:
    logger.info("=" * 55)
    logger.info("CommunityBoard Seed Data Generator (Faker seed=%d)", FAKER_SEED)
    logger.info("=" * 55)

    validate_schema()

    with engine.begin() as conn:
        logger.info("[1/5] Seeding categories...")
        seed_categories(conn)

        logger.info("[2/5] Seeding users (IDs 100–109)...")
        seed_users(conn, count=10)

        logger.info("[3/5] Seeding posts (IDs 200–259)...")
        post_ids = seed_posts(conn, num_posts=60)

        logger.info("[4/5] Seeding comments (IDs 500–739)...")
        seed_comments(conn, post_ids, num_comments=240)

        logger.info("[5/5] Advancing sequences to 1000+...")
        advance_sequences(conn)

    logger.info("=" * 55)
    logger.info("Seed complete. Next: python etl_pipeline.py")
    logger.info("=" * 55)


if __name__ == "__main__":
    run_seed()