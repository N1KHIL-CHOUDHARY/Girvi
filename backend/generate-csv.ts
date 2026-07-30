import * as fs from 'fs';
import * as path from 'path';
import { faker } from '@faker-js/faker';

const outputDir = path.join(__dirname, 'csv_export');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);  
}

const ITEM_TYPES = [
  { name: 'Gold Necklace', type: 'Gold', purity: '22K', minW: 10, maxW: 45 },
  { name: 'Gold Ring', type: 'Gold', purity: '22K', minW: 3, maxW: 12 },
  { name: 'Gold Chain', type: 'Gold', purity: '22K', minW: 8, maxW: 30 },
  { name: 'Gold Bangle', type: 'Gold', purity: '22K', minW: 12, maxW: 40 },
  { name: 'Gold Earrings', type: 'Gold', purity: '22K', minW: 4, maxW: 15 },
  { name: 'Gold Coin', type: 'Gold', purity: '24K', minW: 5, maxW: 50 },
  { name: 'Silver Anklet', type: 'Silver', purity: '925', minW: 20, maxW: 100 },
  { name: 'Silver Bowl', type: 'Silver', purity: '925', minW: 50, maxW: 250 },
  { name: 'Silver Coin', type: 'Silver', purity: '999', minW: 10, maxW: 100 },
  { name: 'Silver Chain', type: 'Silver', purity: '925', minW: 15, maxW: 60 }
];

function getRandomDecimal(min: number, max: number, decimals: number = 2): number {
  const val = Math.random() * (max - min) + min;
  return Number(val.toFixed(decimals));
}

function getItemCountWithAverageThree(): number {
  const rand = Math.random();
  if (rand < 0.55) return 2;
  if (rand < 0.80) return 3;
  if (rand < 0.90) return 4;
  if (rand < 0.95) return 5;
  if (rand < 0.97) return 6;
  if (rand < 0.98) return 7;
  if (rand < 0.99) return 8;
  if (rand < 0.995) return 9;
  return 10;
}

function writeCsv(filename: string, headers: string[], rows: any[][]) {
  const filePath = path.join(outputDir, filename);
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((field) => {
          if (field === null || field === undefined) return '';
          const str = String(field).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    )
  ].join('\n');

  fs.writeFileSync(filePath, csvContent, 'utf8');
}

function generateData() {
  const shopId = faker.string.uuid();
  const now = new Date().toISOString();

  const shops = [
    [shopId, 'Apex Jewel Pawn Shop', 'contact@apexpawn.com', '+919876543210', '123 Market Street', now, now, '']
  ];

  const userId = faker.string.uuid();
  const users = [
    [
      userId,
      shopId,
      '',
      'Admin',
      'User',
      'admin@apexpawn.com',
      'admin',
      'hashed_password_secure',
      '+919876543210',
      'true',
      'en',
      '',
      '0',
      '',
      now,
      now,
      ''
    ]
  ];

  const customers: any[][] = [];
  const tickets: any[][] = [];
  const items: any[][] = [];

  const TOTAL_CUSTOMERS = 3000;
  let ticketCounter = 10001;

  for (let i = 1; i <= TOTAL_CUSTOMERS; i++) {
    const customerId = faker.string.uuid();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const fullName = `${firstName} ${lastName}`;
    const gender = faker.helpers.arrayElement(['Male', 'Female']);
    const phone = faker.string.numeric({ length: 10, allowLeadingZeros: false });
    const aadhaarLast4 = faker.string.numeric(4);
    const panLast4 = faker.string.numeric(4);
    const customerCode = `CUST-${i.toString().padStart(5, '0')}`;

    customers.push([
      customerId,
      shopId,
      userId,
      fullName,
      phone,
      gender,
      '',
      '',
      aadhaarLast4,
      '',
      panLast4,
      faker.location.streetAddress(),
      faker.location.city(),
      faker.location.zipCode('######'),
      '',
      faker.person.jobTitle(),
      '',
      '',
      '',
      '',
      customerCode,
      '',
      'verified',
      now,
      now,
      now,
      ''
    ]);

    const numTickets = Math.random() > 0.3 ? 1 : 2;

    for (let t = 0; t < numTickets; t++) {
      const ticketId = faker.string.uuid();
      const ticketNum = `TKT-${ticketCounter++}`;
      const loanAmount = getRandomDecimal(10000, 250000);
      const interestRate = getRandomDecimal(1.5, 3.0);
      const advAmount = getRandomDecimal(200, 1000);
      const itemCount = getItemCountWithAverageThree();

      tickets.push([
        ticketId,
        shopId,
        customerId,
        ticketNum,
        loanAmount,
        loanAmount,
        interestRate,
        advAmount,
        'monthly',
        7,
        12,
        now,
        '',
        '',
        '',
        'active',
        '',
        now,
        now,
        ''
      ]);

      for (let k = 0; k < itemCount; k++) {
        const itemTemplate = faker.helpers.arrayElement(ITEM_TYPES);
        const weight = getRandomDecimal(itemTemplate.minW, itemTemplate.maxW, 3);

        items.push([
          faker.string.uuid(),
          ticketId,
          itemTemplate.name,
          itemTemplate.type,
          weight,
          itemTemplate.purity,
          `${itemTemplate.purity} ${itemTemplate.name} in good condition`,
          '',
          now,
          now,
          ''
        ]);
      }
    }
  }

  writeCsv('Shop.csv', ['id', 'name', 'email', 'phone', 'address', 'createdAt', 'updatedAt', 'deletedAt'], shops);
  
  writeCsv(
    'User.csv',
    [
      'id',
      'shopId',
      'roleId',
      'firstName',
      'lastName',
      'email',
      'username',
      'password',
      'phone',
      'isActive',
      'language',
      'lastLoginAt',
      'loginAttempts',
      'lockedUntil',
      'createdAt',
      'updatedAt',
      'deletedAt'
    ],
    users
  );

  writeCsv(
    'Customer.csv',
    [
      'id',
      'shopId',
      'createdByUserId',
      'full_name',
      'phone_number',
      'gender',
      'customer_photo_url',
      'aadhaar_number_encrypted',
      'aadhaar_number_last4',
      'pan_number_encrypted',
      'pan_number_last4',
      'address_line1',
      'address_city',
      'address_pincode',
      'dateOfBirth',
      'occupation',
      'nominee_name',
      'nominee_phone',
      'nominee_relation',
      'notes',
      'customerCode',
      'photo',
      'kycStatus',
      'kycVerifiedAt',
      'createdAt',
      'updatedAt',
      'deletedAt'
    ],
    customers
  );

  writeCsv(
    'PawnTicket.csv',
    [
      'id',
      'shopId',
      'customerId',
      'ticket_number',
      'loan_amount',
      'original_loan_amount',
      'interest_rate',
      'adv_amount',
      'interestType',
      'graceDays',
      'loanDuration',
      'pawned_date',
      'renewalDate',
      'maturityDate',
      'auctionDate',
      'status',
      'settled_date',
      'createdAt',
      'updatedAt',
      'deletedAt'
    ],
    tickets
  );

  writeCsv(
    'PawnItem.csv',
    ['id', 'ticketId', 'name', 'type', 'weight_grams', 'purity', 'description', 'item_photo_url', 'createdAt', 'updatedAt', 'deletedAt'],
    items
  );
}

generateData();