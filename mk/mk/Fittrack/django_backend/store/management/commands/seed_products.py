"""
Management command to populate the database with 480+ gym equipment,
clothing, supplements, recovery gear, and other fitness products.
"""
from django.core.management.base import BaseCommand
from store.models import Category, Product

PRODUCTS = [
    # ═══════════════════════════════════════════════════════════════
    # BARBELLS & PLATES (50 products)
    # ═══════════════════════════════════════════════════════════════
    ("Barbells & Plates", [
        ("Olympic Barbell 7ft 20kg", 12999, 16999, 24, "Standard Olympic barbell for powerlifting and weightlifting.", True, False, True, "DEAL"),
        ("EZ Curl Bar 4ft", 3999, 5499, 27, "EZ curl bar for bicep and tricep isolation exercises.", False, False, False, ""),
        ("Trap Bar / Hex Bar 25kg", 9999, 12999, 23, "Hex bar for deadlifts and shrugs with neutral grip.", True, False, False, ""),
        ("Safety Squat Bar 7ft", 14999, 18999, 21, "Specialty squat bar with handles for shoulder-friendly squats.", False, False, False, ""),
        ("Women's Olympic Barbell 15kg", 8999, 11999, 25, "Standard women's Olympic barbell 15kg with 25mm shaft.", False, False, True, "BEST SELLER"),
        ("Standard Barbell 6ft", 2999, 4499, 33, "Affordable standard barbell for home gym beginners.", True, False, False, "VALUE"),
        ("Bumper Plate Set 100kg", 24999, 32999, 24, "Full set of rubber bumper plates for Olympic lifting.", True, False, True, "DEAL"),
        ("Bumper Plate 5kg (Pair)", 2499, 3499, 29, "Pair of 5kg rubber bumper plates with steel insert.", False, False, False, ""),
        ("Bumper Plate 10kg (Pair)", 3999, 5499, 27, "Pair of 10kg rubber bumper plates.", False, False, False, ""),
        ("Bumper Plate 15kg (Pair)", 5499, 7499, 27, "Pair of 15kg rubber bumper plates.", False, False, False, ""),
        ("Bumper Plate 20kg (Pair)", 6999, 9999, 30, "Pair of 20kg rubber bumper plates.", True, True, False, "BEST SELLER"),
        ("Bumper Plate 25kg (Pair)", 8499, 11999, 29, "Pair of 25kg competition bumper plates.", False, False, False, ""),
        ("Iron Plate 2.5kg (Pair)", 799, 1199, 33, "Pair of cast iron 2.5kg standard plates.", False, False, False, ""),
        ("Iron Plate 5kg (Pair)", 1299, 1999, 35, "Pair of cast iron 5kg standard plates.", False, False, False, "VALUE"),
        ("Iron Plate 10kg (Pair)", 2299, 3499, 34, "Pair of cast iron 10kg standard plates.", False, False, False, ""),
        ("Iron Plate 15kg (Pair)", 3299, 4999, 34, "Pair of cast iron 15kg standard plates.", False, False, False, ""),
        ("Iron Plate 20kg (Pair)", 4499, 6499, 31, "Pair of cast iron 20kg standard plates.", False, False, False, ""),
        ("Fractional Plate Set 0.5-1.5kg", 1499, 2199, 32, "Micro loading plates for progressive overload.", False, False, False, ""),
        ("Competition Plates Set 250kg", 69999, 89999, 22, "IWF-certified competition bumper plate set.", False, False, True, "PRO"),
        ("Technique Barbell 5ft 8kg", 3499, 4999, 30, "Light technique barbell for beginners.", False, False, False, ""),
        ("Calibrated Steel Plates Set 120kg", 34999, 44999, 22, "IPF calibrated steel competition plates.", False, False, True, "PRO"),
        ("Weightlifting Collars Spring (Pair)", 299, 499, 40, "Spring collar clips for standard barbells.", False, False, False, ""),
        ("Olympic Lock Jaw Collars (Pair)", 799, 1299, 38, "Premium lock-jaw collars for Olympic bars.", False, False, False, "POPULAR"),
        ("Deadlift Jack", 2499, 3499, 29, "Deadlift bar jack for easy plate loading.", False, False, False, ""),
        ("Barbell Pad Squat Neck Cushion", 499, 799, 38, "Foam barbell pad for squats and hip thrusts.", False, False, True, "HOT DEAL"),
        ("Swiss Bar / Football Bar", 8999, 11999, 25, "Multi-grip Swiss bar for pressing and rows.", False, False, False, ""),
        ("Resistance Band Bar Attachments", 1999, 2999, 33, "Barbell attachment for resistance band training.", False, False, False, ""),
        ("Plate Tree Storage Rack", 4999, 6999, 29, "Vertical plate tree for organizing weight plates.", False, False, False, ""),
        ("Olympic Plate Set 50kg", 11999, 15999, 25, "Complete 50kg Olympic plate set.", True, False, False, "DEAL"),
        ("Olympic Plate Set 100kg", 21999, 29999, 27, "Complete 100kg Olympic plate set for serious lifters.", False, False, True, "BEST SELLER"),
        ("Cast Iron Kettlebell Plate 20kg", 3499, 4999, 30, "Cast iron plate with kettlebell-style handle.", False, False, False, ""),
        ("Hex Dumbbell Plate 10kg", 1999, 2999, 33, "Rubber-coated hex plate for dumbbells.", False, False, False, ""),
        ("Change Plate Set 2.5-10kg", 3999, 5499, 27, "Quick-change plate set for micro progression.", False, False, False, ""),
        ("Power Bar 29mm 20kg", 14999, 19999, 26, "Stiff power bar for bench, squat, deadlift.", True, False, False, ""),
        ("Deadlift Bar 27mm 20kg", 15999, 20999, 24, "Flexible deadlift bar with aggressive knurl.", False, False, False, ""),
        ("Olympic Weightlifting Bar 20kg", 18999, 24999, 24, "Competition-spec weightlifting bar.", False, False, True, "PREMIUM"),
        ("Tricep Bar 4ft", 2999, 4499, 33, "Tricep curl bar for skull crushers and pressdowns.", False, False, False, ""),
        ("Axle Bar 8ft 25kg", 5999, 7999, 25, "Thick grip axle bar for strongman training.", False, False, False, ""),
        ("BandBell Earthquake Bar", 12999, 16999, 24, "Oscillating kinetic energy bar for stability.", False, False, False, "PRO"),
        ("Junior Barbell 5ft 10kg", 4999, 6999, 29, "Junior/youth barbell for younger athletes.", False, False, False, ""),
        ("Urethane Bumper Plate Set 140kg", 49999, 64999, 23, "Premium urethane bumper plates, 140kg set.", False, False, True, "PREMIUM"),
        ("Steel Grip Plates 50kg Set", 14999, 19999, 26, "Machined steel grip plates, 50kg.", False, False, False, "VALUE"),
        ("Plate Loading Belt Squat Platform", 29999, 39999, 25, "Plate-loaded belt squat platform.", False, False, False, ""),
        ("Barbell Bearing Kit", 1499, 2199, 32, "Replacement needle bearing kit for Olympic bars.", False, False, False, ""),
        ("Bushing Kit for Power Bar", 999, 1499, 33, "Replacement bushing kit for power bars.", False, False, False, ""),
        ("Chalk Bowl Stand", 1999, 2999, 33, "Freestanding chalk bowl with stand.", False, False, False, ""),
        ("Plate Cleaner Spray 500ml", 399, 599, 33, "Plate cleaning spray to maintain rubber plates.", False, False, False, ""),
        ("Olympic Barbell Gift Box", 22999, 29999, 23, "Premium Olympic barbell in gift packaging.", False, True, False, "NEW ARRIVAL"),
        ("Barbell Resistance Band Set", 1299, 1999, 35, "5-pack resistance bands for barbell training.", False, False, False, "HOT DEAL"),
        ("Calibrated Plates 2.5kg (Pair)", 1999, 2999, 33, "IPF calibrated 2.5kg steel plates.", False, False, False, ""),
    ]),

    # ═══════════════════════════════════════════════════════════════
    # RACKS & RIGS (40 products)
    # ═══════════════════════════════════════════════════════════════
    ("Racks & Rigs", [
        ("Power Cage Half Rack", 34999, 44999, 22, "Heavy-duty half power rack with J-cups and safety arms.", True, False, True, "BEST SELLER"),
        ("Full Power Rack 6-post", 49999, 64999, 23, "Commercial 6-post power rack for serious gyms.", True, False, False, "DEAL"),
        ("Smith Machine Professional", 89999, 119999, 25, "Professional smith machine with linear bearings.", False, False, True, "PRO"),
        ("Functional Trainer Cable Machine", 54999, 69999, 21, "Dual adjustable pulley functional trainer.", False, False, True, "BEST SELLER"),
        ("Half Rack with Lat Pulldown", 39999, 52999, 25, "Half rack combo with integrated lat pulldown.", True, False, False, ""),
        ("Wall-Mount Folding Rack", 14999, 19999, 25, "Space-saving wall-mounted folding squat rack.", False, True, False, "NEW ARRIVAL"),
        ("Modular Gym Rig 3x3", 74999, 99999, 25, "Customizable 3x3 modular gym rig system.", False, False, False, ""),
        ("Squat Stand", 8999, 11999, 25, "Compact squat stand with J-cups.", True, False, False, "DEAL"),
        ("Commercial Power Rack T-3", 59999, 74999, 20, "11-gauge steel commercial power rack.", False, False, False, "PRO"),
        ("Combo Rack (Squat + Bench)", 44999, 59999, 25, "Versatile combo rack for squat and bench press.", False, True, False, "NEW ARRIVAL"),
        ("Mono-Lift Attachment", 6999, 8999, 22, "Competition mono-lift attachment for power racks.", False, False, False, ""),
        ("Safety Spotter Arms (Pair)", 3999, 5499, 27, "Safety spotter arms for half racks.", False, False, False, "POPULAR"),
        ("J-Cups (Pair) UHMW", 1999, 2999, 33, "Premium J-cups with UHMW lining.", False, False, False, ""),
        ("Band Pegs (Pair)", 999, 1499, 33, "Resistance band pegs for racks.", False, False, False, ""),
        ("Plate Storage Pegs (Pair)", 1499, 2199, 32, "Weight plate storage pegs for racks.", False, False, False, ""),
        ("Dip Station Attachment", 4999, 6999, 29, "Heavy-duty dip attachment for power racks.", False, False, True, "POPULAR"),
        ("Pull-Up Bar Multi-Grip", 3499, 4999, 30, "Multi-grip pull-up bar attachment.", False, False, False, ""),
        ("Landmine Attachment", 2499, 3499, 29, "T-bar row landmine attachment for racks.", False, False, False, ""),
        ("Westside Hole Spacing Rack", 44999, 59999, 25, "Westside-style 1-inch hole spacing power rack.", False, False, False, "PREMIUM"),
        ("Deadlift Platform 6x8", 24999, 32999, 24, "Commercial deadlift platform with rubber and wood.", True, False, False, "DEAL"),
        ("Yoke / Farmer's Walk Frame", 19999, 27999, 29, "Multi-purpose yoke for strongman training.", False, False, False, ""),
        ("Reverse Hyper Machine", 29999, 39999, 25, "Plate-loaded reverse hyper extension machine.", False, False, True, "PRO"),
        ("Glute Ham Developer (GHD)", 24999, 32999, 25, "Commercial GHD for posterior chain training.", False, False, False, ""),
        ("Belt Squat Machine", 49999, 64999, 23, "Plate-loaded belt squat machine.", False, False, True, "PRO"),
        ("Vertical Knee Raise / Dip Station", 7999, 10999, 27, "Wall-mounted VKR and dip station.", False, False, False, "POPULAR"),
        ("Power Rack Foot Plates", 2999, 3999, 25, "Anti-slip foot plates for racks.", False, False, False, ""),
        ("Rack Extension Kit", 9999, 13999, 29, "Extension kit to convert half rack to full rack.", False, False, False, ""),
        ("Cable Crossover Attachment", 14999, 19999, 25, "Cable crossover add-on for power racks.", False, False, False, ""),
        ("Lat Pulldown Attachment", 8999, 11999, 25, "Lat pulldown add-on for racks and rigs.", False, False, False, "POPULAR"),
        ("Low Row Attachment", 6999, 9999, 30, "Seated low row attachment for racks.", False, False, False, ""),
        ("Rack-Mounted Storage Shelf", 3499, 4999, 30, "Storage shelf for accessories on rack uprights.", False, False, False, ""),
        ("Competition Monolift", 34999, 44999, 22, "Competition-grade monolift attachment.", False, False, False, "PREMIUM"),
        ("Rogue-Style Monster Rack 6x6", 89999, 119999, 27, "Monster 6x6 inch steel gym rig.", False, False, True, "PRO"),
        ("Pulley System for Rack", 4999, 6999, 29, "Single pulley system for rack attachment.", False, False, False, ""),
        ("Weight Horns (4-Pack)", 2999, 3999, 25, "Weight storage horns for rack uprights.", False, False, False, ""),
        ("Rack-Mounted Barbell Holder", 1999, 2999, 33, "Vertical barbell holder for rack upright.", False, False, False, ""),
        ("Full Cage Rack with Chin-up", 54999, 69999, 22, "Full cage with built-in chin-up bar.", False, False, False, ""),
        ("Half Rack T-2 Series", 24999, 32999, 25, "T-2 series half rack for home gym.", True, True, False, "NEW ARRIVAL"),
        ("Wall-Mount Rig 4-foot", 12999, 17999, 29, "Compact 4-foot wall rig for small spaces.", False, True, False, "NEW ARRIVAL"),
    ]),

    # ═══════════════════════════════════════════════════════════════
    # DUMBBELLS (40 products)
    # ═══════════════════════════════════════════════════════════════
    ("Dumbbells", [
        ("Adjustable Dumbbell Pair 20kg", 8999, 10999, 18, "Space-saving adjustable dumbbell pair with multiple weight settings.", True, False, True, "HOT DEAL"),
        ("Rubber Hex Dumbbell 5kg (Pair)", 2499, 3499, 29, "Pair of rubber-coated hex dumbbells 5kg.", False, False, False, ""),
        ("Rubber Hex Dumbbell 10kg (Pair)", 3999, 5499, 27, "Pair of rubber-coated hex dumbbells 10kg.", False, False, False, "POPULAR"),
        ("Rubber Hex Dumbbell 15kg (Pair)", 5499, 7499, 27, "Pair of rubber-coated hex dumbbells 15kg.", False, False, False, ""),
        ("Rubber Hex Dumbbell 20kg (Pair)", 6999, 9499, 26, "Pair of rubber-coated hex dumbbells 20kg.", False, False, True, "BEST SELLER"),
        ("Rubber Hex Dumbbell 25kg (Pair)", 8499, 11999, 29, "Pair of rubber-coated hex dumbbells 25kg.", False, False, False, ""),
        ("Rubber Hex Dumbbell Set 2.5-20kg", 19999, 26999, 26, "Complete dumbbell set with rack 2.5-20kg.", True, False, False, "DEAL"),
        ("Neoprene Dumbbell 1kg (Pair)", 699, 999, 30, "Pair of neoprene-coated 1kg dumbbells.", False, False, False, ""),
        ("Neoprene Dumbbell 2kg (Pair)", 899, 1299, 31, "Pair of neoprene-coated 2kg dumbbells.", False, False, False, ""),
        ("Neoprene Dumbbell 3kg (Pair)", 1099, 1599, 31, "Pair of neoprene-coated 3kg dumbbells.", False, False, False, ""),
        ("Neoprene Dumbbell Set 1-5kg", 3499, 4999, 30, "Complete neoprene dumbbell set 1-5kg.", False, False, True, "POPULAR"),
        ("Chrome Dumbbell Set 1-10kg", 8999, 11999, 25, "Premium chrome dumbbell set with stand.", False, False, False, "PREMIUM"),
        ("Adjustable Dumbbell 32.5kg (Single)", 7999, 10999, 27, "Single adjustable dumbbell up to 32.5kg.", True, False, False, ""),
        ("Bowflex SelectTech 552", 24999, 32999, 24, "Premium adjustable dumbbells 2-24kg each.", False, False, True, "BEST SELLER"),
        ("Urethane Dumbbell Set 2-20kg", 29999, 39999, 25, "Premium urethane dumbbell set with rack.", False, False, False, "PRO"),
        ("Cast Iron Dumbbell 10kg (Pair)", 2999, 4499, 33, "Pair of classic cast iron 10kg dumbbells.", False, False, False, ""),
        ("Cast Iron Dumbbell 15kg (Pair)", 4499, 6499, 31, "Pair of classic cast iron 15kg dumbbells.", False, False, False, ""),
        ("Adjustable Dumbbell Set 2-32kg", 14999, 19999, 25, "Adjustable dumbbell pair 2-32kg.", True, False, True, "DEAL"),
        ("Dumbbell Rack 3-Tier", 5999, 8499, 30, "3-tier A-frame dumbbell storage rack.", False, False, True, "POPULAR"),
        ("Dumbbell Rack 5-Tier", 9999, 13999, 29, "5-tier horizontal dumbbell rack.", False, False, False, ""),
        ("Spin-Lock Dumbbell Handles (Pair)", 1999, 2999, 33, "Adjustable spin-lock dumbbell handles.", False, False, False, ""),
        ("Dumbbell Grips (Pair) Ergonomic", 799, 1199, 33, "Ergonomic rubber grips for dumbbell handles.", False, False, False, ""),
        ("Kettlebell-Style Dumbbell 8kg", 2499, 3499, 29, "Unique kettlebell-dumbbell hybrid 8kg.", False, True, False, "NEW ARRIVAL"),
        ("Competition Dumbbell 22.5kg", 3499, 4999, 30, "Competition-spec fixed-weight dumbbell.", False, False, False, ""),
        ("Resistance Band Dumbbell Set", 1299, 1999, 35, "Dumbbell-shaped handles for resistance bands.", False, False, False, ""),
        ("Adjustable Dumbbell Pair 25kg", 11999, 15999, 25, "Adjustable dumbbell pair up to 25kg each.", True, False, False, ""),
        ("Hex Dumbbell Set 5-30kg Rack", 39999, 54999, 27, "Complete hex dumbbell set 5-30kg with rack.", False, False, True, "PRO"),
        ("Dumbbell Cleaning Spray", 299, 499, 40, "Cleaning spray for dumbbell maintenance.", False, False, False, ""),
        ("Neoprene Dumbbell 4kg (Pair)", 1299, 1799, 28, "Pair of neoprene-coated 4kg dumbbells.", False, False, False, ""),
        ("Neoprene Dumbbell 5kg (Pair)", 1499, 2199, 33, "Pair of neoprene-coated 5kg dumbbells.", False, False, False, ""),
        ("Rubber Hex Dumbbell 7.5kg (Pair)", 3299, 4499, 25, "Pair of rubber hex 7.5kg dumbbells.", False, False, False, ""),
        ("Rubber Hex Dumbbell 12.5kg (Pair)", 4799, 6499, 26, "Pair of rubber hex 12.5kg dumbbells.", False, False, False, ""),
        ("Rubber Hex Dumbbell 17.5kg (Pair)", 6299, 8499, 26, "Pair of rubber hex 17.5kg dumbbells.", False, False, False, ""),
        ("Rubber Hex Dumbbell 22.5kg (Pair)", 7999, 10999, 27, "Pair of rubber hex 22.5kg dumbbells.", False, False, False, ""),
        ("Neoprene Dumbbell Set 1-3kg", 2199, 2999, 27, "Light neoprene set for aerobics.", False, False, False, "VALUE"),
        ("Chrome Dumbbell 5kg (Pair)", 1999, 2999, 33, "Pair of chrome 5kg dumbbells.", False, False, False, ""),
        ("Chrome Dumbbell 10kg (Pair)", 3499, 4999, 30, "Pair of chrome 10kg dumbbells.", False, False, False, ""),
        ("Adjustable Dumbbell 12.5kg (Single)", 4999, 6999, 29, "Single adjustable dumbbell to 12.5kg.", False, True, False, "NEW ARRIVAL"),
        ("Dumbbell Storage Tray (Single)", 1299, 1999, 35, "Individual dumbbell storage tray.", False, False, False, ""),
        ("Adjustable Dumbbell Set 4-20kg", 12999, 16999, 24, "Adjustable dumbbell set 4-20kg pair.", True, False, True, "DEAL"),
    ]),

    # ═══════════════════════════════════════════════════════════════
    # KETTLEBELLS (30 products)
    # ═══════════════════════════════════════════════════════════════
    ("Kettlebells", [
        ("Cast Iron Kettlebell 4kg", 999, 1499, 33, "Lightweight cast iron kettlebell for beginners.", False, False, False, ""),
        ("Cast Iron Kettlebell 6kg", 1299, 1999, 35, "6kg cast iron kettlebell for HIIT and swings.", False, False, False, ""),
        ("Cast Iron Kettlebell 8kg", 1799, 2499, 28, "8kg cast iron kettlebell for functional training.", False, False, False, "POPULAR"),
        ("Cast Iron Kettlebell 12kg", 2499, 3499, 29, "12kg cast iron kettlebell for intermediate lifters.", False, False, True, "BEST SELLER"),
        ("Cast Iron Kettlebell 16kg", 3299, 4499, 27, "16kg cast iron kettlebell for swings and snatches.", True, False, False, ""),
        ("Cast Iron Kettlebell 20kg", 4499, 5999, 25, "20kg cast iron kettlebell for advanced training.", True, False, False, "DEAL"),
        ("Cast Iron Kettlebell 24kg", 5499, 7499, 27, "24kg competition-style kettlebell.", False, False, False, ""),
        ("Cast Iron Kettlebell 32kg", 7499, 9999, 25, "32kg heavy kettlebell for serious athletes.", False, False, False, "PRO"),
        ("Competition Kettlebell 16kg", 3999, 5499, 27, "Competition-spec kettlebell 16kg.", False, False, False, ""),
        ("Competition Kettlebell 24kg", 5999, 7999, 25, "Competition-spec kettlebell 24kg.", False, False, True, "PRO"),
        ("Competition Kettlebell 32kg", 7999, 10999, 27, "Competition-spec kettlebell 32kg.", False, False, False, "PRO"),
        ("Kettlebell Set 8-16kg", 5999, 8499, 29, "Kettlebell set with 8, 12, 16kg bells.", True, False, False, "DEAL"),
        ("Kettlebell Set 8-24kg", 12999, 17999, 28, "Complete kettlebell set 8-24kg.", False, False, True, "BEST SELLER"),
        ("Adjustable Kettlebell 12kg", 4999, 6999, 29, "Adjustable kettlebell up to 12kg.", False, True, False, "NEW ARRIVAL"),
        ("Adjustable Kettlebell 20kg", 7999, 10999, 27, "Adjustable kettlebell up to 20kg.", False, True, False, "NEW ARRIVAL"),
        ("Neoprene Kettlebell 4kg", 1199, 1699, 29, "Neoprene-coated 4kg kettlebell.", False, False, False, ""),
        ("Neoprene Kettlebell 6kg", 1499, 2199, 33, "Neoprene-coated 6kg kettlebell.", False, False, False, ""),
        ("Neoprene Kettlebell 8kg", 1999, 2799, 29, "Neoprene-coated 8kg kettlebell.", False, False, False, ""),
        ("Neoprene Kettlebell 10kg", 2499, 3499, 29, "Neoprene-coated 10kg kettlebell.", False, False, False, "POPULAR"),
        ("Kettlebell Rack 3-Tier", 6999, 9999, 30, "3-tier kettlebell storage rack.", False, False, False, ""),
        ("Kettlebell Cleaning Kit", 499, 799, 38, "Cleaning kit for kettlebell maintenance.", False, False, False, ""),
        ("Kettlebell Grip Trainer", 799, 1199, 33, "Grip training attachment for kettlebells.", False, False, False, ""),
        ("Kettlebell 2kg (Pair)", 899, 1299, 31, "Pair of ultra-light 2kg kettlebells.", False, False, False, ""),
        ("Kettlebell 14kg", 2999, 4199, 29, "14kg cast iron kettlebell.", False, False, False, ""),
        ("Kettlebell 28kg", 6499, 8999, 28, "28kg heavy kettlebell for advanced training.", False, False, False, ""),
        ("Kettlebell 36kg", 8999, 11999, 25, "36kg monster kettlebell.", False, False, False, "PRO"),
        ("Competition Kettlebell 20kg", 4999, 6999, 29, "Competition-spec kettlebell 20kg.", False, False, False, ""),
        ("Competition Kettlebell 28kg", 6999, 9999, 30, "Competition-spec kettlebell 28kg.", False, False, False, "PRO"),
        ("Kettlebell Handle for Loading Plates", 2999, 4499, 33, "Loadable kettlebell handle.", False, True, False, "NEW ARRIVAL"),
        ("Kettlebell Turkish Get-Up Pad", 599, 899, 33, "Wrist pad for Turkish get-ups.", False, False, False, ""),
    ]),

    # ═══════════════════════════════════════════════════════════════
    # BENCHES (30 products)
    # ═══════════════════════════════════════════════════════════════
    ("Benches", [
        ("Adjustable FID Bench", 14999, 17999, 17, "Flat incline decline adjustable bench for versatile strength workouts.", True, False, True, "BEST SELLER"),
        ("Flat Utility Bench", 6999, 8499, 18, "Strong and compact flat utility bench for home gyms.", False, False, False, "VALUE"),
        ("Adjustable Weight Bench Pro", 17999, 21999, 18, "Premium adjustable weight bench with multiple backrest positions.", False, False, False, "PRO"),
        ("Preacher Curl Bench", 8999, 10999, 18, "Dedicated preacher curl bench for focused biceps training.", False, False, False, "POPULAR"),
        ("Adjustable Bench 2000lb Rated", 12999, 16999, 25, "Heavy-duty bench rated 2000lbs for commercial use.", True, False, False, ""),
        ("Folding Flat Bench", 4999, 6999, 29, "Space-saving folding flat bench.", False, True, False, "NEW ARRIVAL"),
        ("Commercial Decline Bench", 14999, 19999, 25, "Commercial-grade decline bench with leg hold.", False, False, False, ""),
        ("Incline Bench", 7999, 10999, 27, "Adjustable incline bench for shoulder press.", False, False, True, "POPULAR"),
        ("Adjustable Bench 7-Position", 11999, 15999, 27, "7-position adjustable bench.", False, False, False, ""),
        ("Seated Military Press Bench", 8999, 11999, 25, "Dedicated seated overhead press bench.", False, False, False, ""),
        ("Hyper Extension Bench", 6999, 9499, 26, "45-degree hyperextension bench for lower back.", False, False, False, ""),
        ("GHD Glute Ham Developer", 24999, 32999, 25, "Full-size GHD for glute and hamstring development.", False, False, True, "PRO"),
        ("Weight Bench Leg Attachment", 2999, 4499, 33, "Leg extension/curl attachment for benches.", False, False, False, ""),
        ("Workout Bench with Rack", 14999, 19999, 25, "Bench with integrated squat rack.", True, False, True, "DEAL"),
        ("Compact Adjustable Bench", 6999, 9499, 26, "Space-saving compact adjustable bench.", False, True, False, "NEW ARRIVAL"),
        ("Ab Bench Sit-Up Board", 2499, 3499, 29, "Decline ab bench for core workouts.", False, False, False, ""),
        ("Utility Bench with Preacher Pad", 5999, 7999, 25, "Multi-function bench with preacher curl pad.", False, False, False, ""),
        ("Adjustable Bench Flat to 85°", 9999, 13999, 29, "Adjustable bench from flat to 85 degrees.", False, False, False, ""),
        ("Commercial Adjustable Bench T-6", 19999, 26999, 26, "T-6 commercial-grade adjustable bench.", False, False, False, "PRO"),
        ("FID Bench with Leg Developer", 16999, 22999, 27, "FID bench with integrated leg developer.", True, False, False, ""),
        ("Flat Bench 1000lb Capacity", 5499, 7499, 27, "Heavy-duty flat bench rated 1000lbs.", False, False, False, ""),
        ("Ab Coaster Bench", 3499, 4999, 30, "Ab coaster for lower ab training.", False, False, False, ""),
        ("Adjustable Bench 4-Position", 5999, 7999, 25, "4-position adjustable bench for home gym.", False, True, False, "NEW ARRIVAL"),
        ("Bench Pad Replacement", 1999, 2999, 33, "Replacement foam pad for workout benches.", False, False, False, ""),
        ("Roman Chair Bench", 7999, 10999, 27, "Roman chair for back extension exercises.", False, False, False, ""),
        ("Pec Deck Fly Machine", 19999, 26999, 26, "Seated pec deck fly machine.", False, False, True, ""),
        ("Flat Bench 36 inch", 4499, 5999, 25, "36-inch compact flat bench.", False, False, False, "VALUE"),
        ("Bench Press Station", 29999, 39999, 25, "Dedicated bench press station with safety.", False, False, True, "PRO"),
        ("Decline Sit-Up Bench", 3999, 5499, 27, "Decline bench for sit-ups and core.", False, False, False, ""),
        ("Folding Incline Bench", 7999, 10999, 27, "Foldable incline bench.", False, True, False, "NEW ARRIVAL"),
    ]),

    # ═══════════════════════════════════════════════════════════════
    # CARDIO (30 products)
    # ═══════════════════════════════════════════════════════════════
    ("Cardio", [
        ("Commercial Treadmill T-9", 89999, 109999, 18, "Commercial treadmill with powerful motor and large running deck.", True, False, True, "BEST SELLER"),
        ("Air Rowing Machine", 44999, 54999, 18, "Air resistance rowing machine for full-body cardiovascular workouts.", False, False, False, ""),
        ("Spin Bike Studio Edition", 32999, 39999, 18, "Studio-quality indoor cycling bike with adjustable resistance.", False, False, True, "POPULAR"),
        ("Commercial Elliptical Trainer", 74999, 89999, 17, "Low-impact elliptical trainer for commercial gym use.", False, False, False, "PRO"),
        ("Curved Manual Treadmill", 69999, 79999, 13, "Self-powered curved treadmill for sprint and HIIT training.", False, False, True, "PREMIUM"),
        ("Spin Bike Home Edition", 19999, 24999, 20, "Affordable indoor spin bike for home workouts.", True, False, False, "DEAL"),
        ("Recumbent Exercise Bike", 35999, 42999, 16, "Comfortable recumbent bike for low-impact cardio.", False, False, False, "COMFORT"),
        ("Stair Climber Step Machine", 59999, 69999, 14, "Professional stair climbing machine for intense cardio.", False, False, False, "PRO"),
        ("Treadmill Home T-5", 39999, 49999, 20, "Home treadmill with foldable deck and digital display.", True, True, False, "NEW ARRIVAL"),
        ("Air Bike / Assault Bike", 14999, 19999, 25, "Air resistance exercise bike for HIIT workouts.", False, False, True, "BEST SELLER"),
        ("Magnetic Rower", 24999, 32999, 24, "Magnetic resistance rowing machine for quiet workouts.", False, False, False, ""),
        ("Vertical Climber Machine", 29999, 37999, 24, "Vertical climber for full-body cardio workout.", False, False, False, ""),
        ("Mini Stepper with Bands", 2999, 4499, 33, "Compact mini stepper with resistance bands.", False, False, False, "VALUE"),
        ("Jump Rope Speed Cable", 599, 899, 33, "Speed jump rope with ball bearings.", False, False, False, ""),
        ("Resistance Band Set (5-Pack)", 1499, 2199, 33, "5-piece resistance band set for cardio and strength.", False, False, True, "POPULAR"),
        ("Skipping Rope with Counter", 799, 999, 20, "Speed skipping rope with digital counter for cardio.", True, False, False, "DEAL"),
        ("Treadmill Desk Converter", 49999, 64999, 23, "Walking treadmill desk for office workouts.", False, True, False, "NEW ARRIVAL"),
        ("Commercial Bike C-2", 29999, 37999, 21, "Commercial-grade upright exercise bike.", False, False, False, ""),
        ("Under Desk Elliptical", 12999, 16999, 24, "Compact elliptical for under-desk use.", False, True, False, "NEW ARRIVAL"),
        ("Rower Water Resistance", 49999, 59999, 17, "Water resistance rowing machine.", False, False, True, "PREMIUM"),
        ("Climbing Machine Vertical", 34999, 44999, 22, "Vertical climbing machine for HIIT.", False, False, False, ""),
        ("Treadmill Belt Lubricant 1L", 499, 799, 38, "Premium treadmill belt lubricant.", False, False, False, ""),
        ("Cycling Shoes Compatible", 3499, 4999, 30, "Indoor cycling shoes compatible with SPD cleats.", False, False, False, ""),
        ("Spin Bike Seat Cushion", 799, 1199, 33, "Comfortable replacement seat cushion for spin bikes.", False, False, False, ""),
        ("Rowing Machine Floor Mat", 1999, 2999, 33, "Floor protection mat for rowing machines.", False, False, False, ""),
        ("Treadmill Mat 6x3", 2999, 4499, 33, "Large treadmill floor protection mat.", False, False, False, ""),
        ("Heart Rate Monitor Chest Strap", 2499, 3499, 29, "Wireless chest strap heart rate monitor.", False, False, True, "POPULAR"),
        ("Speed Jump Rope 3M", 399, 599, 33, "Adjustable speed jump rope 3 meters.", False, False, False, ""),
        ("Heavy Jump Rope 1.5kg", 899, 1299, 25, "Weighted heavy rope for conditioning.", False, False, False, ""),
        ("Treadmill Running Shoes Pro", 4999, 6999, 29, "Running shoes designed for treadmill use.", False, True, False, "NEW ARRIVAL"),
    ]),

    # ═══════════════════════════════════════════════════════════════
    # MACHINES (20 products)
    # ═══════════════════════════════════════════════════════════════
    ("Machines", [
        ("Cable Crossover Machine", 79999, 99999, 20, "Full-size dual adjustable cable crossover.", False, False, True, "PRO"),
        ("Leg Press Machine", 49999, 64999, 23, "Plate-loaded 45-degree leg press machine.", False, False, True, "BEST SELLER"),
        ("Leg Extension / Curl Machine", 24999, 32999, 24, "Seated leg extension and curl combo machine.", False, False, False, ""),
        ("Lat Pulldown Machine", 29999, 39999, 25, "Plate-loaded lat pulldown machine.", False, False, False, ""),
        ("Seated Cable Row Machine", 24999, 32999, 25, "Plate-loaded seated cable row.", False, False, False, ""),
        ("Smith Machine Commercial", 89999, 119999, 25, "Commercial smith machine with linear bearings.", False, False, True, "PRO"),
        ("Leg Hack Squat Machine", 54999, 69999, 21, "Plate-loaded hack squat machine.", False, False, False, "PRO"),
        ("Chest Press Machine", 34999, 44999, 22, "Lever chest press machine for gym.", False, False, False, ""),
        ("Shoulder Press Machine", 34999, 44999, 22, "Seated shoulder press machine.", False, False, False, ""),
        ("Pec Deck Machine", 19999, 26999, 26, "Standing pec deck / butterfly machine.", False, False, False, ""),
        ("Seated Row Machine", 29999, 37999, 21, "Lever seated row machine.", False, False, False, ""),
        ("Calf Raise Machine", 19999, 24999, 20, "Standing calf raise machine.", False, False, False, ""),
        ("Multi-Gym Station", 69999, 89999, 22, "All-in-one multi-gym station.", False, False, True, "BEST SELLER"),
        ("Functional Trainer Dual Pulley", 54999, 69999, 21, "Dual adjustable pulley functional trainer.", True, False, False, ""),
        ("Lat Pulldown Wide Grip Bar", 2999, 4499, 33, "Wide grip lat pulldown bar attachment.", False, False, False, ""),
        ("Cable Handle Set (6-Piece)", 3499, 4999, 30, "6-piece cable attachment handle set.", False, False, True, "POPULAR"),
        ("Tricep Rope Attachment", 999, 1499, 33, "Nylon tricep rope for cable machines.", False, False, False, ""),
        ("V-Bar Cable Attachment", 799, 1199, 33, "V-bar for close grip cable exercises.", False, False, False, ""),
        ("Straight Bar Cable Attachment", 899, 1299, 30, "Straight bar for cable exercises.", False, False, False, ""),
        ("Machine Maintenance Kit", 1999, 2999, 33, "Complete maintenance kit for gym machines.", False, False, False, ""),
    ]),

    # ═══════════════════════════════════════════════════════════════
    # ACCESSORIES (40 products)
    # ═══════════════════════════════════════════════════════════════
    ("Accessories", [
        ("Premium Cotton Wrist Wraps", 150, 200, 25, "Premium cotton wrist wraps for additional wrist support.", True, False, False, "DEAL"),
        ("Resistance Band Set - 5 Levels", 1499, 1999, 25, "Five resistance levels for strength and mobility workouts.", False, False, True, "BEST SELLER"),
        ("Olympic Weightlifting Platform", 34999, 39999, 13, "Heavy-duty platform for Olympic weightlifting.", False, False, False, "PRO"),
        ("Skipping Rope with Counter", 799, 999, 20, "Speed skipping rope with digital counter.", True, False, False, "DEAL"),
        ("Push-Up Board Training System", 1299, 1799, 28, "Multi-position push-up board for targeted training.", False, False, False, "POPULAR"),
        ("Ab Roller Wheel with Knee Pad", 899, 1299, 31, "Ab roller with comfortable knee pad for core training.", True, False, False, "DEAL"),
        ("Pull-Up Bar Doorway Mount", 1999, 2499, 20, "Strong doorway-mounted pull-up bar.", False, False, False, "HOME GYM"),
        ("Weightlifting Belt Leather 10mm", 2499, 3499, 29, "10mm thick leather powerlifting belt.", True, False, True, "BEST SELLER"),
        ("Knee Sleeves 7mm (Pair)", 1999, 2999, 33, "7mm neoprene knee sleeves for squat support.", False, False, True, "POPULAR"),
        ("Lifting Straps (Pair)", 599, 899, 33, "Cotton lifting straps for deadlifts.", False, False, False, ""),
        ("Foam Roller 18 inch", 999, 1499, 33, "High-density foam roller for muscle recovery.", False, False, True, "POPULAR"),
        ("Massage Gun Mini", 4999, 6999, 29, "Portable mini massage gun for muscle recovery.", True, True, False, "NEW ARRIVAL"),
        ("Gym Gloves Full Finger", 699, 999, 30, "Full finger gym gloves for grip and protection.", False, False, False, ""),
        ("Gym Gloves Half Finger", 499, 799, 38, "Half finger gym gloves for training.", False, False, False, ""),
        ("Ankle Straps for Cables (Pair)", 799, 1199, 33, "Padded ankle straps for cable kickbacks.", False, False, False, ""),
        ("Jump Rope Speed", 399, 599, 33, "Speed jump rope with ball bearings.", False, False, False, ""),
        ("Resistance Band Door Anchor", 299, 499, 40, "Door anchor for resistance band workouts.", False, False, False, ""),
        ("Lacrosse Ball for Trigger Points (2-Pack)", 399, 599, 33, "Lacrosse balls for myofascial release.", False, False, False, ""),
        ("Grip Strengthener Adjustable", 699, 999, 30, "Adjustable hand grip strengthener.", False, False, False, ""),
        ("Barbell Grip Gloves", 899, 1299, 33, "Specialized gloves for barbell grip.", False, False, False, ""),
        ("Gym Towel Microfibre 40x80cm", 499, 699, 29, "Absorbent microfibre gym towel.", False, False, False, ""),
        ("Water Bottle 1L Shaker", 399, 599, 33, "BPA-free shaker bottle 1L.", False, False, False, ""),
        ("Pre Workout Shaker 700ml", 599, 899, 33, "Shaker with mixing ball for pre-workout.", False, False, True, "POPULAR"),
        ("Exercise Ball 65cm", 999, 1499, 33, "Anti-burst exercise ball for core and stability.", False, False, False, ""),
        ("Battle Rope 10m 38mm", 4999, 6999, 29, "10-meter battle rope for conditioning.", False, False, False, ""),
        ("Battle Rope 12m 50mm", 6999, 9499, 26, "12-meter heavy battle rope.", False, False, False, "PRO"),
        ("Plyometric Box Set (3-Pack)", 9999, 13999, 29, "3-piece foam plyo box set.", False, True, False, "NEW ARRIVAL"),
        ("Medicine Ball 3kg", 1499, 2199, 33, "3kg rubber medicine ball.", False, False, False, ""),
        ("Medicine Ball 5kg", 1999, 2999, 33, "5kg rubber medicine ball.", False, False, False, ""),
        ("Medicine Ball 8kg", 2999, 3999, 25, "8kg rubber medicine ball.", False, False, False, ""),
        ("Medicine Ball 10kg", 3499, 4999, 30, "10kg slam ball for power training.", False, False, False, ""),
        ("Slam Ball 6kg", 2499, 3499, 29, "Non-bounce slam ball 6kg.", False, False, False, ""),
        ("Slam Ball 10kg", 3499, 4999, 30, "Non-bounce slam ball 10kg.", False, False, False, ""),
        ("Wall Ball 6kg", 2499, 3499, 29, "Soft wall ball 6kg for wall ball shots.", False, False, False, ""),
        ("Wall Ball 9kg", 2999, 4499, 33, "Soft wall ball 9kg.", False, False, False, ""),
        ("Wall Ball 12kg", 3999, 5499, 27, "Soft wall ball 12kg.", False, False, False, ""),
        ("Speed Ladder Agility 4m", 699, 999, 30, "Agility speed ladder for footwork drills.", False, False, False, ""),
        ("Cones Set (50 Pieces)", 599, 899, 33, "50-piece cone set for agility training.", False, False, False, ""),
        ("Hand Grip Ball Squishy (2-Pack)", 399, 599, 33, "Squishy grip balls for hand strength.", False, False, False, ""),
        ("Resistance Band Door Anchor Pro", 499, 799, 38, "Heavy-duty door anchor for resistance bands.", False, False, False, ""),
    ]),

    # ═══════════════════════════════════════════════════════════════
    # CLOTHING (60 products)
    # ═══════════════════════════════════════════════════════════════
    ("Clothing", [
        # T-Shirts
        ("Men's Gym Training Tee - Black", 799, 1199, 33, "Breathable cotton-blend training t-shirt.", False, False, True, "BEST SELLER"),
        ("Men's Gym Training Tee - Navy", 799, 1199, 33, "Breathable cotton-blend training t-shirt.", False, False, False, ""),
        ("Men's Gym Training Tee - Grey", 799, 1199, 33, "Breathable cotton-blend training t-shirt.", False, False, False, ""),
        ("Men's Performance Polo - Black", 999, 1499, 33, "Moisture-wicking performance polo shirt.", False, False, False, ""),
        ("Men's Sleeveless Tank Top", 599, 899, 33, "Sleeveless tank for maximum range of motion.", True, False, False, "DEAL"),
        ("Men's Stringer Vest - White", 499, 799, 37, "Classic stringer vest for bodybuilding.", False, False, False, ""),
        ("Men's Stringer Vest - Black", 499, 799, 37, "Classic stringer vest for bodybuilding.", False, False, False, ""),
        ("Men's Graphic Print Tee - Iron", 899, 1299, 31, "Motivational graphic print training tee.", False, True, False, "NEW ARRIVAL"),
        ("Men's Graphic Print Tee - Beast", 899, 1299, 31, "Beast mode graphic print tee.", False, True, False, "NEW ARRIVAL"),
        ("Men's Compression Shirt - Black", 1299, 1799, 28, "Compression base layer for muscle support.", False, False, True, "POPULAR"),
        ("Men's Dry-Fit Training Shirt", 999, 1499, 33, "Quick-dry performance training shirt.", False, False, False, ""),
        ("Men's Oversized Gym Hoodie - Grey", 1799, 2499, 28, "Oversized cotton-blend gym hoodie.", False, True, False, "NEW ARRIVAL"),
        ("Women's Gym Tank Top - Pink", 699, 999, 30, "Women's fitted training tank top.", False, False, False, ""),
        ("Women's Gym Tank Top - Black", 699, 999, 30, "Women's fitted training tank top.", False, False, False, ""),
        ("Women's Crop Training Tee", 899, 1299, 31, "Women's cropped training t-shirt.", False, True, False, "NEW ARRIVAL"),
        ("Women's Mesh Insert Tank", 799, 1199, 33, "Breathable mesh-insert training tank.", False, False, True, "POPULAR"),

        # Shorts
        ("Men's Gym Shorts 7-inch - Black", 699, 999, 30, "7-inch gym shorts with pockets.", True, False, True, "BEST SELLER"),
        ("Men's Gym Shorts 7-inch - Navy", 699, 999, 30, "7-inch gym shorts with pockets.", False, False, False, ""),
        ("Men's Gym Shorts 5-inch - Grey", 599, 899, 33, "5-inch running and training shorts.", False, False, False, ""),
        ("Men's Compression Shorts - Black", 799, 1199, 33, "Compression under-shorts for training.", False, False, True, "POPULAR"),
        ("Men's Training Joggers - Black", 1499, 1999, 25, "Tapered training joggers with zip pockets.", True, False, False, ""),
        ("Men's Training Joggers - Grey", 1499, 1999, 25, "Tapered training joggers with zip pockets.", False, False, False, ""),
        ("Men's Shorts Elastic 9-inch", 599, 899, 33, "Elastic waist gym shorts 9-inch.", False, False, False, "VALUE"),
        ("Men's Board Shorts Swim-Gym", 799, 1199, 33, "Quick-dry board shorts for swim and gym.", False, True, False, "NEW ARRIVAL"),
        ("Women's Gym Shorts 5-inch - Black", 599, 899, 33, "Women's 5-inch training shorts.", False, False, False, ""),
        ("Women's Gym Shorts 5-inch - Pink", 599, 899, 33, "Women's 5-inch training shorts.", False, False, False, ""),
        ("Women's High-Waist Leggings - Black", 1299, 1799, 28, "High-waist compression leggings.", True, False, True, "BEST SELLER"),
        ("Women's High-Waist Leggings - Navy", 1299, 1799, 28, "High-waist compression leggings.", False, False, False, ""),
        ("Women's Yoga Pants - Grey", 1199, 1699, 30, "Flexible yoga pants for training.", False, False, False, ""),
        ("Women's Training Tights - Black", 999, 1499, 33, "Fitted training tights.", False, False, False, ""),

        # Hoodies & Jackets
        ("Men's Zip-Up Hoodie - Black", 1999, 2799, 29, "Full-zip training hoodie with pockets.", False, False, False, ""),
        ("Men's Pullover Hoodie - Grey", 1799, 2499, 28, "Heavy cotton pullover hoodie.", False, False, False, ""),
        ("Men's Track Jacket - Black", 1499, 1999, 25, "Lightweight track jacket for warm-ups.", False, False, True, "POPULAR"),
        ("Men's Training Jacket Pro", 2499, 3499, 29, "Windproof training jacket.", False, True, False, "NEW ARRIVAL"),
        ("Women's Cropped Hoodie - Pink", 1499, 2199, 33, "Cropped hoodie for training and casual wear.", False, True, False, "NEW ARRIVAL"),
        ("Women's Training Jacket - Black", 1799, 2499, 28, "Women's fitted training jacket.", False, False, False, ""),

        # Socks & Underwear
        ("Gym Training Socks 3-Pack", 499, 699, 29, "Cushioned training socks 3-pack.", False, False, True, "POPULAR"),
        ("Ankle Socks 5-Pack", 399, 599, 33, "Cotton ankle socks 5-pack.", False, False, False, "VALUE"),
        ("Compression Boxer Briefs (2-Pack)", 799, 1199, 33, "Moisture-wicking compression boxer briefs.", False, False, False, ""),

        # Headwear & Wrist
        ("Gym Headband - Black", 299, 499, 40, "Absorbent gym headband.", False, False, False, ""),
        ("Baseball Cap FitTrack Pro", 499, 799, 37, "Embroidered FitTrack Pro cap.", False, False, False, ""),
        ("Wrist Wraps Competition", 699, 999, 30, "Stiff competition wrist wraps.", False, False, False, ""),
        ("Wrist Wraps Comfort", 499, 799, 38, "Comfort wrist wraps for general training.", False, False, False, ""),
        ("Knee Wraps 72 inch (Pair)", 899, 1299, 33, "72-inch elastic knee wraps.", False, False, False, ""),
        ("Elbow Sleeves 5mm (Pair)", 1499, 2199, 33, "5mm neoprene elbow sleeves.", False, False, True, "POPULAR"),
        ("Shin Guards Lifting", 1199, 1699, 30, "Padded shin guards for deadlifts.", False, False, False, ""),
    ]),

    # ═══════════════════════════════════════════════════════════════
    # SUPPLEMENTS (60 products)
    # ═══════════════════════════════════════════════════════════════
    ("Supplements", [
        # Whey Protein
        ("Whey Protein Isolate 1kg - Chocolate", 2499, 3299, 24, "Premium whey protein isolate 27g per serving.", True, False, True, "BEST SELLER"),
        ("Whey Protein Isolate 1kg - Vanilla", 2499, 3299, 24, "Premium whey protein isolate 27g per serving.", False, False, False, ""),
        ("Whey Protein Isolate 1kg - Strawberry", 2499, 3299, 24, "Premium whey protein isolate 27g per serving.", False, False, False, ""),
        ("Whey Protein Concentrate 2kg - Chocolate", 2999, 3999, 25, "Whey protein concentrate 24g per serving.", True, False, False, "DEAL"),
        ("Whey Protein Concentrate 2kg - Vanilla", 2999, 3999, 25, "Whey protein concentrate 24g per serving.", False, False, False, ""),
        ("Mass Gainer 3kg - Chocolate", 2999, 3999, 25, "High-calorie mass gainer for bulking.", False, False, True, "POPULAR"),
        ("Mass Gainer 3kg - Vanilla", 2999, 3999, 25, "High-calorie mass gainer for bulking.", False, False, False, ""),
        ("Plant Protein 1kg - Chocolate", 2499, 3499, 29, "Vegan plant-based protein powder.", False, True, False, "NEW ARRIVAL"),
        ("Plant Protein 1kg - Vanilla", 2499, 3499, 29, "Vegan plant-based protein powder.", False, True, False, "NEW ARRIVAL"),
        ("Casein Protein 1kg - Chocolate", 2799, 3699, 24, "Slow-release casein protein for overnight.", False, False, False, ""),
        ("Whey Protein 5lb - Chocolate", 4499, 5999, 25, "Bulk whey protein 5lb tub.", True, False, False, ""),
        ("Whey Protein 5lb - Vanilla", 4499, 5999, 25, "Bulk whey protein 5lb tub.", False, False, False, ""),
        ("Hydrolyzed Whey 1kg - Unflavored", 3499, 4499, 22, "Fast-absorbing hydrolyzed whey protein.", False, False, False, "PRO"),

        # Pre-Workout
        ("Pre-Workout Boost - Blue Raspberry", 1499, 1999, 25, "High-energy pre-workout with caffeine and beta-alanine.", True, False, True, "BEST SELLER"),
        ("Pre-Workout Boost - Fruit Punch", 1499, 1999, 25, "High-energy pre-workout formula.", False, False, False, ""),
        ("Pre-Workout Zero Stim", 1299, 1799, 29, "Stimulant-free pre-workout pump formula.", False, True, False, "NEW ARRIVAL"),
        ("Pre-Workout Extreme - Green Apple", 1799, 2499, 29, "Extreme energy pre-workout for advanced athletes.", False, False, False, "PRO"),

        # BCAAs & Aminos
        ("BCAA Powder 250g - Lemon", 999, 1399, 29, "Branched-chain amino acids for recovery.", False, False, True, "POPULAR"),
        ("BCAA Powder 250g - Watermelon", 999, 1399, 29, "Branched-chain amino acids for recovery.", False, False, False, ""),
        ("EAAs Complete 300g - Tropical", 1499, 1999, 25, "Essential amino acids for muscle building.", False, True, False, "NEW ARRIVAL"),

        # Creatine
        ("Creatine Monohydrate 300g", 899, 1299, 31, "Micronized creatine monohydrate 5g per serving.", True, False, True, "BEST SELLER"),
        ("Creatine Monohydrate 500g", 1299, 1799, 29, "Bulk creatine monohydrate.", False, False, False, ""),
        ("Creatine HCL 90 Capsules", 1499, 1999, 25, "Creatine HCL capsules for zero bloating.", False, True, False, "NEW ARRIVAL"),

        # Fat Burners
        ("Fat Burner 60 Capsules", 1299, 1799, 29, "Thermogenic fat burner for weight management.", False, False, False, ""),
        ("L-Carnitine 60 Capsules", 999, 1399, 29, "L-Carnitine for fat metabolism.", False, False, False, ""),
        ("CLA 90 Softgels", 1199, 1699, 30, "Conjugated linoleic acid for body composition.", False, False, False, ""),

        # Vitamins & Minerals
        ("Multivitamin for Men - 60 Tablets", 799, 1199, 33, "Complete multivitamin for active men.", False, False, True, "POPULAR"),
        ("Multivitamin for Women - 60 Tablets", 799, 1199, 33, "Complete multivitamin for active women.", False, False, False, ""),
        ("Vitamin D3 60 Capsules", 499, 699, 29, "Vitamin D3 2000 IU for bone health.", False, False, False, ""),
        ("Omega-3 Fish Oil 90 Capsules", 699, 999, 30, "Fish oil with EPA and DHA.", False, False, False, "POPULAR"),
        ("Zinc + Magnesium 60 Tablets", 599, 899, 33, "ZMA formula for recovery and sleep.", False, False, False, ""),
        ("Iron Supplement 60 Tablets", 399, 599, 33, "Iron supplement for active individuals.", False, False, False, ""),
        ("Calcium + Vitamin D 60 Tablets", 499, 699, 29, "Calcium with D3 for bone strength.", False, False, False, ""),

        # Glutamine
        ("L-Glutamine 300g - Unflavored", 899, 1299, 31, "L-Glutamine for muscle recovery.", False, False, False, ""),

        # Testosterone Support
        ("Testosterone Booster 90 Capsules", 1499, 1999, 25, "Natural testosterone support formula.", False, False, False, "PRO"),

        # Joint Support
        ("Joint Support 120 Capsules", 1299, 1799, 29, "Glucosamine, chondroitin, and MSM for joints.", False, False, False, "POPULAR"),
        ("Collagen Peptides 300g", 1199, 1699, 30, "Hydrolyzed collagen for joints and skin.", False, True, False, "NEW ARRIVAL"),

        # Electrolytes
        ("Electrolyte Powder 30 Servings", 699, 999, 30, "Hydration and electrolyte replenishment.", False, False, False, ""),
        ("Electrolyte Tablets 20 Pack", 399, 599, 33, "Effervescent electrolyte tablets.", False, False, False, ""),

        # Other
        ("HMB 90 Capsules", 1499, 1999, 25, "HMB for muscle preservation during cutting.", False, False, False, "PRO"),
        ("Betaine Anhydrous 250g", 799, 1199, 33, "Betaine for power and endurance.", False, False, False, ""),
        ("Ashwagandha KSM-66 60 Capsules", 899, 1299, 31, "KSM-66 ashwagandha for stress and recovery.", False, True, False, "NEW ARRIVAL"),
        ("Shilajit Resin 20g", 1299, 1799, 29, "Pure Himalayan shilajit resin.", False, True, False, "NEW ARRIVAL"),
        ("Protein Bar (Pack of 12)", 1799, 2399, 25, "High-protein snack bars, chocolate flavor.", False, False, True, "POPULAR"),
        ("Protein Bar (Pack of 12) - Peanut", 1799, 2399, 25, "High-protein snack bars, peanut flavor.", False, False, False, ""),
        ("BCAA Energy Drink 24 Can Pack", 2399, 2999, 20, "Ready-to-drink BCAA energy beverages.", False, True, False, "NEW ARRIVAL"),
    ]),

    # ═══════════════════════════════════════════════════════════════
    # WEIGHTS (20 products)
    # ═══════════════════════════════════════════════════════════════
    ("Weights", [
        ("Olympic Barbell Set 120kg", 29999, 39999, 25, "Complete Olympic barbell set 120kg.", True, False, True, "BEST SELLER"),
        ("Home Gym Weight Set 50kg", 11999, 15999, 25, "Complete home gym weight set 50kg.", True, False, False, "DEAL"),
        ("Standard Weight Set 40kg", 7999, 10999, 27, "Standard barbell weight set 40kg.", False, False, False, ""),
        ("Plate-Loaded Leg Press Plates 100kg", 14999, 19999, 25, "Additional 100kg plate set.", False, False, False, ""),
        ("Weight Stack 100kg", 24999, 32999, 24, "100kg selectorized weight stack.", False, False, True, "PRO"),
        ("Pin-Loaded Weight Stack 150kg", 34999, 44999, 22, "150kg weight stack for cable machines.", False, False, False, "PRO"),
        ("Micro Plate Set 0.25-1kg", 999, 1499, 33, "Micro loading plates for precision.", False, False, False, ""),
        ("Rubber Coated Weight Set 80kg", 19999, 26999, 27, "80kg rubber-coated weight plate set.", False, False, False, ""),
        ("Bumper Plate Starter Set 70kg", 17999, 24999, 29, "Starter bumper plate set 70kg.", False, True, False, "NEW ARRIVAL"),
        ("Cast Iron Weight Set 100kg", 22999, 29999, 23, "100kg cast iron plate set.", False, False, False, ""),
        ("Fractional Plates Set 0.5-2.5kg", 1299, 1999, 35, "Micro fractional plate set.", False, False, False, ""),
        ("Weight Plate Storage Tree", 4999, 6999, 29, "Plate tree for weight storage.", False, False, False, "POPULAR"),
        ("Weight Plate Storage Rack Horizontal", 7999, 10999, 27, "Horizontal plate storage rack.", False, False, False, ""),
        ("Olympic Plate Set 60kg", 14999, 19999, 25, "60kg Olympic plate set.", False, False, False, ""),
        ("Bumper Plate Training Set 160kg", 34999, 44999, 22, "160kg training bumper plate set.", False, False, True, "PRO"),
        ("Weight Plate Hanger (4-Pack)", 1999, 2999, 33, "Plate hangers for wall storage.", False, False, False, ""),
        ("Adjustable Weight Vest 10kg", 5999, 7999, 25, "Adjustable weighted vest up to 10kg.", False, True, False, "NEW ARRIVAL"),
        ("Adjustable Weight Vest 20kg", 8999, 11999, 25, "Adjustable weighted vest up to 20kg.", False, False, False, ""),
        ("Sandbag Weight 20kg", 3999, 5499, 27, "Fillable sandbag for functional training.", False, False, False, ""),
        ("Sandbag Weight 40kg", 5999, 7999, 25, "Heavy fillable sandbag 40kg.", False, False, False, ""),
    ]),

    # ═══════════════════════════════════════════════════════════════
    # YOGA & FITNESS (25 products)
    # ═══════════════════════════════════════════════════════════════
    ("Yoga & Fitness", [
        ("Premium Yoga Mat 6mm - Black", 999, 1499, 33, "Non-slip premium yoga mat 6mm thick.", True, False, True, "BEST SELLER"),
        ("Premium Yoga Mat 6mm - Purple", 999, 1499, 33, "Non-slip premium yoga mat 6mm thick.", False, False, False, ""),
        ("Premium Yoga Mat 6mm - Blue", 999, 1499, 33, "Non-slip premium yoga mat 6mm thick.", False, False, False, ""),
        ("Extra Thick Yoga Mat 10mm", 1499, 1999, 25, "10mm thick yoga mat for joint comfort.", False, False, False, ""),
        ("Cork Yoga Mat Premium", 1999, 2799, 29, "Eco-friendly cork surface yoga mat.", False, True, False, "NEW ARRIVAL"),
        ("Yoga Block Set (2-Pack)", 599, 899, 33, "EVA foam yoga blocks 2-pack.", False, False, True, "POPULAR"),
        ("Yoga Strap 2.4m", 399, 599, 33, "Cotton yoga strap for stretching.", False, False, False, ""),
        ("Yoga Wheel 13 inch", 999, 1499, 33, "Yoga wheel for backbends and flexibility.", False, False, False, ""),
        ("Resistance Band Set Yoga", 799, 1199, 33, "Resistance bands for yoga and pilates.", False, False, False, ""),
        ("Balance Board Wooden", 1999, 2799, 29, "Wooden balance board for stability.", False, False, False, ""),
        ("Foam Roller 36 inch", 1499, 2199, 33, "Extra-long foam roller for deep tissue.", False, False, True, "POPULAR"),
        ("Massage Ball Set (3-Pack)", 699, 999, 30, "Set of 3 massage balls for trigger points.", False, False, False, ""),
        ("Pilates Ring 14 inch", 699, 999, 30, "Pilates magic circle ring.", False, False, False, ""),
        ("Yoga Mat Bag Carrier", 599, 899, 33, "Cotton yoga mat carrying bag.", False, False, False, ""),
        ("Yoga Mat Towel Non-Slip", 799, 1199, 33, "Microfibre non-slip yoga towel.", False, False, False, ""),
        ("Resistance Band Door Anchor Set", 499, 699, 29, "3-piece door anchor resistance set.", False, False, False, ""),
        ("Stretch Strap 10-Loop", 499, 699, 29, "10-loop stretch strap for flexibility.", False, False, False, ""),
        ("Exercise Ball 55cm", 899, 1299, 33, "Anti-burst exercise ball 55cm.", False, False, False, ""),
        ("Exercise Ball 75cm", 999, 1499, 33, "Anti-burst exercise ball 75cm.", False, False, False, ""),
        ("Balance Disc Wobble Cushion", 799, 1199, 33, "Inflation disc for balance training.", False, False, False, ""),
        ("Yoga Mat Extra Wide 80cm", 1299, 1799, 29, "Extra-wide yoga mat 80cm.", False, True, False, "NEW ARRIVAL"),
        ("Yoga Bolster Rectangle", 1299, 1799, 29, "Cotton yoga bolster for restorative poses.", False, False, False, ""),
        ("Yoga Mat Cleaner Spray 200ml", 299, 499, 40, "Natural yoga mat cleaning spray.", False, False, False, ""),
        ("Pilates Ball 25cm Mini", 499, 699, 29, "Mini Pilates ball for core work.", False, False, False, ""),
        ("Yoga Socks Grip (2-Pack)", 599, 899, 33, "Non-slip grip yoga socks.", False, False, False, ""),
    ]),

    # ═══════════════════════════════════════════════════════════════
    # FUNCTIONAL TRAINING (20 products)
    # ═══════════════════════════════════════════════════════════════
    ("Functional Training", [
        ("TRX Suspension Trainer", 4999, 6999, 29, "Premium suspension training system.", True, False, True, "BEST SELLER"),
        ("Battle Rope 10m", 4999, 6999, 29, "10-meter battle rope for conditioning.", False, False, False, ""),
        ("Battle Rope 15m", 6999, 9499, 26, "15-meter heavy battle rope.", False, False, False, "PRO"),
        ("Plyometric Box 20-inch", 3499, 4999, 30, "20-inch wooden plyo box.", False, False, False, ""),
        ("Plyometric Box 24-inch", 3999, 5499, 27, "24-inch wooden plyo box.", False, False, False, ""),
        ("Plyometric Box 30-inch", 4999, 6999, 29, "30-inch wooden plyo box.", False, False, False, ""),
        ("Speed Ladder Agility 6m", 899, 1299, 33, "6-meter agility speed ladder.", False, False, False, ""),
        ("Agility Cone Set (100 Pieces)", 999, 1499, 33, "100-piece agility cone set.", False, False, False, ""),
        ("Parallette Bars Pair", 2999, 3999, 25, "Heavy-duty parallette bars.", False, False, False, ""),
        ("Gymnastic Rings Wood (Pair)", 2499, 3499, 29, "Olympic gymnastic rings with straps.", False, False, True, "POPULAR"),
        ("Gymnastic Rings Plastic (Pair)", 1499, 2199, 33, "Lightweight plastic gymnastic rings.", False, False, False, ""),
        ("Indian Clubs 1kg (Pair)", 1299, 1999, 35, "Traditional Indian clubs for shoulder health.", False, True, False, "NEW ARRIVAL"),
        ("Mace Bell 8kg", 1999, 2999, 33, "Steel mace bell for functional training.", False, True, False, "NEW ARRIVAL"),
        ("Mace Bell 12kg", 2999, 3999, 25, "Heavy mace bell for advanced athletes.", False, False, False, ""),
        ("Steel Club 6kg", 1499, 2199, 33, "Steel club for rotational training.", False, False, False, ""),
        ("Sandbag Training 15kg", 3499, 4999, 30, "Training sandbag with handles.", False, False, False, ""),
        ("Weighted Vest 6kg", 3999, 5499, 27, "Compact 6kg weighted vest.", False, False, False, ""),
        ("Tire Flip Training Set", 4999, 6999, 29, "Gym tire for tire flip training.", False, False, False, ""),
        ("Sled Push/Pull Training", 7999, 10999, 27, "Plate-loaded push/pull sled.", False, False, True, "PRO"),
        ("Rope Climb 10m", 2999, 3999, 25, "10-meter climbing rope.", False, False, False, ""),
    ]),

    # ═══════════════════════════════════════════════════════════════
    # GYM FLOORING (15 products)
    # ═══════════════════════════════════════════════════════════════
    ("Gym Flooring", [
        ("Rubber Floor Tile 1x1m", 1299, 1799, 29, "Interlocking rubber floor tile 1x1 meter.", True, False, True, "BEST SELLER"),
        ("Rubber Floor Tile 1x1m (6-Pack)", 6999, 9499, 26, "6-pack rubber floor tiles.", False, False, False, "DEAL"),
        ("Rubber Roll Flooring 1.5m x 5m", 9999, 13999, 29, "Commercial rubber roll flooring.", False, False, False, ""),
        ("Rubber Roll Flooring 1.5m x 10m", 17999, 24999, 28, "10-meter rubber roll for full gym floor.", False, False, True, "PRO"),
        ("Turf Roll 1.5m x 5m", 12999, 17999, 29, "Artificial turf for sled and functional training.", False, False, False, ""),
        ("Turf Roll 2m x 10m", 29999, 39999, 25, "Full-size artificial turf roll.", False, False, False, "PRO"),
        ("Foam Floor Tile (6-Pack)", 2999, 3999, 25, "EVA foam interlocking tiles.", False, False, False, "HOME GYM"),
        ("Plyometric Platform Mat", 1999, 2799, 29, "Shock-absorbing plyo platform mat.", False, False, False, ""),
        ("Gym Floor Tape (10m)", 299, 499, 40, "Heavy-duty gym floor marking tape.", False, False, False, ""),
        ("Rubber Floor Cleaner 1L", 499, 699, 29, "Specialized rubber floor cleaning solution.", False, False, False, ""),
        ("Interlocking Rubber Tile 0.5m", 699, 999, 30, "Small interlocking rubber tile 0.5x0.5m.", False, False, False, ""),
        ("Anti-Fatigue Mat 1x0.6m", 1299, 1799, 29, "Anti-fatigue standing mat.", False, False, False, ""),
        ("Deadlift Platform Insert", 7999, 10999, 27, "Rubber insert for deadlift platform.", False, False, False, ""),
        ("Gym Wall Padding 1x2m", 4999, 6999, 29, "Wall padding for safety.", False, False, False, ""),
        ("Floor Transition Strip", 999, 1499, 33, "Floor transition strip for rubber flooring.", False, False, False, ""),
    ]),

    # ═══════════════════════════════════════════════════════════════
    # GYM PACKAGES (15 products)
    # ═══════════════════════════════════════════════════════════════
    ("Gym Packages", [
        ("Home Gym Starter Package", 49999, 69999, 29, "Rack + Bench + Barbell + Plates - Everything to start.", True, False, True, "BEST SELLER"),
        ("Home Gym Pro Package", 99999, 139999, 29, "Complete home gym with premium equipment.", True, False, False, "DEAL"),
        ("Commercial Gym Package Basic", 299999, 399999, 25, "20-piece basic commercial gym package.", False, False, True, "PRO"),
        ("Commercial Gym Package Premium", 599999, 799999, 25, "40-piece premium commercial gym package.", False, False, True, "PRO"),
        ("Small Space Home Gym Kit", 24999, 34999, 29, "Compact equipment for small spaces.", False, True, False, "NEW ARRIVAL"),
        ("Powerlifting Starter Kit", 39999, 54999, 27, "Rack + Deadlift Bar + Plates for powerlifting.", False, False, False, ""),
        ("CrossFit Box Package", 199999, 269999, 26, "Complete CrossFit box setup.", False, False, False, "PRO"),
        ("Apartment Gym Kit", 19999, 27999, 29, "Minimal apartment gym essentials.", False, True, False, "NEW ARRIVAL"),
        ("Beginner Fitness Package", 14999, 19999, 25, "Affordable beginner fitness bundle.", False, False, True, "VALUE"),
        ("Yoga & Fitness Starter", 5999, 7999, 25, "Mat + blocks + bands + roller starter set.", False, False, False, "HOME GYM"),
        ("Gym Reopening Package", 149999, 199999, 25, "Essential equipment for gym re-opening.", False, False, False, ""),
        ("Functional Training Kit", 14999, 19999, 25, "Battle rope + bands + kettlebell kit.", False, False, False, "POPULAR"),
        ("Rehabilitation Gym Setup", 49999, 64999, 23, "Light equipment for physiotherapy clinics.", False, False, False, ""),
        ("Corporate Gym Package", 399999, 549999, 27, "Complete corporate wellness gym setup.", False, False, False, "PRO"),
        ("School Gym Package", 249999, 329999, 25, "School gym equipment package.", False, False, False, ""),
    ]),

    # ═══════════════════════════════════════════════════════════════
    # STORAGE (15 products)
    # ═══════════════════════════════════════════════════════════════
    ("Storage", [
        ("Dumbbell Rack 3-Tier", 5999, 8499, 30, "3-tier A-frame dumbbell rack.", True, False, True, "BEST SELLER"),
        ("Dumbbell Rack 5-Tier", 9999, 13999, 29, "5-tier horizontal dumbbell rack.", False, False, False, ""),
        ("Plate Tree Vertical", 4999, 6999, 29, "Vertical plate storage tree.", False, False, False, "POPULAR"),
        ("Barbell Holder Wall Mount", 1999, 2999, 33, "Wall-mounted horizontal barbell holder.", False, False, False, ""),
        ("Barbell Holder Floor Stand", 1499, 2199, 33, "Floor-standing barbell holder.", False, False, False, ""),
        ("Kettlebell Rack 3-Tier", 6999, 9999, 30, "3-tier kettlebell rack.", False, False, False, ""),
        ("Cable Attachment Holder Wall", 2999, 4499, 33, "Wall-mounted cable attachment holder.", False, False, False, ""),
        ("Weight Plate Rack Horizontal", 7999, 10999, 27, "Horizontal weight plate storage rack.", False, False, False, ""),
        ("Storage Shelf Gym Wall", 3499, 4999, 30, "Wall-mounted gym storage shelf.", False, False, False, ""),
        ("Accessory Storage Cart", 4999, 6999, 29, "Rolling storage cart for gym accessories.", False, True, False, "NEW ARRIVAL"),
        ("Medicine Ball Storage Rack", 3999, 5499, 27, "Multi-tier medicine ball rack.", False, False, False, ""),
        ("Foam Roller Storage Basket", 1499, 2199, 33, "Wire basket for foam roller storage.", False, False, False, ""),
        ("Resistance Band Hanger", 999, 1499, 33, "Wall hanger for resistance bands.", False, False, False, ""),
        ("Gym Equipment Label Set", 299, 499, 40, "Equipment labeling tags for gym organization.", False, False, False, ""),
        ("Wall-Mounted Key Cabinet", 1499, 2199, 33, "Key cabinet for gym locker management.", False, False, False, ""),
    ]),
]


class Command(BaseCommand):
    help = "Bulk-add 480+ gym products across all categories"

    def handle(self, *args, **options):
        created_products = 0
        created_categories = 0

        for category_name, products in PRODUCTS:
            cat, cat_created = Category.objects.get_or_create(name=category_name)
            if cat_created:
                created_categories += 1
                self.stdout.write(f"  [NEW] Category: {category_name}")

            for prod_data in products:
                (name, price, was_price, off, desc, is_deal, is_new, is_feat, tag) = prod_data

                if Product.objects.filter(name=name).exists():
                    continue

                Product.objects.create(
                    name=name,
                    category=cat,
                    price=price,
                    was_price=was_price,
                    off_percent=off,
                    description=desc,
                    image="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80",
                    is_deal=is_deal,
                    is_featured=is_feat,
                    tag=tag,
                    stock=100,
                )
                created_products += 1

        total = Product.objects.count()
        self.stdout.write(self.style.SUCCESS(
            f"\nDone! Created {created_products} products + {created_categories} categories. "
            f"Total products in DB: {total}"
        ))
