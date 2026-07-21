/**
 * Shared Pricing Engine
 * 
 * This is the single source of truth for all pricing calculations.
 * Used by: Enroll Page, Registration Page, Server APIs, Emails, Google Sheets
 * 
 * Priority Order:
 * 1. Combo Package (highest)
 * 2. Course Promotion (medium)
 * 3. Volume/Tier Discount (lowest)
 * 
 * Only ONE promotion type applies at a time.
 */

/**
 * Calculate pricing based on selected courses and available promotions
 * 
 * @param {Array} courses - Array of course objects with { _id, title, slug, price, discountPercent }
 * @param {Array} comboDeals - Array of combo deal objects with { courseIds, discountPercent, label }
 * @param {Array} discountTiers - Array of tier objects with { minCourses, discountPercent }
 * @returns {Object} Pricing calculation result
 */
export function calculatePricing(courses, comboDeals = [], discountTiers = []) {
  // De-duplicate incoming courses by _id BEFORE any calculation, so subtotal,
  // selectedCount, and combo matching all operate on the exact same list.
  const seenIds = new Set();
  courses = courses.filter(c => {
    const key = String(c._id);
    if (seenIds.has(key)) return false;
    seenIds.add(key);
    return true;
  });

  const fixedCourses = courses.filter(c => c.price !== null && c.price !== undefined);
  const inquiryCourses = courses.filter(c => c.price === null || c.price === undefined);
  const hasInquiry = inquiryCourses.length > 0;

  if (fixedCourses.length === 0) {
    return {
      subtotal: null,
      discountPercent: 0,
      discountAmount: 0,
      totalPrice: null,
      discountSource: 'none',
      discountReason: 'Pricing contains a course requiring manual inquiry.',
      activeComboDeal: null,
      hasIndividualDiscount: false,
      selectedCount: courses.length,
      subtotalDisplay: 'Price Inquiry',
      totalPriceDisplay: 'Price Inquiry',
      hasInquiry: true,
      inquiryCount: inquiryCourses.length,
    };
  }

  // Calculate basic values for fixed courses
  const subtotal = fixedCourses.reduce((sum, c) => sum + (c.price || 0), 0);
  const selectedCount = fixedCourses.length;
  // Normalize IDs to strings for comparison (handles ObjectId vs string mismatch)
  const selectedIds = fixedCourses.map(c => String(c._id)).sort();

  // Step 1: Check for exact combo deal match (highest priority) - using MongoDB IDs
  let activeComboDeal = null;
  for (const deal of comboDeals || []) {
    const dealIds = (deal.courseIds || []).map(String).sort();
    if (selectedIds.length === dealIds.length &&
        selectedIds.every((id, i) => id === dealIds[i])) {
      activeComboDeal = deal;
      break;
    }
  }

  // Step 2: Check if any course has individual discount
  let hasIndividualDiscount = false;
  let priceWithCourseDiscounts = 0;
  for (const course of fixedCourses) {
    const coursePrice = course.price || 0;
    if (course.discountPercent && course.discountPercent > 0) {
      hasIndividualDiscount = true;
      priceWithCourseDiscounts += coursePrice * (1 - course.discountPercent / 100);
    } else {
      priceWithCourseDiscounts += coursePrice;
    }
  }

  // Step 3: Apply priority logic
  let discountPercent = 0;
  let discountAmount = 0;
  let totalPrice = subtotal;
  let discountSource = 'none';
  let discountReason = '';

  if (activeComboDeal) {
    // Priority 1: Apply combo discount only
    discountPercent = activeComboDeal.discountPercent;
    discountAmount = (subtotal * discountPercent) / 100;
    totalPrice = subtotal - discountAmount;
    discountSource = 'combo';
    discountReason = activeComboDeal.label || 'Your selected courses qualify for a Combo Package discount.';
  } else if (hasIndividualDiscount) {
    // Priority 2: Apply individual course discounts only
    totalPrice = priceWithCourseDiscounts;
    discountPercent = ((subtotal - totalPrice) / subtotal) * 100;
    discountAmount = subtotal - totalPrice;
    discountSource = 'individual';
    
    // Build reason string for courses with discounts
    const discountedCourses = fixedCourses
      .filter(c => c.discountPercent && c.discountPercent > 0)
      .map(c => c.title);
    discountReason = discountedCourses.length === 1
      ? `${discountedCourses[0]} has an active promotional discount.`
      : `${discountedCourses.join(', ')} have active promotional discounts.`;
  } else {
    // Priority 3: Apply tier/volume discount only
    // Note: use the total count of selected courses (fixed + inquiry) so students get credit for volume
    const totalCountForTier = courses.length;
    let activeTier = null;
    const sortedTiers = [...discountTiers].sort((a, b) => a.minCourses - b.minCourses);
    for (let i = sortedTiers.length - 1; i >= 0; i--) {
      if (totalCountForTier >= sortedTiers[i].minCourses) {
        activeTier = sortedTiers[i];
        break;
      }
    }

    if (activeTier) {
      const tierDiscount = activeTier.discountPercent;
      totalPrice = subtotal * (1 - tierDiscount / 100);
      discountPercent = tierDiscount;
      discountAmount = subtotal - totalPrice;
      discountSource = 'tier';
      discountReason = `You selected ${totalCountForTier} course${totalCountForTier > 1 ? 's' : ''} and qualified for the Volume Discount.`;
    } else {
      totalPrice = subtotal;
      discountSource = 'none';
      discountReason = 'No promotion applies.';
    }
  }

  // Round to 2 decimal places for currency
  totalPrice = Math.round(totalPrice * 100) / 100;
  discountAmount = Math.round(discountAmount * 100) / 100;
  discountPercent = Math.round(discountPercent * 100) / 100;

  // Prepare display strings
  let subtotalDisplay = `PKR ${subtotal.toLocaleString()}`;
  let totalPriceDisplay = `PKR ${totalPrice.toLocaleString()}`;

  if (hasInquiry) {
    subtotalDisplay += ' + Price Inquiry';
    totalPriceDisplay += ' + Price Inquiry';
    if (discountSource === 'none') {
      discountReason = 'Volume discounts and promotions applied to fixed-price courses.';
    }
  }

  return {
    subtotal: hasInquiry ? null : subtotal,
    discountPercent,
    discountAmount,
    totalPrice: hasInquiry ? null : totalPrice,
    discountSource,
    discountReason,
    activeComboDeal,
    hasIndividualDiscount,
    selectedCount: courses.length,
    // New mixed-cart properties
    fixedSubtotal: subtotal,
    fixedTotalPrice: totalPrice,
    subtotalDisplay,
    totalPriceDisplay,
    hasInquiry,
    inquiryCount: inquiryCourses.length,
  };
}

/**
 * Get promotion badge for a specific course based on active discount source
 * 
 * @param {Object} course - Course object
 * @param {string} discountSource - Active discount source ('combo', 'individual', 'tier', 'none')
 * @returns {string|null} Badge text or null
 */
export function getCourseBadge(course, discountSource) {
  if (discountSource === 'combo') {
    return 'Included in Combo';
  }
  
  if (discountSource === 'individual' && course.discountPercent && course.discountPercent > 0) {
    return `${course.discountPercent}% OFF`;
  }
  
  if (discountSource === 'tier') {
    return 'Volume Discount';
  }
  
  return null;
}

/**
 * Get display label for discount source
 * 
 * @param {string} discountSource - Discount source identifier
 * @returns {string} Human-readable label
 */
export function getDiscountSourceLabel(discountSource) {
  const labels = {
    combo: 'Combo Package',
    individual: 'Course Promotion',
    tier: 'Volume Discount',
    none: 'No Promotion'
  };
  return labels[discountSource] || 'Unknown';
}
