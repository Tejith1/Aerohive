from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, DECIMAL, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20))
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    addresses = relationship("Address", back_populates="user")
    cart_items = relationship("CartItem", back_populates="user")
    orders = relationship("Order", back_populates="user")
    reviews = relationship("Review", back_populates="user")

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    slug = Column(String(100), unique=True, nullable=False)
    image_url = Column(String(500))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    short_description = Column(String(500))
    price = Column(DECIMAL(10, 2), nullable=False)
    compare_price = Column(DECIMAL(10, 2))
    sku = Column(String(100), unique=True)
    stock_quantity = Column(Integer, default=0)
    category_id = Column(Integer, ForeignKey("categories.id"))
    image_url = Column(String(500))
    images = Column(JSON, default=[])
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    weight = Column(DECIMAL(8, 2))
    dimensions = Column(JSON)
    meta_title = Column(String(255))
    meta_description = Column(Text)
    slug = Column(String(255), unique=True, nullable=False)
    
    # Drone-specific fields
    product_type = Column(String(50), default="physical") # physical, digital, service
    flight_time = Column(Integer) # in minutes
    max_speed = Column(DECIMAL(5, 2)) # in km/h
    max_range = Column(DECIMAL(8, 2)) # in meters
    payload_capacity = Column(DECIMAL(6, 2)) # in grams
    camera_resolution = Column(String(50)) # e.g., "4K", "1080p"
    gps_enabled = Column(Boolean, default=False)
    obstacle_avoidance = Column(Boolean, default=False)
    return_to_home = Column(Boolean, default=False)
    follow_me_mode = Column(Boolean, default=False)
    max_altitude = Column(Integer) # in meters
    battery_type = Column(String(50))
    charging_time = Column(Integer) # in minutes
    drone_specifications = Column(JSON) # detailed specs
    customization_options = Column(JSON) # available customizations
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    category = relationship("Category", back_populates="products")
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    reviews = relationship("Review", back_populates="product")
    customizations = relationship("DroneCustomization", back_populates="product")

class Address(Base):
    __tablename__ = "addresses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(20), default="shipping")
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    company = Column(String(100))
    address_line_1 = Column(String(255), nullable=False)
    address_line_2 = Column(String(255))
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=False)
    country = Column(String(100), nullable=False)
    phone = Column(String(20))
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="addresses")

class CartItem(Base):
    __tablename__ = "cart_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    customization_id = Column(Integer, ForeignKey("drone_customizations.id")) # for customized drones
    insurance_id = Column(Integer, ForeignKey("drone_insurance.id")) # selected insurance
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")
    customization = relationship("DroneCustomization")
    insurance = relationship("DroneInsurance")

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    order_number = Column(String(50), unique=True, nullable=False)
    status = Column(String(20), default="pending")
    payment_status = Column(String(20), default="pending")
    payment_method = Column(String(50))
    payment_id = Column(String(255))
    subtotal = Column(DECIMAL(10, 2), nullable=False)
    tax_amount = Column(DECIMAL(10, 2), default=0)
    shipping_amount = Column(DECIMAL(10, 2), default=0)
    discount_amount = Column(DECIMAL(10, 2), default=0)
    total_amount = Column(DECIMAL(10, 2), nullable=False)
    currency = Column(String(3), default="USD")
    
    # Shipping address fields
    shipping_first_name = Column(String(100))
    shipping_last_name = Column(String(100))
    shipping_company = Column(String(100))
    shipping_address_line_1 = Column(String(255))
    shipping_address_line_2 = Column(String(255))
    shipping_city = Column(String(100))
    shipping_state = Column(String(100))
    shipping_postal_code = Column(String(20))
    shipping_country = Column(String(100))
    shipping_phone = Column(String(20))
    
    # Billing address fields
    billing_first_name = Column(String(100))
    billing_last_name = Column(String(100))
    billing_company = Column(String(100))
    billing_address_line_1 = Column(String(255))
    billing_address_line_2 = Column(String(255))
    billing_city = Column(String(100))
    billing_state = Column(String(100))
    billing_postal_code = Column(String(20))
    billing_country = Column(String(100))
    billing_phone = Column(String(20))
    
    notes = Column(Text)
    shipped_at = Column(DateTime(timezone=True))
    delivered_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"))
    product_name = Column(String(255), nullable=False)
    product_sku = Column(String(100))
    quantity = Column(Integer, nullable=False)
    unit_price = Column(DECIMAL(10, 2), nullable=False)
    total_price = Column(DECIMAL(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"))
    rating = Column(Integer, nullable=False)
    title = Column(String(255))
    comment = Column(Text)
    is_verified = Column(Boolean, default=False)
    is_approved = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")

class Coupon(Base):
    __tablename__ = "coupons"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False)
    type = Column(String(20), nullable=False)
    value = Column(DECIMAL(10, 2), nullable=False)
    minimum_amount = Column(DECIMAL(10, 2))
    maximum_discount = Column(DECIMAL(10, 2))
    usage_limit = Column(Integer)
    used_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    starts_at = Column(DateTime(timezone=True))
    expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

# Drone-specific models

class DroneCustomization(Base):
    __tablename__ = "drone_customizations"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    configuration = Column(JSON, nullable=False) # stores selected options
    total_price = Column(DECIMAL(10, 2), nullable=False)
    is_saved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="customizations")
    user = relationship("User")

class DroneInsurance(Base):
    __tablename__ = "drone_insurance"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    coverage_type = Column(String(100), nullable=False) # basic, standard, premium
    price_percentage = Column(DECIMAL(5, 2), nullable=False) # percentage of drone price
    duration_months = Column(Integer, nullable=False)
    coverage_details = Column(JSON) # what's covered
    terms_conditions = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class TrainingProvider(Base):
    __tablename__ = "training_providers"
    
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=False)
    contact_person = Column(String(255))
    email = Column(String(255), nullable=False)
    phone = Column(String(20))
    website = Column(String(500))
    description = Column(Text)
    certifications = Column(JSON) # list of certifications they offer
    location = Column(String(255))
    rating = Column(DECIMAL(3, 2), default=0.0)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    courses = relationship("TrainingCourse", back_populates="provider")

class TrainingCourse(Base):
    __tablename__ = "training_courses"
    
    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("training_providers.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    course_type = Column(String(100)) # beginner, intermediate, advanced, certification
    duration_hours = Column(Integer)
    price = Column(DECIMAL(10, 2), nullable=False)
    max_participants = Column(Integer)
    certification_provided = Column(Boolean, default=False)
    course_outline = Column(JSON)
    prerequisites = Column(Text)
    is_online = Column(Boolean, default=False)
    location = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    provider = relationship("TrainingProvider", back_populates="courses")
    bookings = relationship("CourseBooking", back_populates="course")

class CourseBooking(Base):
    __tablename__ = "course_bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("training_courses.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    booking_date = Column(DateTime(timezone=True), nullable=False)
    course_start_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(20), default="confirmed") # confirmed, cancelled, completed
    amount_paid = Column(DECIMAL(10, 2), nullable=False)
    payment_status = Column(String(20), default="pending")
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    course = relationship("TrainingCourse", back_populates="bookings")
    user = relationship("User")

class RepairCenter(Base):
    __tablename__ = "repair_centers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    contact_person = Column(String(255))
    email = Column(String(255), nullable=False)
    phone = Column(String(20))
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100))
    postal_code = Column(String(20))
    country = Column(String(100), nullable=False)
    latitude = Column(DECIMAL(10, 8))
    longitude = Column(DECIMAL(11, 8))
    specialties = Column(JSON) # types of drones/repairs they specialize in
    certifications = Column(JSON)
    rating = Column(DECIMAL(3, 2), default=0.0)
    review_count = Column(Integer, default=0)
    turnaround_time = Column(String(100)) # e.g., "3-5 business days"
    is_authorized = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    repair_requests = relationship("RepairRequest", back_populates="repair_center")

class RepairRequest(Base):
    __tablename__ = "repair_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    repair_center_id = Column(Integer, ForeignKey("repair_centers.id"))
    drone_model = Column(String(255), nullable=False)
    issue_description = Column(Text, nullable=False)
    estimated_cost = Column(DECIMAL(10, 2))
    actual_cost = Column(DECIMAL(10, 2))
    status = Column(String(50), default="submitted") # submitted, quoted, accepted, in_progress, completed, cancelled
    priority = Column(String(20), default="normal") # low, normal, high, urgent
    images = Column(JSON) # images of the damaged drone
    notes = Column(Text)
    quote_valid_until = Column(DateTime(timezone=True))
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    repair_center = relationship("RepairCenter", back_populates="repair_requests")

class ServiceProvider(Base):
    __tablename__ = "service_providers"
    
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=False)
    description = Column(Text)
    contact_person = Column(String(255))
    email = Column(String(255), nullable=False)
    phone = Column(String(20))
    website = Column(String(500))
    service_types = Column(JSON, nullable=False) # mapping, surveillance, spraying, photography
    coverage_areas = Column(JSON) # geographical areas they serve
    equipment = Column(JSON) # drones and equipment they use
    certifications = Column(JSON)
    insurance_details = Column(JSON)
    rating = Column(DECIMAL(3, 2), default=0.0)
    review_count = Column(Integer, default=0)
    commission_rate = Column(DECIMAL(5, 2), default=10.0) # percentage commission
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    services = relationship("DroneService", back_populates="provider")

class DroneService(Base):
    __tablename__ = "drone_services"
    
    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("service_providers.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    service_type = Column(String(100), nullable=False) # mapping, surveillance, spraying, photography
    price_type = Column(String(50), nullable=False) # hourly, daily, per_project, per_acre
    base_price = Column(DECIMAL(10, 2), nullable=False)
    min_duration = Column(Integer) # minimum hours/days
    coverage_area = Column(String(255))
    equipment_used = Column(JSON)
    deliverables = Column(JSON) # what client receives
    turnaround_time = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    provider = relationship("ServiceProvider", back_populates="services")
    bookings = relationship("ServiceBooking", back_populates="service")

class ServiceBooking(Base):
    __tablename__ = "service_bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("drone_services.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_title = Column(String(255), nullable=False)
    project_description = Column(Text)
    location = Column(Text, nullable=False)
    preferred_date = Column(DateTime(timezone=True))
    duration_estimate = Column(Integer) # in hours or days
    budget_range = Column(String(100))
    special_requirements = Column(Text)
    status = Column(String(50), default="pending") # pending, quoted, confirmed, in_progress, completed, cancelled
    quoted_price = Column(DECIMAL(10, 2))
    final_price = Column(DECIMAL(10, 2))
    commission_amount = Column(DECIMAL(10, 2))
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    service = relationship("DroneService", back_populates="bookings")
    user = relationship("User")

class ProductComparison(Base):
    __tablename__ = "product_comparisons"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_ids = Column(JSON, nullable=False) # array of product IDs to compare
    comparison_name = Column(String(255))
    is_saved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
