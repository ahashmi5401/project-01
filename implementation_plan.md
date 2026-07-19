# Consultancy Services — Blog-Style Pages (Like Courses)

Convert consultancy services from a query-param single-page viewer into proper dedicated blog routes, identical in architecture to how courses work. Each service gets its own URL (`/consultancy/cfd`, `/consultancy/fea`, etc.) with a full-page blog layout, fetched from MongoDB, editable from the admin panel.

---

## What Changes

### 1. MongoDB Schema — Add Blog Fields to Each Service

The current `services` collection documents only have:
`id`, `title`, `shortDescription`, `detail`, `image`, `points`, `slug`

We will add **new blog-specific fields** so admins can fill them from the panel:

| New Field | Type | Purpose |
|---|---|---|
| `overview` | `string` | Long-form intro paragraph (replaces `shortDescription` for the blog view) |
| `methodology` | `string` | How the service is executed (process description) |
| `applications` | `string[]` | Industry use cases (e.g. "Aerospace", "Automotive") |
| `deliverables` | `string[]` | What the client receives (reports, CAD files, etc.) |
| `tools` | `string[]` | Software tools used (ANSYS, SolidWorks, etc.) |
| `projectScope` | `string` | Typical scope/timeline description |
| `faqs` | `{question, answer}[]` | Optional FAQ section |

---

## Proposed Changes

### ① New Page Route

---

#### [NEW] `app/consultancy/[slug]/page.js`
- Server Component — fetches service from `db.collection('services').findOne({ slug })`.
- Uses `notFound()` if slug doesn't exist.
- Generates dynamic `<title>` and `<meta description>` via `generateMetadata()`.
- Injects JSON-LD structured data (`Service` schema).
- Full-page blog layout:
  - **Hero section**: Full-width title, eyebrow label, accent underline, short description + image on right (the 2-column split we already have).
  - **Inquiry Strip** *(between hero and body)*: A clean full-width strip with a short prompt line on the left (e.g. "Have a project requirement?") and two inline buttons on the right — **Inquire via WhatsApp** and **Send Inquiry** — separated by a `border-t border-b border-hairline`.
  - **Body sections** (stacked, separated by `border-t border-hairline`):
    - `[ OVERVIEW ]` — `overview` field
    - `[ METHODOLOGY ]` — `methodology` field  
    - `[ APPLICATIONS ]` — grid of `applications[]` pills
    - `[ KEY DELIVERABLES ]` — numbered checklist of `deliverables[]`
    - `[ TOOLS & SOFTWARE ]` — `tools[]` icon badges
    - `[ PROJECT SCOPE ]` — `projectScope` paragraph
    - `[ FAQ ]` — accordion-style `faqs[]` (if present)
  - **CTA Banner** at bottom with WhatsApp/Inquiry button.

---

### ② Update Welcome Page & Navigation Links

---

#### [MODIFY] `components/consultancy/ServicesGrid.jsx`
- Remove the query-param detail view entirely (`?service=slug` logic).
- The welcome state remains as-is (capabilities list).
- All links point to `/consultancy/[slug]` (proper route).

#### [MODIFY] `app/consultancy/page.js`
- Remove `searchParams` logic and the conditional layout splitting.
- Always renders the welcome header + capabilities list + CTA banner.
- Clean up unused imports.

#### [MODIFY] `components/home/ScopeList.jsx`
- Update links from `/consultancy?service=slug` → `/consultancy/slug`.

#### [MODIFY] `app/sitemap.js`
- Update dynamic service URLs to `/consultancy/slug`.

---

### ③ Admin Panel — New Blog Fields

---

#### [MODIFY] `app/admin/(dashboard)/services/page.js`
Add new form inputs to the service editor:

- **Overview** — Large `<textarea>` (long-form intro)
- **Methodology** — Large `<textarea>` (process description)
- **Applications** — Dynamic tag array (like `points[]`)
- **Deliverables** — Dynamic list (like `points[]`)
- **Tools & Software** — Dynamic tag list
- **Project Scope** — `<textarea>`
- **FAQs** — Dynamic list of `{question, answer}` pairs with + Add FAQ button

---

### ④ API Update

---

#### [MODIFY] `app/api/services/route.js`
- Ensure `PUT`/`POST` handlers pass through and save all new blog fields to MongoDB.

---

## Verification Plan

### Manual Verification
1. Go to `/consultancy` → welcome page shows correctly.
2. Click a service from the Navbar dropdown → navigates to `/consultancy/cfd`.
3. The page renders with full blog layout, all sections visible.
4. Go to Admin → Services → edit a service, fill new fields, save → refresh public page → new content visible.

> [!IMPORTANT]
> This restores the `/consultancy/[slug]` nested route which was deleted in a prior session. This time it is the **primary** page (not a duplicate), as the query-param system will be completely removed.
