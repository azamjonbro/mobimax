const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const Banner = require('../models/Banner');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ratsiya';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Admin.deleteMany({});
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Product.deleteMany({});
    await Settings.deleteMany({});
    await Banner.deleteMany({});

    console.log('Database cleared.');

    // 1. Create Admin
    const adminPassword = 'admin123';
    const admin = await Admin.create({
      name: 'MobiMax Admin',
      email: 'admin@mobimax.com',
      password: adminPassword // pre-save hook will hash this
    });
    console.log(`Default admin created: ${admin.email} / ${adminPassword}`);

    // 2. Create Settings
    const settings = await Settings.create({
      phone: '+1 (800) 555-MAXR',
      telegramLink: 'https://t.me/mobimax_accessories',
      instagramLink: 'https://instagram.com/mobimax',
      address: '789 Radio Avenue, Signal City, SC 94025',
      workingHours: 'Mon - Sat: 8:00 AM - 8:00 PM',
      seo: {
        title: 'MobiMax Professional | Long-Range Radio Communication',
        description: 'Elite B2B marketplace for professional radios, military-grade walkie talkies, and rugged radio accessories.',
        keywords: 'Ratsiya, walkie talkie, professional radio systems, Motorola, Baofeng, Kenwood, Antennas'
      }
    });
    console.log('Default global store settings initialized.');

    // 3. Create Brands
    const brandData = [
      { name: 'Motorola Solutions', slug: 'motorola', logo: '', description: 'Industry-standard high-performance radio communication gear.' },
      { name: 'Baofeng', slug: 'baofeng', logo: '', description: 'Affordable, multi-band, versatile amateur and commercial handheld transceivers.' },
      { name: 'Kenwood', slug: 'kenwood', logo: '', description: 'Japanese precision engineering for premium mobile and base station systems.' },
      { name: 'Hytera', slug: 'hytera', logo: '', description: 'Cutting-edge digital mobile radio (DMR) terminals.' },
      { name: 'ICOM', slug: 'icom', logo: '', description: 'Legendary marine, aviation, and land-mobile radios.' }
    ];
    const brands = await Brand.insertMany(brandData);
    console.log(`${brands.length} brand entries created.`);

    // Map brand IDs by slug
    const brandMap = {};
    brands.forEach(b => brandMap[b.slug] = b._id);

    // 4. Create Categories
    const categoryData = [
      { name: 'Portable Radios', slug: 'portable-radios', icon: 'RadioIcon', image: '', description: 'Professional walkie-talkies and handheld transceivers.' },
      { name: 'Vehicle Radios', slug: 'vehicle-radios', icon: 'TruckIcon', image: '', description: 'High-power radio stations for trucks, emergency vehicles, and cars.' },
      { name: 'Antennas', slug: 'antennas', icon: 'AntennaIcon', image: '', description: 'High-gain whip, tactical, and magnetic mount antennas.' },
      { name: 'Accessories', slug: 'accessories', icon: 'BriefcaseIcon', image: '', description: 'Microphones, heavy-duty earpieces, and clips.' },
      { name: 'Batteries & Chargers', slug: 'power', icon: 'BatteryIcon', image: '', description: 'High-capacity battery packs and rapid multi-unit chargers.' }
    ];
    const categories = await Category.insertMany(categoryData);
    console.log(`${categories.length} categories created.`);

    // Map category IDs by slug
    const categoryMap = {};
    categories.forEach(c => categoryMap[c.slug] = c._id);

    // 5. Create Products
    const productsData = [
      {
        name: 'MobiMax R1 Long-Range Portable Radio',
        slug: 'mobimax-r1-long-range-portable-radio',
        sku: 'MM-R1-PORT',
        description: '<p>The <strong>MobiMax R1</strong> is our flagship long-range walkie talkie engineered for maximum reliability in construction, security operations, and emergency environments. It features a rugged, IP67 waterproof design with an integrated noise-cancelling microphone.</p>',
        price: 189.00,
        oldPrice: 249.00,
        discount: 24,
        brand: brandMap['motorola'],
        category: categoryMap['portable-radios'],
        images: ['/uploads/placeholder_r1_1.webp', '/uploads/placeholder_r1_2.webp'],
        mainImage: '/uploads/placeholder_r1_1.webp',
        stock: 45,
        featured: true,
        popular: true,
        new: true,
        specifications: [
          { key: 'Frequency Band', value: 'UHF 400-470 MHz / VHF 136-174 MHz' },
          { key: 'Power Output', value: '10 Watts (High) / 5 Watts (Low)' },
          { key: 'Effective Range', value: 'Up to 15 Kilometers (Open area)' },
          { key: 'Battery Capacity', value: '3800 mAh Li-ion (Up to 36 Hours)' },
          { key: 'Water Resistance', value: 'IP67 Waterproof & Dustproof' }
        ],
        seo: {
          title: 'MobiMax R1 Portable Walkie Talkie | Long Range UHF/VHF',
          description: 'Buy the MobiMax R1 Long Range Walkie Talkie. High-power 10W output with IP67 waterproofing and robust UHF/VHF bands.',
          keywords: 'MobiMax R1, long range ratsiya, walkie talkie, 10W radio'
        }
      },
      {
        name: 'Baofeng UV-9R Plus Waterproof Radio',
        slug: 'baofeng-uv-9r-plus-waterproof-radio',
        sku: 'BF-UV9R-PLUS',
        description: '<p>The classic dual-band <strong>Baofeng UV-9R Plus</strong> boasts heavy-duty weather proofing, powerful transmission capability, and a large backlit display. Ideal for tactical outdoor teams and remote warehouse communications.</p>',
        price: 79.00,
        oldPrice: 99.00,
        discount: 20,
        brand: brandMap['baofeng'],
        category: categoryMap['portable-radios'],
        images: ['/uploads/placeholder_uv9_1.webp'],
        mainImage: '/uploads/placeholder_uv9_1.webp',
        stock: 120,
        featured: false,
        popular: true,
        new: false,
        specifications: [
          { key: 'Frequency Band', value: 'VHF/UHF Dual Band 136-174 / 400-520 MHz' },
          { key: 'Power Output', value: '8 Watts' },
          { key: 'Effective Range', value: '8 - 12 Kilometers' },
          { key: 'Battery Capacity', value: '2800 mAh' },
          { key: 'Channels', value: '128 Channels memory' }
        ],
        seo: {
          title: 'Baofeng UV-9R Plus Waterproof Walkie Talkie',
          description: 'Explore the Baofeng UV-9R Plus waterproof walkie talkie. Heavy-duty construction, dual band, and 8W power.',
          keywords: 'Baofeng UV-9R, dual band radio, waterproof ratsiya'
        }
      },
      {
        name: 'Kenwood TM-D710G Dual-Band Mobile Transceiver',
        slug: 'kenwood-tm-d710g-mobile-transceiver',
        sku: 'KW-TMD710G-VEH',
        description: '<p>Built for vehicular communications, this heavy-duty mobile transceiver provides a staggering <strong>50 Watts</strong> output. Built-in GPS receiver and APRS compliance make it the choice of professional logisticians and convoy controllers.</p>',
        price: 549.00,
        oldPrice: 599.00,
        discount: 8,
        brand: brandMap['kenwood'],
        category: categoryMap['vehicle-radios'],
        images: ['/uploads/placeholder_tmd_1.webp'],
        mainImage: '/uploads/placeholder_tmd_1.webp',
        stock: 15,
        featured: true,
        popular: false,
        new: true,
        specifications: [
          { key: 'Frequency Band', value: 'VHF 144-148 MHz / UHF 430-450 MHz' },
          { key: 'Power Output', value: '50 Watts' },
          { key: 'Effective Range', value: '40 - 60 Kilometers (with external vehicle antenna)' },
          { key: 'GPS Integration', value: 'Built-in GPS and TNC logger' }
        ],
        seo: {
          title: 'Kenwood TM-D710G Mobile Transceiver | 50W Vehicle Radio',
          description: 'convoy radio Kenwood TM-D710G. Heavy-duty 50 Watts dual-band vehicle station with built-in GPS.',
          keywords: 'Kenwood vehicle radio, TM-D710G, 50W radio transmitter'
        }
      },
      {
        name: 'MobiMax Tactical Whip Antenna (UHF/VHF)',
        slug: 'mobimax-tactical-whip-antenna',
        sku: 'MM-TAC-ANT',
        description: '<p>Upgrade your walkie talkie ranges up to 30% with this foldable tactical whip antenna. Constructed with flexible spring steel, it can be bent and tucked inside loops when not in use.</p>',
        price: 29.00,
        oldPrice: 39.00,
        discount: 25,
        brand: brandMap['motorola'],
        category: categoryMap['antennas'],
        images: ['/uploads/placeholder_ant_1.webp'],
        mainImage: '/uploads/placeholder_ant_1.webp',
        stock: 350,
        featured: false,
        popular: true,
        new: true,
        specifications: [
          { key: 'Gain', value: '3.2 dBi (VHF) / 5.2 dBi (UHF)' },
          { key: 'Connector Type', value: 'SMA-Female' },
          { key: 'Length', value: '48 Centimeters (Foldable)' }
        ]
      },
      {
        name: 'Professional Acoustic Tube Earpiece',
        slug: 'professional-acoustic-tube-earpiece',
        sku: 'MM-EAR-ACOUST',
        description: '<p>Discreet acoustic tube headset with a surgical-grade transparent tube, in-line PTT button, and secure collar clips. Designed specifically for security personnel and event managers.</p>',
        price: 15.00,
        oldPrice: 20.00,
        discount: 25,
        brand: brandMap['motorola'],
        category: categoryMap['accessories'],
        images: ['/uploads/placeholder_ear_1.webp'],
        mainImage: '/uploads/placeholder_ear_1.webp',
        stock: 500,
        featured: true,
        popular: true,
        new: false,
        specifications: [
          { key: 'Cable Type', value: 'Reinforced Kevlar Core' },
          { key: 'Connector', value: '2-Pin Motorola Standard' },
          { key: 'Microphone', value: 'High Sensitivity In-line PTT' }
        ]
      }
    ];

    const products = await Product.insertMany(productsData);
    console.log(`${products.length} products seeded.`);

    // 6. Create Banners
    const bannersData = [
      {
        title: 'Professional Long Range Radio Systems',
        subtitle: 'Reliable communication for security, construction, industry, events, and emergency services.',
        image: '/uploads/banner_hero_1.webp',
        link: '/products',
        orderIndex: 0,
        active: true
      },
      {
        title: 'Military Grade accessories',
        subtitle: 'Foldable tactical antennas, heavy-duty throat mics, and multi-chargers.',
        image: '/uploads/banner_hero_2.webp',
        link: '/products?category=accessories',
        orderIndex: 1,
        active: true
      }
    ];
    await Banner.insertMany(bannersData);
    console.log('Homepage slider banners seeded.');

    console.log('Database seeding successfully completed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
