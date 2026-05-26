import random
import string
from datetime import datetime

def generate_order_number() -> str:
    """Generate a unique order number."""
    timestamp = datetime.now().strftime("%Y%m%d")
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"ORD-{timestamp}-{random_part}"

def calculate_order_totals(subtotal: float, coupon_value: float = 0, coupon_type: str = "fixed") -> dict:
    """Calculate order totals including tax, shipping, and discounts."""
    
    # Calculate discount
    if coupon_type == "percentage":
        discount_amount = subtotal * (coupon_value / 100)
    else:
        discount_amount = coupon_value
    
    # Calculate shipping (free over ₹8,300)
    shipping_amount = 0 if subtotal >= 8300 else 830
    
    # Calculate tax (8% on subtotal minus discount)
    taxable_amount = subtotal - discount_amount
    tax_amount = taxable_amount * 0.08
    
    # Calculate total
    total_amount = subtotal + shipping_amount + tax_amount - discount_amount
    
    return {
        "subtotal": round(subtotal, 2),
        "discount_amount": round(discount_amount, 2),
        "shipping_amount": round(shipping_amount, 2),
        "tax_amount": round(tax_amount, 2),
        "total_amount": round(total_amount, 2)
    }
