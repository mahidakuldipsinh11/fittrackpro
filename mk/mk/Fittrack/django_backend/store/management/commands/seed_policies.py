"""
Management command: python manage.py seed_policies
Seeds the Policy + PolicySection tables with default content.
"""
from django.core.management.base import BaseCommand
from store.models import Policy, PolicySection


POLICIES = {
    "return-policy": {
        "title": "Return Policy",
        "subtitle": "We want you to love your gear. If something isn't right, we make returns simple and hassle-free.",
        "sections": [
            {
                "icon": "📦",
                "title": "7-Day Return Window",
                "content": "You may return most items within 7 days of delivery. The return window begins on the date the product is delivered to your address. Items must be in their original packaging, unused, and in the same condition you received them.",
                "order": 1,
            },
            {
                "icon": "✅",
                "title": "Eligible Items",
                "content": "",
                "list_items": "All gym equipment (barbells, dumbbells, racks, benches)\nResistance bands, gloves, belts, and other accessories\nProtein powders and supplements (unopened sealed only)\nGym clothing and apparel (tags attached, unworn)\nWater bottles, shakers, and small accessories",
                "order": 2,
            },
            {
                "icon": "❌",
                "title": "Non-Returnable Items",
                "content": "",
                "list_items": "Custom-built or made-to-order equipment\nOpened or used protein powders and supplements\nItems damaged by the customer through misuse\nProducts without original packaging or receipt\nItems marked as 'Final Sale' during clearance events",
                "order": 3,
            },
            {
                "icon": "🔄",
                "title": "How to Initiate a Return",
                "content": "",
                "list_items": "Log in to your FitTrack Pro account and go to My Orders.\nSelect the order containing the item you want to return.\nClick 'Return Item' and select your reason for return.\nYou will receive a Return Authorization Number (RAN) via email.\nPack the item securely in its original packaging.\nOur delivery partner will pick up the item within 2-3 business days.",
                "order": 4,
            },
            {
                "icon": "🔍",
                "title": "Return Inspection",
                "content": "Once we receive the returned item, our quality team will inspect it within 2 business days. If the item passes inspection (unused, undamaged, original packaging), your refund will be processed. If the item is found damaged or used, we may offer a partial refund or reject the return.",
                "order": 5,
            },
            {
                "icon": "🚚",
                "title": "Return Shipping",
                "content": "FitTrack Pro covers return shipping costs for defective or incorrectly shipped items. For other returns (changed mind, wrong size ordered), a flat ₹99 return shipping fee will be deducted from your refund. Free return pickup is available in all major cities.",
                "order": 6,
            },
        ],
    },
    "refund-policy": {
        "title": "Refund Policy",
        "subtitle": "Transparent refund process. No hidden charges. Your money is safe with us.",
        "sections": [
            {
                "icon": "💰",
                "title": "Refund Overview",
                "content": "At FitTrack Pro, we process refunds promptly once a return is approved. Refunds are issued to the original payment method used during checkout. The timeline depends on your payment method and bank processing times.",
                "order": 1,
            },
            {
                "icon": "💳",
                "title": "Refund Timelines",
                "content": "",
                "list_items": "UPI Payments: Refund within 3-5 business days after approval.\nCredit/Debit Card: Refund within 5-7 business days after approval.\nNet Banking: Refund within 5-7 business days after approval.\nCash on Delivery (COD): Refund via bank transfer within 7-10 business days. You will need to provide your bank details.\nWallet Payments: Refund within 2-3 business days after approval.",
                "order": 2,
            },
            {
                "icon": "🔄",
                "title": "Order Cancellation Refunds",
                "content": "If you cancel an order before it is shipped, you will receive a full refund within 3-5 business days. If you cancel after the order has shipped, the item must be returned first. Once we receive and inspect the returned item, your refund will be processed within 2 business days.",
                "order": 3,
            },
            {
                "icon": "⚠️",
                "title": "Deductions & Conditions",
                "content": "",
                "list_items": "Original shipping charges are non-refundable unless the return is due to our error.\nA return shipping fee of ₹99 applies for returns where the customer changed their mind.\nItems returned in damaged or used condition may have a deduction of up to 30% from the refund amount.\nGift wrapping charges are non-refundable.\nCOD orders: A processing fee of ₹49 will be deducted from the refund.",
                "order": 4,
            },
            {
                "icon": "🛡️",
                "title": "Defective or Wrong Items",
                "content": "If you received a defective, damaged, or incorrect item, you are eligible for a full refund with no deductions. We will also arrange a free return pickup from your address. Please report the issue within 48 hours of delivery with photos as proof.",
                "order": 5,
            },
            {
                "icon": "📊",
                "title": "Partial Refunds",
                "content": "",
                "list_items": "Items returned after the 7-day window (up to 14 days): 70% refund.\nItems with missing original packaging: 85% refund.\nItems with minor cosmetic damage: 70-85% refund based on condition.\nItems used or installed: No refund (warranty claim may apply).",
                "order": 6,
            },
            {
                "icon": "📞",
                "title": "How to Request a Refund",
                "content": "",
                "list_items": "Log in to your FitTrack Pro account.\nGo to My Orders and select the relevant order.\nClick 'Request Refund' and select your reason.\nUpload photos if the item is defective or damaged.\nSubmit the request — our team will review within 24 hours.\nOnce approved, the refund will be initiated to your original payment method.",
                "order": 7,
            },
        ],
    },
    "privacy-policy": {
        "title": "Privacy Policy",
        "subtitle": "Your privacy matters. We protect your data with the same intensity we build our equipment.",
        "sections": [
            {
                "icon": "📋",
                "title": "Information We Collect",
                "content": "",
                "list_items": "Name, email address, phone number, and delivery address when you create an account.\nPayment information (card number, UPI ID) — processed securely through our payment partners. We never store your full card details.\nOrder history, browsing behavior, and product interactions to personalize your experience.\nDevice information (browser type, IP address) for security and fraud prevention.\nCommunications you send us (support tickets, reviews, feedback).",
                "order": 1,
            },
            {
                "icon": "🎯",
                "title": "How We Use Your Information",
                "content": "",
                "list_items": "To process and fulfill your orders, including delivery and payment processing.\nTo send order confirmations, shipping updates, and delivery notifications via email.\nTo provide customer support and respond to your queries.\nTo personalize your shopping experience and recommend relevant products.\nTo detect and prevent fraud, unauthorized access, and other security threats.\nTo improve our website, products, and services based on usage patterns.\nTo send promotional emails and offers (only if you opt in — you can unsubscribe anytime).",
                "order": 2,
            },
            {
                "icon": "🤝",
                "title": "Information Sharing",
                "content": "We do not sell or rent your personal information to third parties. We may share your information only in these limited circumstances:",
                "list_items": "With delivery partners (name, phone, address) to fulfill your orders.\nWith payment processors to handle transactions securely.\nWith analytics tools (Google Analytics) to understand website usage — all data is anonymized.\nWhen required by law, court order, or government regulation.\nIn the event of a business merger or acquisition (you will be notified).",
                "order": 3,
            },
            {
                "icon": "🔒",
                "title": "Data Security",
                "content": "We take your data security seriously. All data is encrypted in transit (SSL/TLS) and at rest. Our payment processing is PCI DSS compliant. We use industry-standard security measures to protect your personal information from unauthorized access, alteration, or deletion.",
                "order": 4,
            },
            {
                "icon": "🍪",
                "title": "Cookies & Tracking",
                "content": "",
                "list_items": "Essential cookies: Required for the website to function (login, cart, checkout).\nAnalytics cookies: Help us understand how you use our site (Google Analytics).\nMarketing cookies: Used for personalized ads (only if you consent).\nYou can manage cookie preferences through your browser settings.\nDisabling essential cookies may affect website functionality.",
                "order": 5,
            },
            {
                "icon": "👤",
                "title": "Your Rights",
                "content": "",
                "list_items": "Access: Request a copy of all personal data we hold about you.\nCorrection: Request correction of any inaccurate or incomplete data.\nDeletion: Request deletion of your account and personal data.\nOpt-out: Unsubscribe from marketing emails at any time.\nData Portability: Request your data in a structured, machine-readable format.\nTo exercise these rights, email us at privacy@fittrackpro.com.",
                "order": 6,
            },
            {
                "icon": "👶",
                "title": "Children's Privacy",
                "content": "FitTrack Pro is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately and we will delete it.",
                "order": 7,
            },
            {
                "icon": "📝",
                "title": "Policy Changes",
                "content": "We may update this Privacy Policy from time to time. Significant changes will be notified via email or a prominent notice on our website. Your continued use of FitTrack Pro after changes constitutes acceptance of the updated policy.",
                "order": 8,
            },
        ],
    },
    "disclaimer": {
        "title": "Disclaimer",
        "subtitle": "Important legal information about using FitTrack Pro. Please read carefully.",
        "sections": [
            {
                "icon": "⚖️",
                "title": "General Disclaimer",
                "content": "The information provided on FitTrack Pro (www.fittrackpro.com) is for general informational and shopping purposes only. All content, product descriptions, specifications, and pricing are subject to change without notice. FitTrack Pro makes no warranties about the completeness, reliability, or accuracy of this information.",
                "order": 1,
            },
            {
                "icon": "🏋️",
                "title": "Product Disclaimer",
                "content": "",
                "list_items": "Product images are for illustration purposes only. Actual products may vary slightly in color, design, or packaging.\nWeights and dimensions listed are approximate and may have minor manufacturing tolerances.\nAlways consult a fitness professional before using new gym equipment, especially heavy lifting gear.\nFollow all safety instructions and guidelines provided with each product.\nMaximum weight capacities listed are absolute limits — do not exceed them under any circumstances.\nImproper use of gym equipment can result in serious injury. FitTrack Pro is not liable for injuries caused by misuse.",
                "order": 2,
            },
            {
                "icon": "🏋️‍♂️",
                "title": "Fitness Disclaimer",
                "content": "The exercises, workouts, and fitness advice mentioned on this website or in any communications are for educational purposes only. They are not a substitute for professional medical advice, diagnosis, or treatment. Always consult your physician or qualified fitness professional before beginning any exercise program, especially if you have any pre-existing health conditions, injuries, or concerns.",
                "order": 3,
            },
            {
                "icon": "💰",
                "title": "Pricing Disclaimer",
                "content": "",
                "list_items": "All prices are in Indian Rupees (INR) and inclusive of applicable taxes unless stated otherwise.\nPrices are subject to change without prior notice. The price at the time of checkout is the final price.\nDiscount percentages are calculated on the Maximum Retail Price (MRP) or original listed price.\nThe Welcome 10% discount is valid for first-time subscribers only and cannot be combined with other offers.\nProduct availability and pricing may vary by region and delivery location.\nTypographical errors in pricing are subject to correction. If a product is listed at an incorrect price, we reserve the right to cancel the order and issue a full refund.",
                "order": 4,
            },
            {
                "icon": "🚚",
                "title": "Delivery Disclaimer",
                "content": "Delivery timelines are estimates and not guaranteed. Factors such as location, weather, holidays, and unforeseen circumstances may cause delays. FitTrack Pro is not responsible for delays caused by courier partners. Risk of loss and title for items pass to you upon delivery.",
                "order": 5,
            },
            {
                "icon": "🔗",
                "title": "Third-Party Links",
                "content": "Our website may contain links to third-party websites or services that are not owned or controlled by FitTrack Pro. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites. We strongly advise you to read the terms and privacy policy of every site you visit.",
                "order": 6,
            },
            {
                "icon": "📧",
                "title": "Email & Communication Disclaimer",
                "content": "Any emails, messages, or communications sent to or from FitTrack Pro are intended solely for the individual or entity to whom they are addressed. The content of these communications is confidential and may be privileged. If you are not the intended recipient, you are hereby notified that any disclosure, copying, distribution, or use of this information is strictly prohibited.",
                "order": 7,
            },
            {
                "icon": "🛡️",
                "title": "Limitation of Liability",
                "content": "FitTrack Pro, its directors, employees, partners, agents, suppliers, or affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service. Our total liability shall not exceed the amount you paid for the product in question.",
                "order": 8,
            },
        ],
    },
}


class Command(BaseCommand):
    help = "Seed the database with default policy content (Return, Refund, Privacy, Disclaimer)"

    def handle(self, *args, **options):
        for slug, data in POLICIES.items():
            policy, created = Policy.objects.get_or_create(
                slug=slug,
                defaults={"title": data["title"], "subtitle": data["subtitle"]},
            )
            if not created:
                policy.title = data["title"]
                policy.subtitle = data["subtitle"]
                policy.save()

            # Clear existing sections and re-create
            policy.sections.all().delete()
            for section_data in data["sections"]:
                PolicySection.objects.create(
                    policy=policy,
                    icon=section_data["icon"],
                    title=section_data["title"],
                    content=section_data.get("content", ""),
                    list_items=section_data.get("list_items", ""),
                    order=section_data["order"],
                )

            section_count = policy.sections.count()
            print(f"OK: {policy.title} - {section_count} sections created")

        print("All 4 policies seeded successfully!")
