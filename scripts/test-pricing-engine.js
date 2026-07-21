/**
 * Test script for pricing engine
 * Verifies the priority logic: Combo → Course Promotion → Volume
 */

import { calculatePricing, getCourseBadge, getDiscountSourceLabel } from '../lib/pricingEngine.js';

// Mock data
const courses = [
  { _id: '1', title: 'ANSYS Mechanical', slug: 'ansys-mechanical', price: 15000, discountPercent: 80 },
  { _id: '2', title: 'ANSYS Fluent', slug: 'ansys-fluent', price: 15000, discountPercent: 0 },
  { _id: '3', title: 'SolidWorks', slug: 'solidworks', price: 12000, discountPercent: 0 },
  { _id: '4', title: 'Creo Parametric', slug: 'creo-parametric', price: 12000, discountPercent: 0 },
];

const comboDeals = [
  { courseIds: ['1', '2'], discountPercent: 50, label: 'Engineering Simulation Bundle' },
];

const discountTiers = [
  { minCourses: 2, discountPercent: 10 },
  { minCourses: 3, discountPercent: 15 },
  { minCourses: 5, discountPercent: 20 },
];

// Test Case 1: Exact Combo Package match
console.log('\n=== Test Case 1: Exact Combo Package ===');
const selected1 = courses.filter(c => ['1', '2'].includes(c._id));
const result1 = calculatePricing(selected1, comboDeals, discountTiers);
console.log('Selected:', selected1.map(c => c.title));
console.log('Discount Source:', result1.discountSource);
console.log('Discount Percent:', result1.discountPercent);
console.log('Original Total:', result1.subtotal);
console.log('Final Price:', result1.totalPrice);
console.log('Reason:', result1.discountReason);
console.log('Expected: Combo Package with 50% discount');
const pass1 = result1.discountSource === 'combo' && result1.discountPercent === 50;
console.log('✓ PASS:', pass1);

// Test Case 2: Course Promotion (single course with discount)
console.log('\n=== Test Case 2: Course Promotion ===');
const selected2 = courses.filter(c => c.slug === 'ansys-mechanical');
const result2 = calculatePricing(selected2, comboDeals, discountTiers);
console.log('Selected:', selected2.map(c => c.title));
console.log('Discount Source:', result2.discountSource);
console.log('Discount Percent:', result2.discountPercent);
console.log('Original Total:', result2.subtotal);
console.log('Final Price:', result2.totalPrice);
console.log('Reason:', result2.discountReason);
console.log('Expected: Course Promotion with 80% discount');
const pass2 = result2.discountSource === 'individual' && result2.discountPercent === 80;
console.log('✓ PASS:', pass2);

// Test Case 3: Volume Discount (multiple courses, no combo, no individual discounts)
console.log('\n=== Test Case 3: Volume Discount ===');
const selected3 = courses.filter(c => ['solidworks', 'creo-parametric'].includes(c.slug));
const result3 = calculatePricing(selected3, comboDeals, discountTiers);
console.log('Selected:', selected3.map(c => c.title));
console.log('Discount Source:', result3.discountSource);
console.log('Discount Percent:', result3.discountPercent);
console.log('Original Total:', result3.subtotal);
console.log('Final Price:', result3.totalPrice);
console.log('Reason:', result3.discountReason);
console.log('Expected: Volume Discount with 10% discount (2 courses)');
const pass3 = result3.discountSource === 'tier' && result3.discountPercent === 10;
console.log('✓ PASS:', pass3);

// Test Case 4: Remove course from Combo (should switch to individual or volume)
console.log('\n=== Test Case 4: Remove course from Combo ===');
const selected4 = courses.filter(c => c._id === '1');
const result4 = calculatePricing(selected4, comboDeals, discountTiers);
console.log('Selected:', selected4.map(c => c.title));
console.log('Discount Source:', result4.discountSource);
console.log('Discount Percent:', result4.discountPercent);
console.log('Reason:', result4.discountReason);
console.log('Expected: Course Promotion (80%) since combo is invalid');
const pass4 = result4.discountSource === 'individual' && result4.discountPercent === 80;
console.log('✓ PASS:', pass4);

// Test Case 5: Priority - Combo overrides Course Promotion
console.log('\n=== Test Case 5: Combo overrides Course Promotion ===');
const selected5 = courses.filter(c => ['1', '2'].includes(c._id));
const result5 = calculatePricing(selected5, comboDeals, discountTiers);
console.log('Selected:', selected5.map(c => c.title));
console.log('Discount Source:', result5.discountSource);
console.log('Discount Percent:', result5.discountPercent);
console.log('Expected: Combo (50%) not individual (80%)');
const pass5 = result5.discountSource === 'combo' && result5.discountPercent === 50;
console.log('✓ PASS:', pass5);

// Test Case 6: Priority - Course Promotion overrides Volume
console.log('\n=== Test Case 6: Course Promotion overrides Volume ===');
const selected6 = courses.filter(c => ['1', '3'].includes(c._id));
const result6 = calculatePricing(selected6, comboDeals, discountTiers);
console.log('Selected:', selected6.map(c => c.title));
console.log('Discount Source:', result6.discountSource);
console.log('Discount Percent:', result6.discountPercent);
console.log('Expected: Individual (mixed) not Volume (10%)');
const pass6 = result6.discountSource === 'individual';
console.log('✓ PASS:', pass6);

// Test Case 7: No promotion applies
console.log('\n=== Test Case 7: No promotion applies ===');
const selected7 = courses.filter(c => c._id === '3');
const result7 = calculatePricing(selected7, comboDeals, discountTiers);
console.log('Selected:', selected7.map(c => c.title));
console.log('Discount Source:', result7.discountSource);
console.log('Discount Percent:', result7.discountPercent);
console.log('Expected: No promotion');
const pass7 = result7.discountSource === 'none' && result7.discountPercent === 0;
console.log('✓ PASS:', pass7);

// Test badge function
console.log('\n=== Test Badge Function ===');
console.log('Combo badge:', getCourseBadge(courses[0], 'combo'));
console.log('Individual badge:', getCourseBadge(courses[0], 'individual'));
console.log('Tier badge:', getCourseBadge(courses[0], 'tier'));
console.log('None badge:', getCourseBadge(courses[0], 'none'));

// Test Case 8: ObjectId vs string type mismatch (regression test for Bug A)
console.log('\n=== Test Case 8: ObjectId vs string type mismatch ===');
// Simulate ObjectId objects (with toString() method) vs plain strings
const mockObjectId = (id) => ({ toString: () => id });
const coursesWithObjectId = [
  { _id: mockObjectId('1'), title: 'ANSYS Mechanical', slug: 'ansys-mechanical', price: 15000, discountPercent: 80 },
  { _id: mockObjectId('2'), title: 'ANSYS Fluent', slug: 'ansys-fluent', price: 15000, discountPercent: 0 },
];
const comboDealsWithStringIds = [
  { courseIds: ['1', '2'], discountPercent: 50, label: 'Engineering Simulation Bundle' },
];
const result8 = calculatePricing(coursesWithObjectId, comboDealsWithStringIds, discountTiers);
console.log('Selected:', coursesWithObjectId.map(c => c.title));
console.log('Discount Source:', result8.discountSource);
console.log('Discount Percent:', result8.discountPercent);
console.log('Expected: Combo Package with 50% discount (ObjectId vs string match)');
const pass8 = result8.discountSource === 'combo' && result8.discountPercent === 50;
console.log('✓ PASS:', pass8);

// Test Case 9: Order independence (courseIds in reverse order)
console.log('\n=== Test Case 9: Order independence ===');
const comboDealsReverseOrder = [
  { courseIds: ['2', '1'], discountPercent: 50, label: 'Engineering Simulation Bundle' },
];
const selected9 = courses.filter(c => ['1', '2'].includes(c._id));
const result9 = calculatePricing(selected9, comboDealsReverseOrder, discountTiers);
console.log('Selected:', selected9.map(c => c.title));
console.log('Combo courseIds (stored):', comboDealsReverseOrder[0].courseIds);
console.log('Selected IDs:', selected9.map(c => c._id));
console.log('Discount Source:', result9.discountSource);
console.log('Discount Percent:', result9.discountPercent);
console.log('Expected: Combo Package with 50% discount (order-independent)');
const pass9 = result9.discountSource === 'combo' && result9.discountPercent === 50;
console.log('✓ PASS:', pass9);

// Test Case 10: Missing courseIds field (regression test for Bug B)
console.log('\n=== Test Case 10: Missing courseIds field ===');
const comboDealsMissingIds = [
  { courseSlugs: ['ansys-mechanical', 'ansys-fluent'], discountPercent: 50, label: 'Engineering Simulation Bundle' },
];
const selected10 = courses.filter(c => ['1', '2'].includes(c._id));
const result10 = calculatePricing(selected10, comboDealsMissingIds, discountTiers);
console.log('Selected:', selected10.map(c => c.title));
console.log('Discount Source:', result10.discountSource);
console.log('Discount Percent:', result10.discountPercent);
console.log('Expected: No combo match (should not throw)');
const pass10 = result10.discountSource !== 'combo';
console.log('✓ PASS:', pass10);

// Test Case 11: Duplicate course IDs in selection
console.log('\n=== Test Case 11: Duplicate course IDs ===');
const selected11 = [
  courses.find(c => c.slug === 'ansys-mechanical'),
  { ...courses.find(c => c.slug === 'ansys-mechanical') }, // duplicate, different object reference
  courses.find(c => c.slug === 'ansys-fluent'),
];
const result11 = calculatePricing(selected11, comboDeals, discountTiers);
console.log('Discount Source:', result11.discountSource);
console.log('Subtotal:', result11.subtotal, '(expected: 30000, NOT 45000)');
console.log('Final Price:', result11.totalPrice, '(expected: 15000)');
console.log('Expected: Combo match, duplicate treated as one course, no double-counting');
const pass11 = result11.discountSource === 'combo'
  && result11.subtotal === 30000
  && result11.totalPrice === 15000;
console.log('✓ PASS:', pass11);

// Test Case 12: Duplicate course with no combo match (falls through to individual/tier)
console.log('\n=== Test Case 12: Duplicate course with no combo match ===');
const selected12 = [
  courses.find(c => c.slug === 'solidworks'),
  { ...courses.find(c => c.slug === 'solidworks') }, // duplicate
  courses.find(c => c.slug === 'creo-parametric'),
];
const result12 = calculatePricing(selected12, comboDeals, discountTiers);
console.log('Discount Source:', result12.discountSource);
console.log('Subtotal:', result12.subtotal, '(expected: 24000, NOT 36000)');
console.log('Final Price:', result12.totalPrice, '(expected: 21600 with 10% tier discount)');
console.log('Expected: Volume discount, duplicate treated as one course, no double-counting');
const pass12 = result12.discountSource === 'tier'
  && result12.subtotal === 24000
  && result12.totalPrice === 21600;
console.log('✓ PASS:', pass12);

// Test Case 13: Null-price course alone (Price Inquiry state)
console.log('\n=== Test Case 13: Null-price course alone ===');
const nullCourse = { _id: '5', title: 'Special Consulting', slug: 'special-consulting', price: null, discountPercent: 0 };
const selected13 = [nullCourse];
const result13 = calculatePricing(selected13, comboDeals, discountTiers);
console.log('Selected:', selected13.map(c => c.title));
console.log('Discount Source:', result13.discountSource);
console.log('Original Total:', result13.subtotal, '(expected: null)');
console.log('Final Price:', result13.totalPrice, '(expected: null)');
console.log('Expected: No promotion, subtotal and totalPrice should be null for null price');
const pass13 = result13.discountSource === 'none' && result13.subtotal === null && result13.totalPrice === null;
console.log('✓ PASS:', pass13);

// Test Case 14: Null-price + fixed-price in combo package
console.log('\n=== Test Case 14: Null-price + fixed-price in combo ===');
const fixedCourse = courses.find(c => c._id === '2'); // ANSYS Fluent (15000)
const selected14 = [nullCourse, fixedCourse];
const comboDealsWithNull = [
  { courseIds: ['5', '2'], discountPercent: 50, label: 'Custom Consulting Combo' }
];
const result14 = calculatePricing(selected14, comboDealsWithNull, discountTiers);
console.log('Original Total:', result14.subtotal, '(expected: null)');
console.log('Final Price:', result14.totalPrice, '(expected: null)');
console.log('Discount Source:', result14.discountSource, '(expected: tier, because 2 courses total selected)');
console.log('Expected: Subtotal and totalPrice should be null, but discountSource should be tier');
const pass14 = result14.discountSource === 'tier' && result14.subtotal === null && result14.totalPrice === null;
console.log('✓ PASS:', pass14);

// Test Case 15: Mixed cart subtotalDisplay and totalPriceDisplay formatting
console.log('\n=== Test Case 15: Mixed cart display strings ===');
const result15 = calculatePricing([nullCourse, fixedCourse], comboDeals, discountTiers);
console.log('Subtotal Display:', result15.subtotalDisplay);
console.log('Total Price Display:', result15.totalPriceDisplay);
console.log('Discount Source:', result15.discountSource);
console.log('Expected: Subtotal and Total display strings formatted with "+ Price Inquiry" suffix');
const pass15 = result15.subtotalDisplay === 'PKR 15,000 + Price Inquiry' &&
               result15.totalPriceDisplay === 'PKR 13,500 + Price Inquiry' &&
               result15.discountSource === 'tier';
console.log('✓ PASS:', pass15);

// Test discount source label function
console.log('\n=== Test Discount Source Label Function ===');
console.log('Combo label:', getDiscountSourceLabel('combo'));
console.log('Individual label:', getDiscountSourceLabel('individual'));
console.log('Tier label:', getDiscountSourceLabel('tier'));
console.log('None label:', getDiscountSourceLabel('none'));

console.log('\n=== All tests completed ===');
