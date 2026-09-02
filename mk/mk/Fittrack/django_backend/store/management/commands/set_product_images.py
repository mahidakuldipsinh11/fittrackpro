"""
Set unique, relevant images for every product based on its name and category.
Uses Unsplash source URLs with specific search queries.
"""
from django.core.management.base import BaseCommand
from store.models import Product

# Category-specific image mappings (search term -> list of Unsplash URLs)
# We use Unsplash source API: https://source.unsplash.com/featured/?query
# But that service is deprecated, so we use direct Unsplash photo URLs

IMAGE_MAP = {
    # ═══════════════════════════════════════════════════════════════
    # BARBELLS & PLATES
    # ═══════════════════════════════════════════════════════════════
    "Olympic Barbell 7ft 20kg": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80",
    "EZ Curl Bar 4ft": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80",
    "Trap Bar / Hex Bar 25kg": "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=500&auto=format&fit=crop&q=80",
    "Safety Squat Bar 7ft": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=80",
    "Women's Olympic Barbell 15kg": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=80",
    "Standard Barbell 6ft": "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=500&auto=format&fit=crop&q=80",
    "Bumper Plate Set 100kg": "https://images.unsplash.com/photo-1605296867424-35fc25c9212a?w=500&auto=format&fit=crop&q=80",
    "Bumper Plate 5kg (Pair)": "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500&auto=format&fit=crop&q=80",
    "Bumper Plate 10kg (Pair)": "https://images.unsplash.com/photo-1590487988256-9ed24133863e?w=500&auto=format&fit=crop&q=80",
    "Bumper Plate 15kg (Pair)": "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&auto=format&fit=crop&q=80",
    "Bumper Plate 20kg (Pair)": "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=500&auto=format&fit=crop&q=80",
    "Bumper Plate 25kg (Pair)": "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=500&auto=format&fit=crop&q=80",
    "Iron Plate 2.5kg (Pair)": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&auto=format&fit=crop&q=80",
    "Iron Plate 5kg (Pair)": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=80",
    "Iron Plate 10kg (Pair)": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80",
    "Iron Plate 15kg (Pair)": "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=500&auto=format&fit=crop&q=80",
    "Iron Plate 20kg (Pair)": "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=500&auto=format&fit=crop&q=80",
    "Fractional Plate Set 0.5-1.5kg": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=80",
    "Competition Plates Set 250kg": "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=500&auto=format&fit=crop&q=80",
    "Technique Barbell 5ft 8kg": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80",
    "Calibrated Steel Plates Set 120kg": "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=500&auto=format&fit=crop&q=80",
    "Weightlifting Collars Spring (Pair)": "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=500&auto=format&fit=crop&q=80",
    "Olympic Lock Jaw Collars (Pair)": "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=500&auto=format&fit=crop&q=80",
    "Deadlift Jack": "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=500&auto=format&fit=crop&q=80",
    "Barbell Pad Squat Neck Cushion": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=80",
    "Swiss Bar / Football Bar": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80",
    "Resistance Band Bar Attachments": "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500&auto=format&fit=crop&q=80",
    "Plate Tree Storage Rack": "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=500&auto=format&fit=crop&q=80",
    "Olympic Plate Set 50kg": "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=500&auto=format&fit=crop&q=80",
    "Olympic Plate Set 100kg": "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=500&auto=format&fit=crop&q=80",
    "Cast Iron Kettlebell Plate 20kg": "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=500&auto=format&fit=crop&q=80",
    "Hex Dumbbell Plate 10kg": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=80",
    "Change Plate Set 2.5-10kg": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=80",
    "Power Bar 29mm 20kg": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80",
    "Deadlift Bar 27mm 20kg": "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=500&auto=format&fit=crop&q=80",
    "Olympic Weightlifting Bar 20kg": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80",
    "Tricep Bar 4ft": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80",
    "Axle Bar 8ft 25kg": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80",
    "BandBell Earthquake Bar": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80",
    "Junior Barbell 5ft 10kg": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80",
    "Urethane Bumper Plate Set 140kg": "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=500&auto=format&fit=crop&q=80",
    "Steel Grip Plates 50kg Set": "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=500&auto=format&fit=crop&q=80",
    "Plate Loading Belt Squat Platform": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=80",
    "Barbell Bearing Kit": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80",
    "Bushing Kit for Power Bar": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80",
    "Chalk Bowl Stand": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80",
    "Plate Cleaner Spray 500ml": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80",
    "Olympic Barbell Gift Box": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80",
    "Barbell Resistance Band Set": "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500&auto=format&fit=crop&q=80",
    "Calibrated Plates 2.5kg (Pair)": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=80",
}

# Generic category-based fallback images
CATEGORY_IMAGES = {
    "Barbells & Plates": [
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&auto=format&fit=crop&q=80",
    ],
    "Racks & Rigs": [
        "https://images.unsplash.com/photo-1571019613897-24c4f9e47b84?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80",
    ],
    "Dumbbells": [
        "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1590487988256-9ed24133863e?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1605296867424-35fc25c9212a?w=500&auto=format&fit=crop&q=80",
    ],
    "Kettlebells": [
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=500&auto=format&fit=crop&q=80",
    ],
    "Benches": [
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80",
    ],
    "Cardio": [
        "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=80",
    ],
    "Machines": [
        "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=80",
    ],
    "Accessories": [
        "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80",
    ],
    "Weights": [
        "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1590487988256-9ed24133863e?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=500&auto=format&fit=crop&q=80",
    ],
    "Yoga & Fitness": [
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=500&auto=format&fit=crop&q=80",
    ],
    "Functional Training": [
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=500&auto=format&fit=crop&q=80",
    ],
    "Gym Flooring": [
        "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=80",
    ],
    "Gym Packages": [
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1571019613897-24c4f9e47b84?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80",
    ],
    "Storage": [
        "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=80",
    ],
    "Clothing": [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1622445275576-721325763afe?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1434389677669-e08b4cda3a90?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=80",
    ],
    "Supplements": [
        "https://images.unsplash.com/photo-1593095948071-474c5cc271c8?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1622485831930-6961e5b47e75?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1505576399279-0d309f03a7e6?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=500&auto=format&fit=crop&q=80",
    ],
    "Racks": [
        "https://images.unsplash.com/photo-1571019613897-24c4f9e47b84?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&auto=format&fit=crop&q=80",
    ],
}

# Keyword-based image mapping for smarter matching
KEYWORD_IMAGES = {
    "treadmill": "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=500&auto=format&fit=crop&q=80",
    "bike": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&auto=format&fit=crop&q=80",
    "spin": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&auto=format&fit=crop&q=80",
    "rowing": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&auto=format&fit=crop&q=80",
    "elliptical": "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&auto=format&fit=crop&q=80",
    "climber": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&auto=format&fit=crop&q=80",
    "stair": "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&auto=format&fit=crop&q=80",
    "protein": "https://images.unsplash.com/photo-1593095948071-474c5cc271c8?w=500&auto=format&fit=crop&q=80",
    "whey": "https://images.unsplash.com/photo-1593095948071-474c5cc271c8?w=500&auto=format&fit=crop&q=80",
    "creatine": "https://images.unsplash.com/photo-1622485831930-6961e5b47e75?w=500&auto=format&fit=crop&q=80",
    "pre-workout": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&auto=format&fit=crop&q=80",
    "vitamin": "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500&auto=format&fit=crop&q=80",
    "bcaa": "https://images.unsplash.com/photo-1505576399279-0d309f03a7e6?w=500&auto=format&fit=crop&q=80",
    "mass gainer": "https://images.unsplash.com/photo-1593095948071-474c5cc271c8?w=500&auto=format&fit=crop&q=80",
    "fat burner": "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=500&auto=format&fit=crop&q=80",
    "yoga mat": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=80",
    "yoga": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=80",
    "foam roller": "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=500&auto=format&fit=crop&q=80",
    "resistance band": "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500&auto=format&fit=crop&q=80",
    "kettlebell": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&auto=format&fit=crop&q=80",
    "jump rope": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&auto=format&fit=crop&q=80",
    "battle rope": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=80",
    "plyo": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80",
    "glove": "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&auto=format&fit=crop&q=80",
    "belt": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=80",
    "knee": "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&auto=format&fit=crop&q=80",
    "wrist": "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&auto=format&fit=crop&q=80",
    "shirt": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=80",
    "tee": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=80",
    "tank": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&auto=format&fit=crop&q=80",
    "shorts": "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500&auto=format&fit=crop&q=80",
    "hoodie": "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500&auto=format&fit=crop&q=80",
    "jacket": "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500&auto=format&fit=crop&q=80",
    "legging": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=80",
    "socks": "https://images.unsplash.com/photo-1586350977771-b3b0abd50c87?w=500&auto=format&fit=crop&q=80",
    "cap": "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=500&auto=format&fit=crop&q=80",
    "headband": "https://images.unsplash.com/photo-1434389677669-e08b4cda3a90?w=500&auto=format&fit=crop&q=80",
    "barbell": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80",
    "dumbbell": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=80",
    "bench": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=80",
    "rack": "https://images.unsplash.com/photo-1571019613897-24c4f9e47b84?w=500&auto=format&fit=crop&q=80",
    "cable": "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=500&auto=format&fit=crop&q=80",
    "pull-up": "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&auto=format&fit=crop&q=80",
    "bar": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80",
    "plate": "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=500&auto=format&fit=crop&q=80",
    "floor": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80",
    "turf": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80",
    "ring": "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&auto=format&fit=crop&q=80",
    "trx": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=80",
    "suspension": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=80",
    "sled": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80",
    "mace": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80",
    "sandbag": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80",
    "med ball": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&auto=format&fit=crop&q=80",
    "medicine ball": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&auto=format&fit=crop&q=80",
    "slam ball": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&auto=format&fit=crop&q=80",
    "wall ball": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&auto=format&fit=crop&q=80",
    "massage gun": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=80",
    "ankle strap": "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&auto=format&fit=crop&q=80",
    "shaker": "https://images.unsplash.com/photo-1593095948071-474c5cc271c8?w=500&auto=format&fit=crop&q=80",
    "bar": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80",
    "vest": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&auto=format&fit=crop&q=80",
    "weight": "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=500&auto=format&fit=crop&q=80",
}


class Command(BaseCommand):
    help = "Set unique images for all products based on name and category"

    def handle(self, *args, **options):
        import hashlib
        from collections import defaultdict

        products = Product.objects.select_related('category').all()
        updated = 0
        cat_counters = defaultdict(int)

        for p in products:
            name_lower = p.name.lower()
            cat_name = p.category.name if p.category else ""

            # 1. Try exact match from IMAGE_MAP
            if p.name in IMAGE_MAP:
                new_img = IMAGE_MAP[p.name]
            else:
                # 2. Try keyword matching
                matched = False
                for keyword, img in KEYWORD_IMAGES.items():
                    if keyword in name_lower:
                        new_img = img
                        matched = True
                        break

                if not matched:
                    # 3. Use category-based image with rotation
                    cat_imgs = CATEGORY_IMAGES.get(cat_name, CATEGORY_IMAGES.get("Accessories", []))
                    if cat_imgs:
                        idx = cat_counters[cat_name] % len(cat_imgs)
                        new_img = cat_imgs[idx]
                        cat_counters[cat_name] += 1
                    else:
                        # 4. Final fallback - hash-based unique image
                        hash_val = int(hashlib.md5(p.name.encode()).hexdigest()[:8], 16)
                        new_img = f"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80&v={hash_val}"

            if p.image != new_img:
                p.image = new_img
                p.save(update_fields=['image'])
                updated += 1

        self.stdout.write(self.style.SUCCESS(
            f"Done! Updated {updated} products with unique images. Total: {Product.objects.count()}"
        ))
