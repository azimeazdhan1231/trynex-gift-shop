
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { products } from '../shared/schema.js';

const connectionString = "postgresql://postgres.wifsqonbnfmwtqvupqbk:Amits@12345@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";
const client = postgres(connectionString);
const db = drizzle(client);

async function seed() {
  try {
    console.log('🌱 Seeding database with 30 products...');

    // Clear existing products
    await db.delete(products);

    // 30 comprehensive products data
    const sampleProducts = [
      // Lifestyle Products (8 items)
      {
        name: "Premium Lifestyle Mug",
        namebn: "প্রিমিয়াম লাইফস্টাইল মগ",
        description: "High-quality ceramic mug perfect for your daily coffee or tea",
        descriptionbn: "আপনার দৈনিক কফি বা চায়ের জন্য আদর্শ উচ্চ মানের সিরামিক মগ",
        price: 45000,
        category: "lifestyle",
        categorybn: "লাইফস্টাইল",
        imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500",
        stock: 50,
        isActive: true,
        isFeatured: true,
        tags: JSON.stringify(["premium", "ceramic", "daily-use"])
      },
      {
        name: "Classic Coffee Mug Set",
        namebn: "ক্লাসিক কফি মগ সেট",
        description: "Set of 2 elegant coffee mugs for couples",
        descriptionbn: "কাপলদের জন্য 2টি মার্জিত কফি মগের সেট",
        price: 75000,
        category: "lifestyle",
        categorybn: "লাইফস্টাইল",
        imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=500",
        stock: 35,
        isActive: true,
        isFeatured: false,
        tags: JSON.stringify(["coffee", "set", "couple"])
      },
      {
        name: "Stainless Steel Water Bottle",
        namebn: "স্টেইনলেস স্টিল পানির বোতল",
        description: "Eco-friendly insulated water bottle",
        descriptionbn: "পরিবেশ বান্ধব ইনসুলেটেড পানির বোতল",
        price: 85000,
        category: "lifestyle",
        categorybn: "লাইফস্টাইল",
        imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500",
        stock: 60,
        isActive: true,
        isFeatured: true,
        tags: JSON.stringify(["eco-friendly", "steel", "insulated"])
      },
      {
        name: "Bamboo Travel Mug",
        namebn: "বাঁশের ট্রাভেল মগ",
        description: "Sustainable bamboo travel mug with lid",
        descriptionbn: "ঢাকনা সহ টেকসই বাঁশের ট্রাভেল মগ",
        price: 65000,
        category: "lifestyle",
        categorybn: "লাইফস্টাইল",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
        stock: 40,
        isActive: true,
        isFeatured: false,
        tags: JSON.stringify(["bamboo", "sustainable", "travel"])
      },
      {
        name: "Glass Tea Set",
        namebn: "কাঁচের চা সেট",
        description: "Elegant glass tea set for 4 people",
        descriptionbn: "4 জনের জন্য মার্জিত কাঁচের চা সেট",
        price: 120000,
        category: "lifestyle",
        categorybn: "লাইফস্টাইল",
        imageUrl: "https://images.unsplash.com/photo-1563822249366-669425494441?w=500",
        stock: 25,
        isActive: true,
        isFeatured: true,
        tags: JSON.stringify(["glass", "tea", "elegant"])
      },
      {
        name: "Ceramic Dinner Plate Set",
        namebn: "সিরামিক ডিনার প্লেট সেট",
        description: "Beautiful ceramic dinner plates set of 6",
        descriptionbn: "6টি সুন্দর সিরামিক ডিনার প্লেটের সেট",
        price: 150000,
        category: "lifestyle",
        categorybn: "লাইফস্টাইল",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500",
        stock: 30,
        isActive: true,
        isFeatured: false,
        tags: JSON.stringify(["ceramic", "dinner", "set"])
      },
      {
        name: "Kitchen Utensil Set",
        namebn: "রান্নাঘরের বাসনপত্র সেট",
        description: "Complete wooden kitchen utensil set",
        descriptionbn: "সম্পূর্ণ কাঠের রান্নাঘরের বাসনপত্র সেট",
        price: 95000,
        category: "lifestyle",
        categorybn: "লাইফস্টাইল",
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500",
        stock: 45,
        isActive: true,
        isFeatured: false,
        tags: JSON.stringify(["wooden", "kitchen", "utensil"])
      },
      {
        name: "Lunch Box Set",
        namebn: "লাঞ্চ বক্স সেট",
        description: "Stackable lunch box with multiple compartments",
        descriptionbn: "একাধিক কম্পার্টমেন্ট সহ স্ট্যাকেবল লাঞ্চ বক্স",
        price: 55000,
        category: "lifestyle",
        categorybn: "লাইফস্টাইল",
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
        stock: 70,
        isActive: true,
        isFeatured: true,
        tags: JSON.stringify(["lunch", "stackable", "compartments"])
      },
      
      // T-Shirts (6 items)
      {
        name: "Comfortable T-Shirt",
        namebn: "আরামদায়ক টি-শার্ট",
        description: "Soft cotton t-shirt available in multiple colors",
        descriptionbn: "একাধিক রঙে পাওয়া যায় এমন নরম কটন টি-শার্ট",
        price: 55000,
        category: "t-shirts",
        categorybn: "টি-শার্ট",
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
        stock: 75,
        isActive: true,
        isFeatured: false,
        tags: JSON.stringify(["cotton", "comfortable", "casual"])
      },
      {
        name: "Premium Polo Shirt",
        namebn: "প্রিমিয়াম পোলো শার্ট",
        description: "Elegant polo shirt for formal casual wear",
        descriptionbn: "ফরমাল ক্যাজুয়াল পোশাকের জন্য মার্জিত পোলো শার্ট",
        price: 85000,
        category: "t-shirts",
        categorybn: "টি-শার্ট",
        imageUrl: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500",
        stock: 50,
        isActive: true,
        isFeatured: true,
        tags: JSON.stringify(["polo", "formal", "premium"])
      },
      {
        name: "Graphic Print T-Shirt",
        namebn: "গ্রাফিক প্রিন্ট টি-শার্ট",
        description: "Trendy graphic print t-shirt for youth",
        descriptionbn: "তরুণদের জন্য ট্রেন্ডি গ্রাফিক প্রিন্ট টি-শার্ট",
        price: 65000,
        category: "t-shirts",
        categorybn: "টি-শার্ট",
        imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500",
        stock: 80,
        isActive: true,
        isFeatured: true,
        tags: JSON.stringify(["graphic", "trendy", "youth"])
      },
      {
        name: "V-Neck T-Shirt",
        namebn: "ভি-নেক টি-শার্ট",
        description: "Stylish v-neck t-shirt for modern look",
        descriptionbn: "আধুনিক লুকের জন্য স্টাইলিশ ভি-নেক টি-শার্ট",
        price: 60000,
        category: "t-shirts",
        categorybn: "টি-শার্ট",
        imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500",
        stock: 65,
        isActive: true,
        isFeatured: false,
        tags: JSON.stringify(["v-neck", "stylish", "modern"])
      },
      {
        name: "Long Sleeve T-Shirt",
        namebn: "লং স্লিভ টি-শার্ট",
        description: "Comfortable long sleeve t-shirt for winter",
        descriptionbn: "শীতের জন্য আরামদায়ক লং স্লিভ টি-শার্ট",
        price: 70000,
        category: "t-shirts",
        categorybn: "টি-শার্ট",
        imageUrl: "https://images.unsplash.com/photo-1503341960582-b45751874cf0?w=500",
        stock: 55,
        isActive: true,
        isFeatured: false,
        tags: JSON.stringify(["long-sleeve", "winter", "comfortable"])
      },
      {
        name: "Sports T-Shirt",
        namebn: "স্পোর্টস টি-শার্ট",
        description: "Moisture-wicking sports t-shirt for gym",
        descriptionbn: "জিমের জন্য আর্দ্রতা শোষণকারী স্পোর্টস টি-শার্ট",
        price: 75000,
        category: "t-shirts",
        categorybn: "টি-শার্ট",
        imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500",
        stock: 45,
        isActive: true,
        isFeatured: true,
        tags: JSON.stringify(["sports", "gym", "moisture-wicking"])
      },

      // Home Decor (8 items)
      {
        name: "Stylish Wall Clock",
        namebn: "স্টাইলিশ দেয়াল ঘড়ি",
        description: "Modern wall clock to enhance your home decor",
        descriptionbn: "আপনার ঘরের সাজসজ্জা বাড়ানোর জন্য আধুনিক দেয়াল ঘড়ি",
        price: 65000,
        category: "home-decor",
        categorybn: "ঘর সাজানো",
        imageUrl: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500",
        stock: 30,
        isActive: true,
        isFeatured: true,
        tags: JSON.stringify(["wall-clock", "modern", "decor"])
      },
      {
        name: "Custom Photo Frame",
        namebn: "কাস্টম ফটো ফ্রেম",
        description: "Personalized photo frame for your precious memories",
        descriptionbn: "আপনার মূল্যবান স্মৃতির জন্য ব্যক্তিগতকৃত ফটো ফ্রেম",
        price: 85000,
        category: "home-decor",
        categorybn: "ঘর সাজানো",
        imageUrl: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=500",
        stock: 35,
        isActive: true,
        isFeatured: false,
        tags: JSON.stringify(["custom", "photo", "frame", "memories"])
      },
      {
        name: "Decorative Vase",
        namebn: "সাজসজ্জার ফুলদানি",
        description: "Beautiful ceramic vase for flowers",
        descriptionbn: "ফুলের জন্য সুন্দর সিরামিক ফুলদানি",
        price: 95000,
        category: "home-decor",
        categorybn: "ঘর সাজানো",
        imageUrl: "https://images.unsplash.com/photo-1578500351861-7a3d1ec93d95?w=500",
        stock: 25,
        isActive: true,
        isFeatured: true,
        tags: JSON.stringify(["vase", "ceramic", "flowers"])
      },
      {
        name: "LED Table Lamp",
        namebn: "এলইডি টেবিল ল্যাম্প",
        description: "Modern LED table lamp with adjustable brightness",
        descriptionbn: "সামঞ্জস্যযোগ্য উজ্জ্বলতা সহ আধুনিক এলইডি টেবিল ল্যাম্প",
        price: 110000,
        category: "home-decor",
        categorybn: "ঘর সাজানো",
        imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500",
        stock: 40,
        isActive: true,
        isFeatured: true,
        tags: JSON.stringify(["LED", "adjustable", "modern"])
      },
      {
        name: "Wall Art Canvas",
        namebn: "ওয়াল আর্ট ক্যানভাস",
        description: "Abstract wall art canvas for living room",
        descriptionbn: "বসার ঘরের জন্য বিমূর্ত ওয়াল আর্ট ক্যানভাস",
        price: 125000,
        category: "home-decor",
        categorybn: "ঘর সাজানো",
        imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500",
        stock: 20,
        isActive: true,
        isFeatured: false,
        tags: JSON.stringify(["abstract", "canvas", "living-room"])
      },
      {
        name: "Decorative Cushion Set",
        namebn: "সাজসজ্জার কুশন সেট",
        description: "Set of 4 decorative cushions for sofa",
        descriptionbn: "সোফার জন্য 4টি সাজসজ্জার কুশনের সেট",
        price: 80000,
        category: "home-decor",
        categorybn: "ঘর সাজানো",
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500",
        stock: 45,
        isActive: true,
        isFeatured: true,
        tags: JSON.stringify(["cushion", "sofa", "decorative"])
      },
      {
        name: "Mirror with Frame",
        namebn: "ফ্রেম সহ আয়না",
        description: "Elegant mirror with decorative wooden frame",
        descriptionbn: "সাজসজ্জার কাঠের ফ্রেম সহ মার্জিত আয়না",
        price: 135000,
        category: "home-decor",
        categorybn: "ঘর সাজানো",
        imageUrl: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500",
        stock: 15,
        isActive: true,
        isFeatured: false,
        tags: JSON.stringify(["mirror", "wooden", "elegant"])
      },
      {
        name: "Scented Candle Set",
        namebn: "সুগন্ধি মোমবাতি সেট",
        description: "Set of 3 aromatic scented candles",
        descriptionbn: "3টি সুগন্ধি মোমবাতির সেট",
        price: 70000,
        category: "home-decor",
        categorybn: "ঘর সাজানো",
        imageUrl: "https://images.unsplash.com/photo-1602874801006-27d39eb0570a?w=500",
        stock: 60,
        isActive: true,
        isFeatured: true,
        tags: JSON.stringify(["candles", "aromatic", "relaxing"])
      },

      // Gifts (8 items)
      {
        name: "Luxury Gift Box",
        namebn: "লাক্সারি উপহার বক্স",
        description: "Premium gift box perfect for special occasions",
        descriptionbn: "বিশেষ অনুষ্ঠানের জন্য আদর্শ প্রিমিয়াম উপহার বক্স",
        price: 95000,
        category: "gifts",
        categorybn: "উপহার",
        imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500",
        stock: 20,
        isActive: true,
        isFeatured: true,
        tags: JSON.stringify(["luxury", "gift", "premium"])
      },
      {
        name: "Personalized Keychain",
        namebn: "ব্যক্তিগতকৃত চাবির রিং",
        description: "Custom engraved keychain with name",
        descriptionbn: "নাম সহ কাস্টম খোদাই করা চাবির রিং",
        price: 35000,
        category: "gifts",
        categorybn: "উপহার",
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
        stock: 100,
        isActive: true,
        isFeatured: false,
        tags: JSON.stringify(["keychain", "personalized", "engraved"])
      },
      {
        name: "Couple Photo Album",
        namebn: "কাপল ফটো এ্যালবাম",
        description: "Beautiful photo album for couples",
        descriptionbn: "কাপলদের জন্য সুন্দর ফটো এ্যালবাম",
        price: 115000,
        category: "gifts",
        categorybn: "উপহার",
        imageUrl: "https://images.unsplash.com/photo-1567336272646-521ef866421c?w=500",
        stock: 30,
        isActive: true,
        isFeatured: true,
        tags: JSON.stringify(["album", "couple", "memories"])
      },
      {
        name: "Birthday Surprise Box",
        namebn: "জন্মদিনের সারপ্রাইজ বক্স",
        description: "Special surprise box for birthday celebrations",
        descriptionbn: "জন্মদিন উৎসবের জন্য বিশেষ সারপ্রাইজ বক্স",
        price: 150000,
        category: "gifts",
        categorybn: "উপহার",
        imageUrl: "https://images.unsplash.com/photo-1607083681994-ac2b4825ce71?w=500",
        stock: 25,
        isActive: true,
        isFeatured: true,
        tags: JSON.stringify(["birthday", "surprise", "celebration"])
      },
      {
        name: "Greeting Card Set",
        namebn: "গ্রিটিং কার্ড সেট",
        description: "Set of 10 beautiful greeting cards",
        descriptionbn: "10টি সুন্দর গ্রিটিং কার্ডের সেট",
        price: 45000,
        category: "gifts",
        categorybn: "উপহার",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500",
        stock: 80,
        isActive: true,
        isFeatured: false,
        tags: JSON.stringify(["greeting", "cards", "wishes"])
      },
      {
        name: "Custom Name Plate",
        namebn: "কাস্টম নেম প্লেট",
        description: "Personalized wooden name plate for home",
        descriptionbn: "ঘরের জন্য ব্যক্তিগতকৃত কাঠের নেম প্লেট",
        price: 75000,
        category: "gifts",
        categorybn: "উপহার",
        imageUrl: "https://images.unsplash.com/photo-1542223189-67a03fa0f0bd?w=500",
        stock: 40,
        isActive: true,
        isFeatured: true,
        tags: JSON.stringify(["nameplate", "wooden", "custom"])
      },
      {
        name: "Gift Hamper Basket",
        namebn: "গিফট হ্যাম্পার ঝুড়ি",
        description: "Beautiful wicker basket for gift hampers",
        descriptionbn: "গিফট হ্যাম্পারের জন্য সুন্দর উইকার ঝুড়ি",
        price: 85000,
        category: "gifts",
        categorybn: "উপহার",
        imageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500",
        stock: 35,
        isActive: true,
        isFeatured: false,
        tags: JSON.stringify(["basket", "hamper", "wicker"])
      },
      {
        name: "Anniversary Special Box",
        namebn: "বার্ষিকী বিশেষ বক্স",
        description: "Romantic gift box for anniversary celebrations",
        descriptionbn: "বার্ষিকী উৎসবের জন্য রোমান্টিক গিফট বক্স",
        price: 175000,
        category: "gifts",
        categorybn: "উপহার",
        imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500",
        stock: 18,
        isActive: true,
        isFeatured: true,
        tags: JSON.stringify(["anniversary", "romantic", "special"])
      }
    ];

    // Insert all products
    for (const product of sampleProducts) {
      await db.insert(products).values(product);
    }

    console.log('✅ Database seeded successfully!');
    console.log(`📦 Added ${sampleProducts.length} products`);
    console.log('🏪 Products by category:');
    console.log('   - Lifestyle: 8 products');
    console.log('   - T-Shirts: 6 products');
    console.log('   - Home Decor: 8 products');
    console.log('   - Gifts: 8 products');
    console.log('🔑 Admin credentials: username: admin, password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
