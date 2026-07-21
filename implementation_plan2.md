# SimuFlux Lab — Centralized Multi-Course Registration Links (Option B)

Migrates the link-generation system to a centralized modal interface. Admins will be able to select multiple courses, specify negotiated prices for Price Inquiry courses, and generate a single unified registration link. The link status log will be hidden under an elegant collapse/dropdown menu in the modal.

## User Review Required

> [!IMPORTANT]
> **Schema Evolution**: The `registrationLinks` collection will transition from storing a single `courseSlug` and `negotiatedPrice` to storing a `courses` array:
> ```json
> {
>   "token": "...",
>   "courses": [
>     { "slug": "testing-extended", "negotiatedPrice": 10000 },
>     { "slug": "ansys-fluent", "negotiatedPrice": 15000 }
>   ],
>   "status": "pending",
>   "createdAt": "..."
> }
> ```
> Existing pending/used tokens will be automatically supported via fallback handlers.

---

## Proposed Changes

### 1. MODIFY — app/api/registration-links/route.js
- **POST**: Accept `courses` in request body as an array of `{ courseSlug, negotiatedPrice }`.
  - Validate that `courses` is a non-empty array.
  - Fetch corresponding course documents from the DB.
  - If any course has `price === null`, require `negotiatedPrice` and validate it is a non-negative number.
  - Save the array in the `registrationLinks` document.
  - Return `registrationUrl` based on the first course slug in the selection: `/register/${courses[0].courseSlug}?token=${token}`.
- **GET**: Return the array of `courses` (with slugs and negotiated prices) in the JSON response.
  - Backward compatibility: If the database document has the old `courseSlug` and `negotiatedPrice` fields, map them to the new format: `courses: [{ slug: link.courseSlug, negotiatedPrice: link.negotiatedPrice }]`.

---

### 2. MODIFY — app/admin/(dashboard)/courses/page.js
- **Simplify Course Cards**:
  - Remove the inline "Agreed price" input field, "Generate Link" button, and status history logs from individual course cards.
  - Show simple "Edit" and "Delete" actions.
- **New Link Generator Modal**:
  - Add a "Create custom registration link" button at the top of the page.
  - When clicked, open a Modal with:
    - Multi-select checkbox/list of courses.
    - Conditional price input fields for any selected course that has `price === null`.
    - A "Generate Link" button.
    - A toggleable collapse section ("View Link History") listing generated tokens, their courses, prices, and status (`Pending`/`Used`) in a clean table.
- **No Flashy UI**: Style the modal with a solid dark navy background (`bg-navy`), simple borders (`border-hairline`), and flat buttons—absolutely no glassmorphism or blur backdrops.

---

### 3. MODIFY — app/register/[courseSlug]/page.js
- In `validateToken()`, fetch the token document.
- Parse the `courses` array (with fallback for old single-course tokens).
- Check if the current page slug matches any course slug in the token's course list.
- Map all token courses into a pricing overrides map to pass down to `RegistrationForm`.
- If the course slug is a Price Inquiry course (`price === null`) and the token is missing or doesn't override this course's price, block registration.
- Pre-select and lock all courses specified in the token's course list.

---

### 4. MODIFY — components/shared/RegistrationForm.jsx
- **Props**: Accept `priceOverridesMap` (an object mapping `courseSlug` -> `price`).
- **Initial State**: Pre-check all courses that are defined in `priceOverridesMap`.
- **Checkbox list locking**: Lock (disable) any course checkbox that is defined in `priceOverridesMap` (so users cannot deselect negotiated courses).
- **Price Resolution**: Resolve course prices using `priceOverridesMap` when calculating subtotal and total prices.

---

### 5. MODIFY — app/api/register/route.js (POST)
- In the token validation and claim block:
  - If a token is provided, verify it is pending.
  - Map `dbCourses` so that any course matching a slug in the token's list has its price replaced by the token's negotiated price.
  - Guard: If any course remains with a `null` price, reject with 400.

---

## Verification Plan

### Automated Tests
- Run `node --experimental-vm-modules scripts/test-pricing-engine.js` to ensure the pricing engine itself remains fully valid.

### Manual Verification
- Deploy and open the Admin Courses dashboard.
- Verify that course cards are simplified.
- Click the generator button to verify the modal opens.
- Generate a link for a Price Inquiry course and a fixed-price course combined.
- Open the toggleable link history log inside the modal to verify status.
- Visit the generated URL, verify both courses are pre-checked, locked, and have their prices overridden.
- Complete registration and verify email contains correct pricing.
