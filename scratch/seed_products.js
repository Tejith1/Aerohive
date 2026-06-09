const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ohnnwazrfvgccokgkhjj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obm53YXpyZnZnY2Nva2draGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI4ODcsImV4cCI6MjA3MzEzODg4N30.NS4FTQ-0ja4VA8eSM9QI5QOpOQ25evomGPeRddIfpiM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function seed() {
  try {
    // 1. Get Categories
    const { data: categories, error: catError } = await supabase.from('categories').select('*')
    if (catError) throw catError
    console.log('Found categories:', categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })))

    const catMap = {}
    categories.forEach(c => {
      catMap[c.slug] = c.id
    })

    // 2. Prepare Products
    const productsToInsert = [
      // Racing Drones
      {
        name: 'AeroX Pro 4K Racing Drone',
        description: 'The AeroX Pro 4K is the ultimate racing drone for professional pilots and enthusiasts. Built with carbon fiber construction and equipped with a high-performance flight controller, this drone delivers unmatched speed and agility while maintaining professional-grade video recording capabilities. Features GPS Auto-Return, Obstacle Avoidance, Racing Mode, Sport Mode, and Emergency Landing capabilities.',
        short_description: 'Ultimate racing drone with 4K camera and carbon fiber construction',
        price: 746.99,
        compare_price: 912.99,
        sku: 'AEROX-PRO-4K-001',
        stock_quantity: 25,
        category_id: catMap['racing-drones'],
        image_url: '/placeholder.svg?height=400&width=400&text=AeroX+Racing+Drone',
        is_featured: true,
        slug: 'aerox-pro-4k-racing-drone',
        is_active: true,
        specifications: {
          flightTime: "25 minutes",
          maxSpeed: "120 km/h",
          cameraResolution: "4K Ultra HD",
          range: "8 km",
          batteryCapacity: "5000mAh",
          weight: "1.2 kg",
          dimensions: "350mm x 350mm x 120mm",
          maxAltitude: "6000m",
          windResistance: "Level 6 (10.8-13.8 m/s)",
          chargingTime: "90 minutes"
        }
      },
      {
        name: 'VelocityX Racing Beast',
        description: 'Professional racing drone designed for competitive FPV racing. Ultra-lightweight carbon fiber frame with advanced flight controller and high-speed motors. Built for speed and precision with customizable racing modes and real-time telemetry.',
        short_description: 'Professional FPV racing drone with ultra-lightweight design',
        price: 599.99,
        compare_price: 749.99,
        sku: 'VELOX-BEAST-002',
        stock_quantity: 30,
        category_id: catMap['racing-drones'],
        image_url: '/placeholder.svg?height=400&width=400&text=VelocityX+Beast',
        is_featured: true,
        slug: 'velocityx-racing-beast',
        is_active: true,
        specifications: {
          flightTime: "18 minutes",
          maxSpeed: "150 km/h",
          cameraResolution: "1080p FPV",
          range: "5 km",
          batteryCapacity: "4000mAh",
          weight: "0.8 kg",
          dimensions: "280mm x 280mm x 90mm",
          maxAltitude: "5000m",
          windResistance: "Level 5 (8.0-10.7 m/s)",
          chargingTime: "60 minutes"
        }
      },
      // Photography Drones
      {
        name: 'SkyCapture Pro Photography Drone',
        description: 'The SkyCapture Pro is designed for professional photographers and videographers who demand the highest quality aerial footage. With its advanced 6K camera and precision gimbal, capture stunning cinematic content with ease. Features Gimbal Stabilization, RAW Photo, HDR Video, Follow Me Mode, Active Track, and Manual Camera Controls.',
        short_description: 'Professional 6K photography drone with precision gimbal',
        price: 1078.99,
        compare_price: 1244.99,
        sku: 'SKYCAP-PRO-003',
        stock_quantity: 18,
        category_id: catMap['photography-drones'],
        image_url: '/placeholder.svg?height=400&width=400&text=SkyCapture+Photography',
        is_featured: true,
        slug: 'skycapture-pro-photography-drone',
        is_active: true,
        specifications: {
          flightTime: "35 minutes",
          maxSpeed: "65 km/h",
          cameraResolution: "6K Cinematic",
          range: "15 km",
          batteryCapacity: "6500mAh",
          weight: "1.8 kg",
          dimensions: "380mm x 380mm x 140mm",
          maxAltitude: "7000m",
          windResistance: "Level 7 (13.9-17.1 m/s)",
          chargingTime: "120 minutes"
        }
      },
      {
        name: 'CineMaster 8K Elite',
        description: 'Hollywood-grade cinematography drone with 8K camera, professional-grade gimbal stabilization, and advanced flight modes. Perfect for commercial film production, real estate photography, and premium content creation.',
        short_description: 'Hollywood-grade 8K cinematography drone',
        price: 2199.99,
        compare_price: 2599.99,
        sku: 'CINE-8K-ELITE-004',
        stock_quantity: 12,
        category_id: catMap['photography-drones'],
        image_url: '/placeholder.svg?height=400&width=400&text=CineMaster+8K',
        is_featured: false,
        slug: 'cinemaster-8k-elite',
        is_active: true,
        specifications: {
          flightTime: "42 minutes",
          maxSpeed: "70 km/h",
          cameraResolution: "8K Cinema",
          range: "20 km",
          batteryCapacity: "8000mAh",
          weight: "2.4 kg",
          dimensions: "420mm x 420mm x 160mm",
          maxAltitude: "8000m",
          windResistance: "Level 8 (17.2-20.7 m/s)",
          chargingTime: "150 minutes"
        }
      },
      // Surveillance Drones
      {
        name: 'GuardEye Surveillance Drone',
        description: 'Advanced surveillance drone with thermal imaging, night vision, and long-range capabilities. Designed for security professionals, law enforcement, and private security applications. Features encrypted data transmission and advanced AI object detection.',
        short_description: 'Professional surveillance drone with thermal imaging and night vision',
        price: 1825.99,
        compare_price: 2074.99,
        sku: 'GUARD-EYE-005',
        stock_quantity: 15,
        category_id: catMap['surveillance-drones'],
        image_url: '/placeholder.svg?height=400&width=400&text=GuardEye+Surveillance',
        is_featured: true,
        slug: 'guardeye-surveillance-drone',
        is_active: true,
        specifications: {
          flightTime: "60 minutes",
          maxSpeed: "80 km/h",
          cameraResolution: "4K + Thermal",
          range: "25 km",
          batteryCapacity: "10000mAh",
          weight: "2.8 kg",
          dimensions: "450mm x 450mm x 180mm",
          maxAltitude: "10000m",
          windResistance: "Level 8 (17.2-20.7 m/s)",
          chargingTime: "180 minutes"
        }
      },
      // Agricultural Drones
      {
        name: 'FarmWing Agricultural Drone',
        description: 'Specialized agricultural drone for crop monitoring, precision spraying, and field analysis. Equipped with multispectral cameras, GPS mapping, and automated flight patterns for efficient farming operations.',
        short_description: 'Agricultural drone for crop monitoring and precision farming',
        price: 3499.99,
        compare_price: 3999.99,
        sku: 'FARM-WING-006',
        stock_quantity: 8,
        category_id: catMap['agricultural-drones'],
        image_url: '/placeholder.svg?height=400&width=400&text=FarmWing+Agricultural',
        is_featured: false,
        slug: 'farmwing-agricultural-drone',
        is_active: true,
        specifications: {
          flightTime: "45 minutes",
          maxSpeed: "50 km/h",
          cameraResolution: "Multispectral + 4K",
          range: "12 km",
          batteryCapacity: "12000mAh",
          weight: "5.2 kg",
          dimensions: "1200mm x 1200mm x 200mm",
          maxAltitude: "5000m",
          windResistance: "Level 6 (10.8-13.8 m/s)",
          chargingTime: "240 minutes"
        }
      },
      // Industrial Drones
      {
        name: 'TitanWork Industrial Drone',
        description: 'Heavy-duty industrial drone for infrastructure inspection, construction monitoring, and maintenance operations. Built with rugged design, advanced sensors, and long-range capabilities for professional applications.',
        short_description: 'Heavy-duty industrial drone for professional inspections',
        price: 4299.99,
        compare_price: 4899.99,
        sku: 'TITAN-WORK-007',
        stock_quantity: 6,
        category_id: catMap['industrial-drones'],
        image_url: '/placeholder.svg?height=400&width=400&text=TitanWork+Industrial',
        is_featured: false,
        slug: 'titanwork-industrial-drone',
        is_active: true,
        specifications: {
          flightTime: "55 minutes",
          maxSpeed: "60 km/h",
          cameraResolution: "4K + LiDAR",
          range: "30 km",
          batteryCapacity: "15000mAh",
          weight: "6.8 kg",
          dimensions: "800mm x 800mm x 250mm",
          maxAltitude: "8000m",
          windResistance: "Level 9 (20.8-24.4 m/s)",
          chargingTime: "300 minutes"
        }
      },
      // Entry-level drone
      {
        name: 'SkyStarter Beginner Drone',
        description: 'Perfect entry-level drone for beginners and hobbyists. Easy to fly with intuitive controls, built-in safety features, and HD camera for capturing your first aerial photos and videos.',
        short_description: 'Entry-level drone perfect for beginners',
        price: 199.99,
        compare_price: 249.99,
        sku: 'SKY-START-008',
        stock_quantity: 50,
        category_id: catMap['photography-drones'], // Fallback
        image_url: '/placeholder.svg?height=400&width=400&text=SkyStarter+Beginner',
        is_featured: false,
        slug: 'skystarter-beginner-drone',
        is_active: true,
        specifications: {
          flightTime: "20 minutes",
          maxSpeed: "30 km/h",
          cameraResolution: "1080p HD",
          range: "2 km",
          batteryCapacity: "2500mAh",
          weight: "0.6 kg",
          dimensions: "240mm x 240mm x 80mm",
          maxAltitude: "3000m",
          windResistance: "Level 4 (5.5-7.9 m/s)",
          chargingTime: "90 minutes"
        }
      }
    ]

    console.log('Inserting products...')
    const { data: inserted, error: insertError } = await supabase.from('products').insert(productsToInsert).select()
    if (insertError) throw insertError
    console.log('Seeded products successfully! Total:', inserted.length)
  } catch (error) {
    console.error('Seeding products failed:', error)
  }
}

seed()
