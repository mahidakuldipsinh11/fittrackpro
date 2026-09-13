
const RAW_PRODUCTS = [
  {
    id: 1,
    name: "Pro Olympic Barbell 20kg",
    cat: "Barbells",
    price: 8499,
    was: 10499,
    off: 19,
    description: "Hard chrome zinc coating with 190,000 PSI tensile strength steel. Engineered for heavy deadlifts and squats.",
    image: "product_images/olympic-barbell-20kg.jpg",
    tag: "Bestseller",
    is_deal: true,
    claimed: 88,
    endsInHours: 48
  },
  {
    id: 2,
    name: "Rubber Bumper Plate Set 100kg",
    cat: "Plates",
    price: 11999,
    was: 14999,
    off: 20,
    description: "100% virgin rubber bumper plates with low bounce and stainless steel center insert.",
    image: "product_images/rubber-bumper-plate-set-100kg.jpg",
    tag: "New",
    is_deal: true,
    claimed: 62,
    endsInHours: 120
  },
  {
    id: 3,
    name: "Heavy Duty Power Rack",
    cat: "Racks",
    price: 26499,
    was: 32999,
    off: 20,
    description: "3x3 inch 11-gauge steel frame with multi-grip pull-up bar, J-hooks, and safety spotter arms.",
    image: "product_images/heavy-duty-power-rack.jpg",
    tag: "Bestseller",
    is_deal: true,
    claimed: 85,
    endsInHours: 72
  },
  {
    id: 4,
    name: "Adjustable FID Bench",
    cat: "Benches",
    price: 7299,
    was: 9299,
    off: 22,
    description: "Commercial 7-position backrest, 3-position seat, dense vinyl padding, max load 450kg.",
    image: "product_images/adjustable-fid-bench.jpg",
    tag: null,
    is_deal: true,
    claimed: 78,
    endsInHours: 144
  },
  {
    id: 5,
    name: "Commercial Treadmill T-9",
    cat: "Cardio",
    price: 52999,
    was: 64999,
    off: 18,
    description: "4.5 HP peak AC motor, 20 km/h top speed, 15% automatic incline, shock-absorbing deck.",
    image: "product_images/commercial-treadmill-t9.jpg",
    tag: "Top Rated",
    is_deal: true,
    claimed: 92,
    endsInHours: 24
  },
  {
    id: 6,
    name: "Air Rowing Machine",
    cat: "Cardio",
    price: 22799,
    was: 28499,
    off: 20,
    description: "Dynamic air resistance flywheel with Bluetooth performance monitor and ergonomic handle.",
    image: "product_images/air-rowing-machine.jpg",
    tag: null,
    is_deal: true,
    claimed: 65,
    endsInHours: 72
  },
  {
    id: 7,
    name: "EZ Curl Bar",
    cat: "Barbells",
    price: 2799,
    was: 3499,
    off: 20,
    description: "Ergonomic angled shafts reduce wrist strain during bicep curls and tricep extensions.",
    image: "product_images/ez-curl-bar.jpg",
    tag: "Popular",
    is_deal: false,
    claimed: 40,
    endsInHours: 48
  },
  {
    id: 8,
    name: "Cast Iron Plate Set 50kg",
    cat: "Plates",
    price: 6999,
    was: 8499,
    off: 17,
    description: "Precision machined solid cast iron weight plates with dark hammertone finish.",
    image: "product_images/cast-iron-plate-set-50kg.jpg",
    tag: null,
    is_deal: false,
    claimed: 50,
    endsInHours: 96
  },
  {
    id: 9,
    name: "Half Rack with Pull-up Bar",
    cat: "Racks",
    price: 24999,
    was: 29999,
    off: 16,
    description: "Compact space-saving design with weight plate storage horns and heavy-duty spotter arms.",
    image: "product_images/half-rack-with-pullup-bar.jpg",
    tag: null,
    is_deal: false,
    claimed: 30,
    endsInHours: 72
  },
  {
    id: 10,
    name: "Flat Utility Bench",
    cat: "Benches",
    price: 4599,
    was: 5499,
    off: 16,
    description: "Rock-solid 3-point stance flat bench built with 70mm steel tubing and high-density foam.",
    image: "product_images/flat-utility-bench.jpg",
    tag: null,
    is_deal: false,
    claimed: 45,
    endsInHours: 120
  },
  {
    id: 11,
    name: "Spin Bike Studio Edition",
    cat: "Cardio",
    price: 21999,
    was: 26999,
    off: 18,
    description: "Heavy 18kg flywheel, quiet magnetic resistance system, dual SPD compatible pedals.",
    image: "product_images/spin-bike-studio-edition.jpg",
    tag: "Hot Seller",
    is_deal: false,
    claimed: 70,
    endsInHours: 48
  },
  {
    id: 12,
    name: "Trap Bar / Hex Bar",
    cat: "Barbells",
    price: 5999,
    was: 7199,
    off: 16,
    description: "Dual textured knurled grip handles for deadlifting with reduced lower back stress.",
    image: "product_images/trap-bar-hex-bar.jpg",
    tag: null,
    is_deal: false,
    claimed: 55,
    endsInHours: 84
  },
  {
    id: 13,
    name: "Premium Cotton Wrist Wraps",
    cat: "Accessories",
    price: 150,
    was: 249,
    description: "Pair of breathable cotton wrist wraps with adjustable hook-and-loop closure for safer pressing and lifting sessions.",
    image: "product_images/premium-cotton-wrist-wraps.jpg" ,
    tag: "Budget Pick"
  },
  {
    id: 14,
    name: "Resistance Band Set - 5 Levels",
    cat: "Accessories",
    price: 799,
    was: 1199,
    description: "Five colour-coded resistance bands with door anchor, handles and ankle straps for home strength training.",
    image: "product_images/resistance-band-set-5-levels.jpg",
    tag: "Popular"
  },
  {
    id: 15,
    name: "Adjustable Dumbbell Pair 20kg",
    cat: "Dumbbells",
    price: 6499,
    was: 7999,
    description: "Space-saving adjustable dumbbells with secure selector pins and a durable storage tray.",
    image: "product_images/adjustable-dumbbell-pair-20kg.jpg",
    tag: "Bestseller"
  },
  {
    id: 16,
    name: "Kettlebell Set 4kg to 16kg",
    cat: "Kettlebells",
    price: 8999,
    was: 10999,
    description: "Four powder-coated cast-iron kettlebells for swings, carries, squats and functional fitness workouts.",
    image: "product_images/kettlebell-set-4kg-to-16kg.jpg",
    tag: "New"
  },
  {
    id: 17,
    name: "Olympic Weightlifting Platform",
    cat: "Flooring",
    price: 18999,
    was: 22999,
    description: "Heavy-duty bamboo centre platform with high-density rubber landing zones to protect your floor and equipment.",
    image: "product_images/olympic-weightlifting-platform.jpg",
    tag: "Premium"
  },
  {
    id: 18,
    name: "Functional Cable Crossover Machine",
    cat: "Machines",
    price: 89999,
    was: 109999,
    description: "Dual adjustable pulley trainer with 90kg weight stacks, 21 height positions and commercial-grade cables.",
    image: "product_images/functional-cable-crossover-machine.jpg",
    tag: "Top Rated"
  },
  {
    id: 19,
    name: "Smith Machine with Lat Pulldown",
    cat: "Machines",
    price: 124999,
    was: 149999,
    description: "All-in-one strength station with linear bearings, adjustable safeties, cable pulley and lat pulldown attachment.",
    image: "product_images/smith-machine-with-lat-pulldown.jpg",
    tag: "Premium"
  },
  {
    id: 20,
    name: "Commercial Elliptical Trainer",
    cat: "Cardio",
    price: 74999,
    was: 89999,
    description: "Self-powered cross trainer with 20 resistance levels, oversized pedals and smooth magnetic drive system.",
    image: "product_images/commercial-elliptical-trainer.jpg"
  },
  {
    id: 21,
    name: "Curved Manual Treadmill",
    cat: "Cardio",
    price: 159999,
    was: 189999,
    description: "Motor-free curved treadmill with responsive slat belt for high-intensity interval and endurance training.",
    image: "product_images/curved-manual-treadmill.jpg",
    tag: "Elite"
  },
  {
    id: 22,
    name: "Professional Leg Press Machine",
    cat: "Machines",
    price: 179999,
    was: 209999,
    description: "45-degree plate-loaded leg press with large non-slip footplate, smooth guide rods and high-density back support.",
    image: "product_images/professional-leg-press-machine.jpg",
    tag: "Commercial"
  },
  {
    id: 23,
    name: "Multi Station 8-User Gym",
    cat: "Commercial Gym",
    price: 249999,
    was: 279999,
    description: "Commercial multi-station gym with independent cable exercise pods, protective shrouds and selectorised weight stacks.",
    image: "product_images/multi-station-8-user-gym.jpg",
    tag: "Commercial"
  },
  {
    id: 24,
    name: "Complete Commercial Gym Setup",
    cat: "Commercial Gym",
    price: 300000,
    was: 349999,
    description: "Complete premium gym package including racks, benches, barbells, plates, cardio equipment and installation support.",
    image: "product_images/complete-commercial-gym-setup.jpg",
    tag: "Complete Setup"
  },
  {
    id: 25, name: "Neoprene Dumbbell Pair 2kg", cat: "Dumbbells", price: 899, was: 1199,
    description: "Comfort-grip neoprene dumbbells for mobility, aerobics and beginner strength exercises.", image: "product_images/neoprene-dumbbell-pair-2kg.jpg"
  },
  {
    id: 26, name: "Skipping Rope with Counter", cat: "Accessories", price: 299, was: 449,
    description: "Adjustable steel-wire skipping rope with comfortable handles and a built-in repetition counter.", image: "product_images/skipping-rope-with-counter.jpg"
  },
  {
    id: 27, name: "Push-Up Board Training System", cat: "Accessories", price: 1299, was: 1699,
    description: "Colour-coded push-up board targets chest, shoulders, triceps and back with correct hand placement.", image: "product_images/push-up-board-training-system.jpg" 
  },
  {
    id: 28, name: "Ab Roller Wheel with Knee Pad", cat: "Accessories", price: 699, was: 999,
    description: "Wide dual-wheel abdominal trainer with non-slip grip and cushioned knee pad for core workouts.", image: "product_images/ab-roller-wheel-with-knee-pad.jpg"
  },
  {
    id: 29, name: "Yoga Mat 8mm Anti-Slip", cat: "Accessories", price: 999, was: 1399,
    description: "High-density anti-slip exercise mat for yoga, stretching, floor workouts and recovery sessions.", image: "product_images/yoga-mat-8mm-anti-slip.jpg"
  },
  {
    id: 30, name: "Weighted Medicine Ball 8kg", cat: "Functional Training", price: 2499, was: 2999,
    description: "Textured rubber medicine ball built for throws, slams, rotational drills and core training.", image: "product_images/weighted-medicine-ball-8kg.jpg"
  },
  {
    id: 31, name: "Plyometric Jump Box Set", cat: "Functional Training", price: 5499, was: 6999,
    description: "Three foam plyometric boxes with non-slip covers for jumps, step-ups and agility training.", image: "product_images/plyometric-jump-box-set.jpg"
  },
  {
    id: 32, name: "Battle Rope 40ft", cat: "Functional Training", price: 3499, was: 4299,
    description: "Heavy-duty polyester battle rope with heat-shrink handles for conditioning and full-body workouts.", image: "product_images/battle-rope-40ft.jpg"
  },
  {
    id: 33, name: "Pull-Up Bar Doorway Mount", cat: "Accessories", price: 1599, was: 1999,
    description: "No-drill doorway pull-up bar with multiple grip positions and protective frame pads.", image: "product_images/pull-up-bar-doorway-mount.jpg"
  },
  {
    id: 34, name: "Adjustable Weight Bench Pro", cat: "Benches", price: 10999, was: 12999,
    description: "Seven-position incline, flat and decline bench with thick upholstery and wheeled transport handle.", image: "product_images/adjustable-weight-bench-pro.jpg"
  },
  {
    id: 35, name: "Olympic Curl Bar with Collars", cat: "Barbells", price: 4299, was: 5299,
    description: "Chrome Olympic curl bar with rotating sleeves and spring collars for comfortable arm training.", image: "product_images/olympic-curl-bar-with-collars.jpg"
  },
  {
    id: 36, name: "Competition Kettlebell 24kg", cat: "Kettlebells", price: 4999, was: 5999,
    description: "Steel competition kettlebell with uniform handle size for swings, snatches and clean-and-press drills.", image: "product_images/competition-kettlebell-24kg.jpg"
  },
  {
    id: 37, name: "Vertical Plate Storage Tree", cat: "Storage", price: 3999, was: 4999,
    description: "Compact plate tree with six Olympic storage pegs and a stable powder-coated steel base.", image: "product_images/vertical-plate-storage-tree.jpg"
  },
  {
    id: 38, name: "Dumbbell Storage Rack 3 Tier", cat: "Storage", price: 11999, was: 13999,
    description: "Commercial three-tier dumbbell rack with angled shelves for organised, easy-access storage.", image: "product_images/dumbbell-storage-rack-3-tier.jpg"
  },
  {
    id: 39, name: "Spin Bike Home Edition", cat: "Cardio", price: 18499, was: 22999,
    description: "Belt-driven indoor bike with magnetic resistance, adjustable saddle and LCD performance display.", image: "product_images/spin-bike-home-edition.jpg"
  },
  {
    id: 40, name: "Recumbent Exercise Bike", cat: "Cardio", price: 32999, was: 39999,
    description: "Low-impact recumbent bike with supportive backrest, pulse sensors and multiple workout programs.", image: "product_images/recumbent-exercise-bike.jpg"
  },
  {
    id: 41, name: "Stair Climber Step Machine", cat: "Cardio", price: 119999, was: 139999,
    description: "Commercial stair climber with independent pedals, 15 training programs and ergonomic support rails.", image: "product_images/stair-climber-step-machine.jpg"
  },
  {
    id: 42, name: "Seated Chest Press Machine", cat: "Machines", price: 68999, was: 79999,
    description: "Selectorised chest press with adjustable seat, converging press arms and protective weight shroud.", image: "product_images/seated-chest-press-machine.jpg"
  },
  {
    id: 43, name: "Lat Pulldown and Low Row", cat: "Machines", price: 64999, was: 74999,
    description: "Dual-function strength machine with wide pulldown bar, low-row handle and 100kg weight stack.", image: "product_images/lat-pulldown-and-low-row.jpg"
  },
  {
    id: 44, name: "Seated Leg Extension Machine", cat: "Machines", price: 59999, was: 69999,
    description: "Commercial leg extension with adjustable back pad, ankle roller and smooth selectorised resistance.", image: "product_images/seated-leg-extension-machine.jpg"
  },
  {
    id: 45, name: "Preacher Curl Bench", cat: "Benches", price: 13999, was: 15999,
    description: "Ergonomic preacher curl bench with angled arm pad and stable steel frame for focused bicep work.", image: "product_images/preacher-curl-bench.jpg"
  },
  {
    id: 46, name: "Sled Push and Pull Trainer", cat: "Functional Training", price: 17999, was: 20999,
    description: "Heavy steel conditioning sled with removable posts, harness anchor and smooth floor runners.", image: "product_images/sled-push-and-pull-trainer.jpg"
  },
  {
    id: 47, name: "Rubber Gym Flooring Roll 10mm", cat: "Flooring", price: 7999, was: 9499,
    description: "Shock-absorbing rubber flooring roll for home gyms, weight rooms and cardio spaces.", image: "product_images/rubber-gym-flooring-roll-10mm.jpg"
  },
  {
    id: 48, name: "Assisted Dip and Pull-Up Machine", cat: "Machines", price: 94999, was: 109999,
    description: "Counterbalanced assisted dip and pull-up machine with knee pad, multi-grip handles and weight stack.", image: "product_images/assisted-dip-and-pull-up-machine.jpg"
  },
  {
    id: 49, name: "Full Powerlifting Competition Rack", cat: "Racks", price: 139999, was: 159999,
    description: "Competition-grade modular rack with monolift arms, safety straps, band pegs and lifting platform anchors.", image: "product_images/full-powerlifting-competition-rack.jpg"
  },
  {
    id: 50, name: "Luxury Home Gym Package", cat: "Commercial Gym", price: 285000, was: 320000,
    description: "Premium home gym package with cardio equipment, cable trainer, rack, bench, flooring and installation support.", image: "product_images/luxury-home-gym-package.jpg", tag: "Premium Setup"
  }
];

export const PRODUCTS_DATA = RAW_PRODUCTS;
