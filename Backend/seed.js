const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Import Models
const Shop = require('./models/shop');
const User = require('./models/user');
const Role = require('./models/role');
const Customer = require('./models/customer');
const PawnTicket = require('./models/pawnTicket');
const { DEFAULT_ROLE_PERMISSIONS, normalizeRoleName } = require('./utils/roleHelpers');

// --- DATA GENERATORS ---

const chennaiAreas = [
  { name: 'Adyar', pincode: '600020' },
  { name: 'Anna Nagar', pincode: '600040' },
  { name: 'T. Nagar', pincode: '600017' },
  { name: 'Velachery', pincode: '600042' },
  { name: 'Mylapore', pincode: '600004' },
  { name: 'Tambaram', pincode: '600045' },
  { name: 'Porur', pincode: '600116' },
  { name: 'Chromepet', pincode: '600044' },
  { name: 'Triplicane', pincode: '600005' },
  { name: 'Kodambakkam', pincode: '600024' },
  { name: 'Guindy', pincode: '600032' },
  { name: 'Egmore', pincode: '600008' },
  { name: 'Nungambakkam', pincode: '600034' },
  { name: 'Thiruvanmiyur', pincode: '600041' },
  { name: 'Pallavaram', pincode: '600043' },
];

const firstNames = [
  'Arjun', 'Vijay', 'Karthik', 'Surya', 'Vikram', 'Ramesh', 'Suresh', 'Dinesh', 'Ganesh', 'Balaji',
  'Priya', 'Lakshmi', 'Divya', 'Deepa', 'Meena', 'Anitha', 'Kavitha', 'Sangeetha', 'Swathi', 'Revathi'
];

const lastNames = [
  'Kumar', 'Raja', 'Krishnan', 'Narayanan', 'Chandran', 'Sundaram', 'Iyer', 'Reddy', 'Naidu', 'Chettiar',
  'Pillai', 'Gounder', 'Mudaliar', 'Nadar', 'Menon', 'Nair', 'Rao', 'Srinivasan', 'Balasubramaniam'
];

const jewelryItems = [
  'Gold Chain', 'Gold Ring', 'Gold Bangle', 'Gold Necklace', 'Gold Earring', 'Silver Anklet', 'Diamond Ring', 'Gold Bracelet'
];

// Helper to get random item from array
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to generate random number string
const getRandomPhone = () => '9' + Math.floor(100000000 + Math.random() * 900000000).toString();

// Helper to generate random date within last 2 years
const getRandomDate = () => {
  const start = new Date(2023, 0, 1);
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper to encrypt dummy Aadhaar/PAN
const generateAadhaar = () => Math.floor(100000000000 + Math.random() * 900000000000).toString();
const generatePan = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  let pan = '';
  for(let i=0; i<5; i++) pan += getRandom(chars.split(''));
  for(let i=0; i<4; i++) pan += getRandom(nums.split(''));
  pan += getRandom(chars.split(''));
  return pan;
};

const seed = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    // 0. CLEANUP (Delete existing data)
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      Shop.deleteMany({}),
      User.deleteMany({}),
      Role.deleteMany({}),
      Customer.deleteMany({}),
      PawnTicket.deleteMany({})
    ]);
    console.log('✨ Database cleared.');

    // 1. Create Shop
    console.log('Creating Shop...');
    const shop = await Shop.create({
      shop_name: 'Chennai Gold House',
      address: '123, Gandhi Road, T. Nagar, Chennai',
      phone: '044-24345678'
    });

    // 2. Create Roles
    console.log('Creating Roles...');
    const ownerRole = await Role.create({
      shop_id: shop._id,
      name: normalizeRoleName('owner'),
      is_owner_role: true,
      permissions: DEFAULT_ROLE_PERMISSIONS.owner,
    });

    const workerRole = await Role.create({
      shop_id: shop._id,
      name: normalizeRoleName('worker'),
      is_owner_role: false,
      permissions: DEFAULT_ROLE_PERMISSIONS.worker,
    });

    // 3. Create Users
    console.log('Creating Users...');
    const owner = await User.create({
      shop_id: shop._id,
      full_name: 'Rajinikanth (Owner)',
      email: 'owner@chennai.com',
      password: 'password123', // Will be hashed by pre-save hook
      role: 'owner',
      role_id: ownerRole._id
    });

    // Update shop owner
    shop.owner_id = owner._id;
    await shop.save();

    const worker = await User.create({
      shop_id: shop._id,
      full_name: 'Kamal (Worker)',
      email: 'worker@chennai.com',
      password: 'password123', // Will be hashed by pre-save hook
      role: 'worker',
      role_id: workerRole._id
    });

    // 4. Create 100 Customers & Pawn Tickets
    console.log('Generating 100 Customers and Pawn Data...');
    
    let ticketCounter = 1000;

    for (let i = 0; i < 100; i++) {
      const area = getRandom(chennaiAreas);
      const firstName = getRandom(firstNames);
      const lastName = getRandom(lastNames);
      
      // Create Customer
      const customer = new Customer({
        shop_id: shop._id,
        full_name: `${firstName} ${lastName}`,
        phone_number: getRandomPhone(),
        address: {
          line1: `${Math.floor(Math.random() * 100) + 1}, North Street`,
          city: area.name,
          pincode: area.pincode
        },
        gender: Math.random() > 0.5 ? 'Male' : 'Female',
        aadhaar_number: generateAadhaar(),
        pan_number: generatePan(),
        created_by_user_id: owner._id
      });

      await customer.save(); // Save to get _id

      // Create 1-3 Tickets for this customer
      const numTickets = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < numTickets; j++) {
        const itemWeight = (Math.random() * 50 + 2).toFixed(2); // 2g to 52g
        const loanAmt = Math.floor(itemWeight * 4500); // Approx 4500 per gram
        const interest = loanAmt * 0.03; // 3%
        
        const statusRandom = Math.random();
        let status = 'active';
        if (statusRandom > 0.8) status = 'settled';
        else if (statusRandom > 0.95) status = 'defaulted';

        const ticket = new PawnTicket({
          shop_id: shop._id,
          customer_id: customer._id,
          created_by_user_id: Math.random() > 0.5 ? owner._id : worker._id,
          ticket_number: `TKT-${ticketCounter++}`,
          
          // --- FIX: Added original_pawn_amount ---
          loan_amount: loanAmt,
          original_pawn_amount: loanAmt, 
          // -------------------------------------
          
          interest_rate: 3, // 3%
          adv_amount: Math.floor(interest), // 1 month interest as advance
          pawned_date: getRandomDate(),
          status: status,
          items: [{
            name: getRandom(jewelryItems),
            type: 'gold',
            weight_grams: itemWeight,
            purity: 22,
            description: 'Hallmarked gold item'
          }]
        });
        
        await ticket.save();
      }
    }

    console.log('✅ Seeding Complete!');
    console.log('-----------------------------------');
    console.log('Shop: Chennai Gold House');
    console.log('Owner Login: owner@chennai.com / password123');
    console.log('Worker Login: worker@chennai.com / password123');
    console.log('-----------------------------------');

    process.exit(0);

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();