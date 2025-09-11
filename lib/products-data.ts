// Comprehensive drone products data
export const products = [
  {
    id: 1,
    name: "AeroX Pro 4K Racing Drone",
    price: 74699,
    comparePrice: 91299,
    imageUrl: "/placeholder.svg?height=400&width=400&text=AeroX+Racing+Drone",
    slug: "aerox-pro-4k-racing-drone",
    averageRating: 4.8,
    reviewCount: 342,
    isFeatured: true,
    stockQuantity: 25,
    category: "Racing Drones",
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
    },
    features: ["GPS Auto-Return", "Obstacle Avoidance", "4K Camera", "Racing Mode", "Sport Mode", "Cinematic Mode", "Follow Me", "Waypoint Navigation", "Emergency Landing", "LED Night Lights"],
    badge: "Best Seller",
    description: "The AeroX Pro 4K is the ultimate racing drone for professional pilots and enthusiasts. Built with carbon fiber construction and equipped with a high-performance flight controller, this drone delivers unmatched speed and agility while maintaining professional-grade video recording capabilities.",
    images: [
      "/placeholder.svg?height=600&width=600&text=AeroX+Main+View",
      "/placeholder.svg?height=600&width=600&text=AeroX+Side+View", 
      "/placeholder.svg?height=600&width=600&text=AeroX+Top+View",
      "/placeholder.svg?height=600&width=600&text=AeroX+Camera+View"
    ],
    inTheBox: [
      "AeroX Pro 4K Drone",
      "Remote Controller",
      "3 x Intelligent Flight Batteries",
      "Battery Charging Hub",
      "Propeller Guards",
      "8 x Propellers",
      "Gimbal Protector",
      "Carrying Case",
      "USB Cable",
      "Quick Start Guide"
    ]
  },
  {
    id: 2,
    name: "SkyCapture Pro Photography Drone",
    price: 107899,
    comparePrice: 124499,
    imageUrl: "/placeholder.svg?height=400&width=400&text=SkyCapture+Photography",
    slug: "skycapture-pro-photography-drone",
    averageRating: 4.9,
    reviewCount: 218,
    isFeatured: true,
    stockQuantity: 18,
    category: "Photography Drones",
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
    },
    features: ["Gimbal Stabilization", "RAW Photo", "HDR Video", "Follow Me Mode", "Active Track", "Cinematic Mode", "Panorama", "Time Lapse", "Slow Motion", "Manual Camera Controls"],
    badge: "Professional",
    description: "The SkyCapture Pro is designed for professional photographers and videographers who demand the highest quality aerial footage. With its advanced 6K camera and precision gimbal, capture stunning cinematic content with ease.",
    images: [
      "/placeholder.svg?height=600&width=600&text=SkyCapture+Main+View",
      "/placeholder.svg?height=600&width=600&text=SkyCapture+Side+View",
      "/placeholder.svg?height=600&width=600&text=SkyCapture+Camera+View",
      "/placeholder.svg?height=600&width=600&text=SkyCapture+Action+View"
    ],
    inTheBox: [
      "SkyCapture Pro Drone",
      "Professional Remote Controller",
      "4 x High-Capacity Batteries",
      "Multi-Bay Charging Station",
      "Professional Carrying Case",
      "ND Filter Set",
      "Extra Propellers",
      "Gimbal Cover",
      "Memory Cards",
      "Professional Manual"
    ]
  },
  {
    id: 3,
    name: "GuardEye Surveillance Drone",
    price: 182599,
    comparePrice: 207499,
    imageUrl: "/placeholder.svg?height=400&width=400&text=GuardEye+Surveillance",
    slug: "guardeye-surveillance-drone",
    averageRating: 4.7,
    reviewCount: 156,
    isFeatured: true,
    stockQuantity: 12,
    category: "Surveillance Drones",
    specifications: {
      flightTime: "45 minutes",
      maxSpeed: "80 km/h",
      cameraResolution: "Thermal + 4K",
      range: "20 km",
      batteryCapacity: "8000mAh",
      weight: "2.5 kg",
      dimensions: "420mm x 420mm x 160mm",
      maxAltitude: "8000m",
      windResistance: "Level 8 (17.2-20.7 m/s)",
      chargingTime: "150 minutes"
    },
    features: ["Thermal Imaging", "Night Vision", "Live Streaming", "Encrypted Data", "Silent Mode", "Auto Patrol", "Intrusion Detection", "Emergency Alert", "Weather Proof", "Stealth Design"],
    badge: "Military Grade",
    description: "The GuardEye Surveillance Drone is built for professional security and monitoring applications. With advanced thermal imaging and encrypted communication, it provides unmatched surveillance capabilities.",
    images: [
      "/placeholder.svg?height=600&width=600&text=GuardEye+Main+View",
      "/placeholder.svg?height=600&width=600&text=GuardEye+Thermal+View",
      "/placeholder.svg?height=600&width=600&text=GuardEye+Night+View",
      "/placeholder.svg?height=600&width=600&text=GuardEye+Control+View"
    ],
    inTheBox: [
      "GuardEye Surveillance Drone",
      "Encrypted Control Station",
      "6 x Extended Flight Batteries",
      "Thermal Imaging Module",
      "Night Vision Enhancement",
      "Secure Communication Kit",
      "Weather Protection Case",
      "Mounting Accessories",
      "Security Manual",
      "Training Materials"
    ]
  },
  {
    id: 4,
    name: "AgroMax Crop Spraying Drone",
    price: 290499,
    comparePrice: 323699,
    imageUrl: "/placeholder.svg?height=400&width=400&text=AgroMax+Agricultural",
    slug: "agromax-crop-spraying-drone",
    averageRating: 4.6,
    reviewCount: 89,
    isFeatured: false,
    stockQuantity: 8,
    category: "Agricultural Drones",
    specifications: {
      flightTime: "40 minutes",
      maxSpeed: "50 km/h",
      cameraResolution: "Multispectral",
      range: "10 km",
      batteryCapacity: "12000mAh",
      weight: "15 kg",
      dimensions: "1200mm x 1200mm x 400mm",
      maxAltitude: "3000m",
      windResistance: "Level 6 (10.8-13.8 m/s)",
      chargingTime: "240 minutes"
    },
    features: ["Precision Spraying", "Crop Monitoring", "GPS Mapping", "Weather Resistant", "Auto Mission", "Spray Pattern Control", "Tank Monitoring", "Field Analytics", "Route Optimization", "Chemical Compatibility"],
    badge: "Commercial",
    description: "The AgroMax is designed for precision agriculture, offering automated crop spraying and monitoring capabilities. Perfect for large-scale farming operations requiring efficiency and precision.",
    images: [
      "/placeholder.svg?height=600&width=600&text=AgroMax+Main+View",
      "/placeholder.svg?height=600&width=600&text=AgroMax+Spray+View",
      "/placeholder.svg?height=600&width=600&text=AgroMax+Field+View",
      "/placeholder.svg?height=600&width=600&text=AgroMax+Tank+View"
    ],
    inTheBox: [
      "AgroMax Drone",
      "Agricultural Control System",
      "Spray Tank System",
      "Precision Nozzles",
      "Field Mapping Software",
      "Weather Station",
      "Professional Batteries",
      "Maintenance Kit",
      "Agricultural Manual",
      "Training Course Access"
    ]
  },
  {
    id: 5,
    name: "DeliveryWing Cargo Drone",
    price: 414999,
    comparePrice: 456499,
    imageUrl: "/placeholder.svg?height=400&width=400&text=DeliveryWing+Cargo",
    slug: "deliverywing-cargo-drone",
    averageRating: 4.5,
    reviewCount: 67,
    isFeatured: false,
    stockQuantity: 5,
    category: "Delivery Drones",
    specifications: {
      flightTime: "60 minutes",
      maxSpeed: "90 km/h",
      cameraResolution: "Navigation Camera",
      range: "25 km",
      batteryCapacity: "15000mAh",
      weight: "25 kg",
      dimensions: "1500mm x 1500mm x 500mm",
      maxAltitude: "5000m",
      windResistance: "Level 7 (13.9-17.1 m/s)",
      chargingTime: "300 minutes"
    },
    features: ["5kg Payload", "Auto Delivery", "Route Planning", "Package Protection", "Landing Precision", "Customer Notification", "Secure Drop", "Return to Base", "Traffic Avoidance", "Emergency Landing"],
    badge: "Heavy Duty",
    description: "The DeliveryWing is built for commercial delivery operations, capable of carrying packages up to 5kg over long distances with precision landing and automated delivery systems.",
    images: [
      "/placeholder.svg?height=600&width=600&text=DeliveryWing+Main+View",
      "/placeholder.svg?height=600&width=600&text=DeliveryWing+Cargo+View",
      "/placeholder.svg?height=600&width=600&text=DeliveryWing+Landing+View",
      "/placeholder.svg?height=600&width=600&text=DeliveryWing+Flight+View"
    ],
    inTheBox: [
      "DeliveryWing Drone",
      "Cargo Delivery System",
      "Automated Landing Gear",
      "Route Planning Software",
      "Customer App Interface",
      "Security Modules",
      "High-Capacity Batteries",
      "Ground Station",
      "Operations Manual",
      "Commercial License Kit"
    ]
  },
  {
    id: 6,
    name: "MapMaster Survey Drone",
    price: 157699,
    comparePrice: 182599,
    imageUrl: "/placeholder.svg?height=400&width=400&text=MapMaster+Survey",
    slug: "mapmaster-survey-drone",
    averageRating: 4.8,
    reviewCount: 134,
    isFeatured: false,
    stockQuantity: 15,
    category: "Mapping Drones",
    specifications: {
      flightTime: "50 minutes",
      maxSpeed: "70 km/h",
      cameraResolution: "High-Res Mapping",
      range: "18 km",
      batteryCapacity: "8500mAh",
      weight: "2.2 kg",
      dimensions: "400mm x 400mm x 150mm",
      maxAltitude: "7500m",
      windResistance: "Level 6 (10.8-13.8 m/s)",
      chargingTime: "180 minutes"
    },
    features: ["3D Mapping", "Photogrammetry", "LiDAR Compatible", "Survey Grade GPS", "Ground Control Points", "Orthomosaic Generation", "Point Cloud Processing", "Volume Calculations", "Terrain Analysis", "CAD Integration"],
    badge: "Survey Grade",
    description: "The MapMaster is engineered for professional surveying and mapping applications, delivering survey-grade accuracy for construction, mining, and land development projects.",
    images: [
      "/placeholder.svg?height=600&width=600&text=MapMaster+Main+View",
      "/placeholder.svg?height=600&width=600&text=MapMaster+Survey+View",
      "/placeholder.svg?height=600&width=600&text=MapMaster+LiDAR+View",
      "/placeholder.svg?height=600&width=600&text=MapMaster+Data+View"
    ],
    inTheBox: [
      "MapMaster Drone",
      "Survey Control System",
      "High-Resolution Camera",
      "LiDAR Module",
      "GPS Base Station",
      "Mapping Software Suite",
      "Data Processing Tools",
      "Survey Accessories",
      "Professional Manual",
      "Certification Kit"
    ]
  },
  {
    id: 7,
    name: "RescueHawk Search & Rescue",
    price: 232399,
    comparePrice: 265599,
    imageUrl: "/placeholder.svg?height=400&width=400&text=RescueHawk+SAR",
    slug: "rescuehawk-search-rescue-drone",
    averageRating: 4.9,
    reviewCount: 98,
    isFeatured: true,
    stockQuantity: 10,
    category: "Search & Rescue",
    specifications: {
      flightTime: "55 minutes",
      maxSpeed: "85 km/h",
      cameraResolution: "Thermal + 4K",
      range: "22 km",
      batteryCapacity: "9000mAh",
      weight: "2.8 kg",
      dimensions: "450mm x 450mm x 170mm",
      maxAltitude: "8500m",
      windResistance: "Level 8 (17.2-20.7 m/s)",
      chargingTime: "200 minutes"
    },
    features: ["Emergency Beacon", "Thermal Search", "Voice Communication", "Emergency Drop", "Search Patterns", "Survivor Detection", "Emergency Lighting", "Weather Resistant", "Quick Deploy", "Emergency Coordination"],
    badge: "Life Saver",
    description: "The RescueHawk is specially designed for search and rescue operations, equipped with thermal imaging, emergency communication, and life-saving drop capabilities for critical missions.",
    images: [
      "/placeholder.svg?height=600&width=600&text=RescueHawk+Main+View",
      "/placeholder.svg?height=600&width=600&text=RescueHawk+Thermal+View",
      "/placeholder.svg?height=600&width=600&text=RescueHawk+Rescue+View",
      "/placeholder.svg?height=600&width=600&text=RescueHawk+Emergency+View"
    ],
    inTheBox: [
      "RescueHawk Drone",
      "Emergency Control Station",
      "Thermal Imaging System",
      "Communication Module",
      "Emergency Drop System",
      "Search Light Array",
      "Weather Protection Kit",
      "Emergency Batteries",
      "Rescue Manual",
      "Emergency Response Training"
    ]
  },
  {
    id: 8,
    name: "SkyLearner Beginner Drone",
    price: 24899,
    comparePrice: 33199,
    imageUrl: "/placeholder.svg?height=400&width=400&text=SkyLearner+Beginner",
    slug: "skylearner-beginner-drone",
    averageRating: 4.4,
    reviewCount: 456,
    isFeatured: false,
    stockQuantity: 50,
    category: "Beginner Drones",
    specifications: {
      flightTime: "20 minutes",
      maxSpeed: "30 km/h",
      cameraResolution: "1080p HD",
      range: "2 km",
      batteryCapacity: "2500mAh",
      weight: "0.8 kg",
      dimensions: "250mm x 250mm x 80mm",
      maxAltitude: "3000m",
      windResistance: "Level 4 (5.5-7.9 m/s)",
      chargingTime: "60 minutes"
    },
    features: ["Easy Controls", "Auto Hover", "Training Mode", "Crash Protection", "One-Touch Landing", "Beginner Tutorials", "Safe Flight Zone", "Emergency Stop", "LED Indicators", "Simple Setup"],
    badge: "Beginner Friendly",
    description: "The SkyLearner is perfect for those new to drone flying. With intuitive controls, safety features, and comprehensive tutorials, it's the ideal drone to start your aerial journey.",
    images: [
      "/placeholder.svg?height=600&width=600&text=SkyLearner+Main+View",
      "/placeholder.svg?height=600&width=600&text=SkyLearner+Learning+View",
      "/placeholder.svg?height=600&width=600&text=SkyLearner+Safe+View",
      "/placeholder.svg?height=600&width=600&text=SkyLearner+Tutorial+View"
    ],
    inTheBox: [
      "SkyLearner Drone",
      "Beginner Remote Controller",
      "2 x Training Batteries",
      "Propeller Guards",
      "Extra Propellers",
      "Training Manual",
      "Online Course Access",
      "Safety Gear",
      "Quick Start Guide",
      "Support Kit"
    ]
  }
];

export function getProductBySlug(slug: string) {
  return products.find(product => product.slug === slug);
}

export function getAllProducts() {
  return products;
}
