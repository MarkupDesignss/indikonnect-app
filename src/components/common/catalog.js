export const U = (id, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const ticker = [
  'Free shipping over ₹999',
  'Autumn edit is live',
  '4,000+ products',
  '240 cities served',
  'Partner network since 2019',
  '30-day easy returns',
];

export const nav = ['Beauty', 'Crockery', 'Jewellery', 'Watches', 'New launch'];

export const heroStats = [
  { v: '4,000+', k: 'Products' },
  { v: '240', k: 'Cities' },
  { v: '18.4k', k: 'Reviews' },
];

export const categories = [
  { name: 'Beauty & Personal Care', count: '1,240 products', img: U('1580870069867-74c57ee1bb07') },
  { name: 'Crockery & Dining', count: '860 products', img: U('1617784625140-515e220ba148') },
  { name: 'Women’s Jewellery', count: '520 products', img: U('1631965004544-1762fc696476') },
  { name: 'Men’s Watches', count: '180 products', img: U('1616837874254-8d5aaa63e273') },
];

export const catFilters = ['All', 'Beauty', 'Crockery', 'Jewellery', 'Watches'];

export const products = [
  { brand: 'Aura', name: 'Radiance Vitamin C Serum 30ml', price: '₹899', mrp: '₹1,299', off: '31% off', reviews: '5,602', tag: 'Trending', cat: 'Beauty', img: U('1620916297397-a4a5402a3c6c') },
  { brand: 'Aura', name: 'Hydra Ceramide Day Cream', price: '₹1,240', mrp: '₹1,800', off: '31% off', reviews: '2,140', tag: 'Bestseller', cat: 'Beauty', img: U('1620916566398-39f1143ab7be') },
  { brand: 'Chandra', name: 'Automatic Chronograph 41mm', price: '₹7,800', mrp: '₹11,200', off: '30% off', reviews: '412', tag: 'Limited', cat: 'Watches', img: U('1523275335684-37898b6baf30') },
  { brand: 'Meher', name: 'Kundan Drop Earrings, Gold Plated', price: '₹1,450', mrp: '₹2,200', off: '34% off', reviews: '1,208', tag: 'New', cat: 'Jewellery', img: U('1535632066927-ab7c9ab60908') },
  { brand: 'Terra', name: 'Stoneware Dinner Set, 12 Piece', price: '₹3,499', mrp: '₹4,999', off: '30% off', reviews: '934', tag: 'Bestseller', cat: 'Crockery', img: U('1727257050264-33a4f5f0982a') },
  { brand: 'Terra', name: 'Porcelain Tea Set for Six', price: '₹2,150', mrp: '₹3,100', off: '31% off', reviews: '520', tag: 'Gifting', cat: 'Crockery', img: U('1594527612221-4902cd3f1463') },
  { brand: 'Meher', name: 'Layered Gold Chain Necklace', price: '₹2,190', mrp: '₹3,400', off: '36% off', reviews: '765', tag: 'Festive', cat: 'Jewellery', img: U('1602173574767-37ac01994b2a') },
  { brand: 'Aura', name: 'Pro Makeup Brush Set, 12 Piece', price: '₹1,590', mrp: '₹2,400', off: '34% off', reviews: '3,411', tag: 'Trending', cat: 'Beauty', img: U('1583209814683-c023dd293cc6') },
];

export const reels = [
  { handle: '@ananya.glow', views: '412k', caption: 'My 3-step night routine', product: 'Radiance Serum 30ml', price: '₹899', img: U('1670201203116-26644750a726', 700), avatar: U('1670201202833-b0932731628f', 120), productImg: U('1620916297397-a4a5402a3c6c', 160) },
  { handle: '@meera.styles', views: '331k', caption: 'Festive jewellery haul', product: 'Kundan Drop Earrings', price: '₹1,450', img: U('1585960622850-ed33c41d6418', 700), avatar: U('1600721391689-2564bb8055de', 120), productImg: U('1535632066927-ab7c9ab60908', 160) },
  { handle: '@thehomeedit.in', views: '208k', caption: 'Setting the table in five minutes', product: 'Stoneware Dinner Set', price: '₹3,499', img: U('1727257050264-33a4f5f0982a', 700), avatar: U('1617784625140-515e220ba148', 120), productImg: U('1571987530791-58e3e7744d99', 160) },
  { handle: '@wristgame', views: '96k', caption: 'Under ₹8,000 and it moves', product: 'Chandra Chronograph', price: '₹7,800', img: U('1616837874254-8d5aaa63e273', 700), avatar: U('1620656798579-1984d9e87df7', 120), productImg: U('1523275335684-37898b6baf30', 160) },
  { handle: '@dailywithdiv', views: '154k', caption: 'What is in my Konnect box', product: 'Build Your Box', price: 'From ₹1,499', img: U('1631730486572-226d1f595b68', 700), avatar: U('1611652022419-a9419f74343d', 120), productImg: U('1567721913486-6585f069b332', 160) },
  { handle: '@rahul.reviews', views: '77k', caption: 'Two weeks with the day cream', product: 'Hydra Ceramide Cream', price: '₹1,240', img: U('1612817288484-6f916006741a', 700), avatar: U('1629198688000-71f23e745b6e', 120), productImg: U('1616750819456-5cdee9b85d22', 160) },
];

export const promises = [
  { icon: '⇄', title: '30-day returns', body: 'Changed your mind? Send it back, no questions asked.' },
  { icon: '◈', title: '100% authentic', body: 'Sourced direct from brands and partner warehouses.' },
  { icon: '⛟', title: 'Free shipping', body: 'On every order above ₹999, across 240 cities.' },
  { icon: '☏', title: 'Human support', body: 'Real people on chat and phone, 9am to 9pm IST.' },
];

export const trustStats = [
  { v: '18.4k', k: 'Reviews' },
  { v: '4.8/5', k: 'Avg rating' },
  { v: '96%', k: 'Repeat buyers' },
  { v: '240', k: 'Cities' },
];

export const offers = [
  { kicker: 'Luxury edit', title: 'Watches under ₹9,999', cta: 'Discover', bg: '#E8E3D6', img: U('1523275335684-37898b6baf30') },
  { kicker: 'Everyday', title: 'Dining sets under ₹2,999', cta: 'Shop now', bg: '#EFE0C4', img: U('1571987530791-58e3e7744d99') },
];

export const levels = [
  { num: '01', title: 'Associate', body: 'Register, get your kit, learn the catalogue and earn on every order you place.' },
  { num: '02', title: 'Consultant', body: 'Build a customer base, unlock better margins and guided sales training.' },
  { num: '03', title: 'Leader', body: 'Mentor your own team, earn on their volume and qualify for quarterly rewards.' },
  { num: '04', title: 'Director', body: 'Run a region, shape the catalogue mix and share in national growth incentives.' },
];

export const gallery = [
  U('1585945037805-5fd82c2e60b1', 600),
  U('1543294001-f7cd5d7fb516', 600),
  U('1594527612221-4902cd3f1463', 600),
  U('1605100804763-247f67b3557e', 600),
  U('1608571423902-eed4a5ad8108', 600),
];

export const socials = ['IG', 'in', 'YT', 'f'];

export const footerCols = [
  { title: 'Shop', links: ['Beauty', 'Crockery', 'Jewellery', 'Watches'] },
  { title: 'Policies', links: ['Terms of use', 'Cookie preferences', 'Refund & returns', 'FAQs'] },
  { title: 'Discover', links: ['Join us', 'Become a partner', 'Catalogue', 'New launch store'] },
  { title: 'Follow us', links: ['Instagram', 'LinkedIn', 'Youtube', 'Facebook'] },
];
