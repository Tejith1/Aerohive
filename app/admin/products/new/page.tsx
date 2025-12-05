'use client';

import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { processAndStoreImage, createProduct } from '@/lib/supabase';

interface ProductState {
  name: string;
  description: string;
  price: string;
  compare_price: string;
  sku: string;
  stock_quantity: string;
  is_featured: boolean;
  is_active: boolean;
  slug: string;
  // Database fields that exist
  weight: string;
  battery_life: string;
  max_range: string;
  max_speed: string;
  camera_resolution: string;
  has_gps: boolean;
  has_obstacle_avoidance: boolean;
  warranty_months: string;
  
  // Individual specification fields (will be converted to JSON)
  // Power & Physical
  battery_capacity: string;
  charging_time: string;
  dimensions: string;
  
  // Flight Performance
  max_altitude: string;
  wind_resistance: string;
  
  // Camera & Gimbal
  video_resolution: string;
  gimbal_type: string;
  photo_modes: string;
  
  // Additional Features
  return_to_home: boolean;
  follow_me_mode: boolean;
  intelligent_flight_modes: string;
  controller_range: string;
  operating_temperature: string;
  
  // Extra specifications
  payload_capacity: string;
  material: string;
  certification: string;
  
  // Legacy field for backward compatibility
  specifications: string;
}

export default function NewProductPage() {
  const [product, setProduct] = useState<ProductState>({
    name: '',
    description: '',
    price: '',
    compare_price: '',
    sku: '',
    stock_quantity: '',
    is_featured: false,
    is_active: true,
    slug: '',
    weight: '',
    battery_life: '',
    max_range: '',
    max_speed: '',
    camera_resolution: '',
    has_gps: false,
    has_obstacle_avoidance: false,
    warranty_months: '',
    
    // Individual specification fields
    battery_capacity: '',
    charging_time: '',
    dimensions: '',
    max_altitude: '',
    wind_resistance: '',
    video_resolution: '',
    gimbal_type: '',
    photo_modes: '',
    return_to_home: false,
    follow_me_mode: false,
    intelligent_flight_modes: '',
    controller_range: '',
    operating_temperature: '',
    payload_capacity: '',
    material: '',
    certification: '',
    specifications: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    const newProduct = {
      ...product,
      [name]: type === 'checkbox' ? checked : value
    };

    // Auto-generate slug from name if name is being changed
    if (name === 'name') {
      newProduct.slug = value.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-')      // Replace multiple hyphens with single
        .trim();
    }

    setProduct(newProduct);
  };

  const handleSelectChange = (name: keyof ProductState, value: string) => {
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          setImagePreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!product.name.trim() || !product.price.trim() || !product.slug.trim()) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields (name, price, slug)",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      let imageUrl = '';
      if (imageFile) {
        try {
          imageUrl = await processAndStoreImage(imageFile);
        } catch (error) {
          console.error('Image processing error:', error);
        }
      }

      // Build specifications JSON from individual fields
      const specificationsJson: Record<string, any> = {};
      
      // Power & Physical
      if (product.battery_capacity.trim()) specificationsJson.battery_capacity = product.battery_capacity.trim();
      if (product.charging_time.trim()) specificationsJson.charging_time = product.charging_time.trim();
      if (product.dimensions.trim()) specificationsJson.dimensions = product.dimensions.trim();
      
      // Flight Performance
      if (product.max_altitude.trim()) specificationsJson.max_altitude = product.max_altitude.trim();
      if (product.wind_resistance.trim()) specificationsJson.wind_resistance = product.wind_resistance.trim();
      
      // Camera & Gimbal
      if (product.video_resolution.trim()) specificationsJson.video_resolution = product.video_resolution.trim();
      if (product.gimbal_type.trim()) specificationsJson.gimbal_type = product.gimbal_type.trim();
      if (product.photo_modes.trim()) specificationsJson.photo_modes = product.photo_modes.trim();
      
      // Additional Features
      if (product.return_to_home) specificationsJson.return_to_home = product.return_to_home;
      if (product.follow_me_mode) specificationsJson.follow_me_mode = product.follow_me_mode;
      if (product.intelligent_flight_modes.trim()) specificationsJson.intelligent_flight_modes = product.intelligent_flight_modes.trim();
      if (product.controller_range.trim()) specificationsJson.controller_range = product.controller_range.trim();
      if (product.operating_temperature.trim()) specificationsJson.operating_temperature = product.operating_temperature.trim();
      
      // Extra specifications
      if (product.payload_capacity.trim()) specificationsJson.payload_capacity = product.payload_capacity.trim();
      if (product.material.trim()) specificationsJson.material = product.material.trim();
      if (product.certification.trim()) specificationsJson.certification = product.certification.trim();
      
      // Handle legacy specifications field (if user wants to add custom JSON)
      if (product.specifications.trim()) {
        try {
          const customSpecs = JSON.parse(product.specifications);
          Object.assign(specificationsJson, customSpecs);
        } catch {
          // If not valid JSON, add as notes
          specificationsJson.notes = product.specifications.trim();
        }
      }
      
      // Only include specifications if there are any
      const finalSpecifications = Object.keys(specificationsJson).length > 0 ? specificationsJson : null;

      const productData = {
        name: product.name.trim(),
        description: product.description.trim() || null,
        price: parseFloat(product.price),
        compare_price: product.compare_price ? parseFloat(product.compare_price) : null,
        sku: product.sku.trim() || null,
        stock_quantity: product.stock_quantity ? parseInt(product.stock_quantity) : 0,
        is_featured: product.is_featured,
        is_active: product.is_active,
        slug: product.slug.trim(),
        image_url: imageUrl,
        // Database fields
        weight: product.weight ? parseFloat(product.weight) : null,
        battery_life: product.battery_life ? parseInt(product.battery_life) : null,
        max_range: product.max_range ? parseInt(product.max_range) : null,
        max_speed: product.max_speed ? parseFloat(product.max_speed) : null,
        camera_resolution: product.camera_resolution.trim() || null,
        has_gps: product.has_gps,
        has_obstacle_avoidance: product.has_obstacle_avoidance,
        warranty_months: product.warranty_months ? parseInt(product.warranty_months) : null,
        specifications: specificationsJson
      };

      const result = await createProduct(productData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Product created successfully!",
          variant: "default"
        });
        router.push('/admin/products');
      } else {
        throw new Error(result.error || 'Failed to create product');
      }

    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
            <CardDescription>Create a new product</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={product.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={product.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="compare_price">Compare Price ($)</Label>
                  <Input
                    id="compare_price"
                    name="compare_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={product.compare_price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                  <p className="text-sm text-gray-500">Original price for showing discounts (optional)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                  <Input
                    id="sku"
                    name="sku"
                    value={product.sku}
                    onChange={handleInputChange}
                    placeholder="e.g., DRN-001-BLK"
                  />
                  <p className="text-sm text-gray-500">Unique product identifier (optional)</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={product.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stock Quantity</Label>
                <Input
                  id="stock_quantity"
                  name="stock_quantity"
                  type="number"
                  min="0"
                  value={product.stock_quantity}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={product.slug}
                  onChange={handleInputChange}
                  placeholder="product-url-slug"
                  required
                />
                <p className="text-sm text-gray-500">Auto-generated from product name, but can be edited</p>
              </div>

              {/* Drone Specifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-blue-600">🚁</span>
                  Drone Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      step="0.01"
                      value={product.weight}
                      onChange={handleInputChange}
                      placeholder="e.g., 5.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="battery_life">Battery Life (minutes)</Label>
                    <Input
                      id="battery_life"
                      name="battery_life"
                      type="number"
                      value={product.battery_life}
                      onChange={handleInputChange}
                      placeholder="e.g., 30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_range">Max Range (km)</Label>
                    <Input
                      id="max_range"
                      name="max_range"
                      type="number"
                      value={product.max_range}
                      onChange={handleInputChange}
                      placeholder="e.g., 15"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_speed">Max Speed (km/h)</Label>
                    <Input
                      id="max_speed"
                      name="max_speed"
                      type="number"
                      step="0.1"
                      value={product.max_speed}
                      onChange={handleInputChange}
                      placeholder="e.g., 68.4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="camera_resolution">Camera Resolution</Label>
                    <Input
                      id="camera_resolution"
                      name="camera_resolution"
                      value={product.camera_resolution}
                      onChange={handleInputChange}
                      placeholder="e.g., 4K or 12MP"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warranty_months">Warranty (months)</Label>
                    <Input
                      id="warranty_months"
                      name="warranty_months"
                      type="number"
                      value={product.warranty_months}
                      onChange={handleInputChange}
                      placeholder="e.g., 12"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-green-600">⚙️</span>
                  Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_gps"
                      name="has_gps"
                      checked={product.has_gps}
                      onCheckedChange={(checked) => setProduct(prev => ({ ...prev, has_gps: checked === true }))}
                    />
                    <Label htmlFor="has_gps">GPS Navigation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_obstacle_avoidance"
                      name="has_obstacle_avoidance"
                      checked={product.has_obstacle_avoidance}
                      onCheckedChange={(checked) => setProduct(prev => ({ ...prev, has_obstacle_avoidance: checked === true }))}
                    />
                    <Label htmlFor="has_obstacle_avoidance">Obstacle Avoidance</Label>
                  </div>
                </div>
              </div>

              {/* Product Specifications */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Product Specifications</h3>
                
                {/* Power & Physical */}
                <div className="space-y-4">
                  <h4 className="text-base font-medium text-blue-700">Power & Physical</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="battery_capacity">Battery Capacity</Label>
                      <Input
                        id="battery_capacity"
                        name="battery_capacity"
                        value={product.battery_capacity}
                        onChange={handleInputChange}
                        placeholder="e.g., 7000mAh"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="charging_time">Charging Time</Label>
                      <Input
                        id="charging_time"
                        name="charging_time"
                        value={product.charging_time}
                        onChange={handleInputChange}
                        placeholder="e.g., 120 min"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dimensions">Dimensions</Label>
                      <Input
                        id="dimensions"
                        name="dimensions"
                        value={product.dimensions}
                        onChange={handleInputChange}
                        placeholder="e.g., 245×290×90mm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payload_capacity">Payload Capacity</Label>
                      <Input
                        id="payload_capacity"
                        name="payload_capacity"
                        value={product.payload_capacity}
                        onChange={handleInputChange}
                        placeholder="e.g., 2.5kg"
                      />
                    </div>
                  </div>
                </div>

                {/* Flight Performance */}
                <div className="space-y-4">
                  <h4 className="text-base font-medium text-green-700">Flight Performance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max_altitude">Max Altitude</Label>
                      <Input
                        id="max_altitude"
                        name="max_altitude"
                        value={product.max_altitude}
                        onChange={handleInputChange}
                        placeholder="e.g., 10000m"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wind_resistance">Wind Resistance</Label>
                      <Input
                        id="wind_resistance"
                        name="wind_resistance"
                        value={product.wind_resistance}
                        onChange={handleInputChange}
                        placeholder="e.g., Level 7"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="controller_range">Controller Range</Label>
                      <Input
                        id="controller_range"
                        name="controller_range"
                        value={product.controller_range}
                        onChange={handleInputChange}
                        placeholder="e.g., 15km"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="operating_temperature">Operating Temperature</Label>
                      <Input
                        id="operating_temperature"
                        name="operating_temperature"
                        value={product.operating_temperature}
                        onChange={handleInputChange}
                        placeholder="e.g., -10°C to 40°C"
                      />
                    </div>
                  </div>
                </div>

                {/* Camera & Gimbal */}
                <div className="space-y-4">
                  <h4 className="text-base font-medium text-purple-700">Camera & Gimbal</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="video_resolution">Video Resolution</Label>
                      <Input
                        id="video_resolution"
                        name="video_resolution"
                        value={product.video_resolution}
                        onChange={handleInputChange}
                        placeholder="e.g., 4K UHD"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gimbal_type">Gimbal Type</Label>
                      <Input
                        id="gimbal_type"
                        name="gimbal_type"
                        value={product.gimbal_type}
                        onChange={handleInputChange}
                        placeholder="e.g., 3-axis mechanical"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="photo_modes">Photo Modes</Label>
                      <Input
                        id="photo_modes"
                        name="photo_modes"
                        value={product.photo_modes}
                        onChange={handleInputChange}
                        placeholder="e.g., HDR, Panorama, Burst"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Features */}
                <div className="space-y-4">
                  <h4 className="text-base font-medium text-orange-700">Additional Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="intelligent_flight_modes">Intelligent Flight Modes</Label>
                      <Input
                        id="intelligent_flight_modes"
                        name="intelligent_flight_modes"
                        value={product.intelligent_flight_modes}
                        onChange={handleInputChange}
                        placeholder="e.g., ActiveTrack, Waypoint"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="material">Material</Label>
                      <Input
                        id="material"
                        name="material"
                        value={product.material}
                        onChange={handleInputChange}
                        placeholder="e.g., Carbon Fiber"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="certification">Certification</Label>
                      <Input
                        id="certification"
                        name="certification"
                        value={product.certification}
                        onChange={handleInputChange}
                        placeholder="e.g., CE, FCC, SRRC"
                      />
                    </div>
                  </div>
                  
                  {/* Boolean Features */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-medium text-gray-700">Smart Features</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="return_to_home"
                          checked={product.return_to_home}
                          onCheckedChange={(checked) => 
                            setProduct(prev => ({ ...prev, return_to_home: checked as boolean }))
                          }
                        />
                        <Label htmlFor="return_to_home">Return to Home</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="follow_me_mode"
                          checked={product.follow_me_mode}
                          onCheckedChange={(checked) => 
                            setProduct(prev => ({ ...prev, follow_me_mode: checked as boolean }))
                          }
                        />
                        <Label htmlFor="follow_me_mode">Follow Me Mode</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Specifications (Optional) */}
                <div className="space-y-4">
                  <h4 className="text-base font-medium text-gray-700">Custom Specifications (Optional)</h4>
                  <div className="space-y-2">
                    <Label htmlFor="specifications">Additional Custom Data (JSON or Notes)</Label>
                    <Textarea
                      id="specifications"
                      name="specifications"
                      value={product.specifications}
                      onChange={handleInputChange}
                      placeholder="Enter any additional specifications as JSON or plain text notes..."
                      rows={4}
                      className="font-mono text-sm"
                    />
                    <div className="text-sm text-gray-600">
                      <p><strong>� Note:</strong> Use this field for any custom specifications not covered above. You can use JSON format or plain text notes.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Product Image</h3>
                <div className="space-y-2">
                  <Label htmlFor="image">Product Image</Label>
                  <Input
                    ref={fileInputRef}
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-xs max-h-48 object-contain border rounded"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_featured"
                    name="is_featured"
                    checked={product.is_featured}
                    onCheckedChange={(checked) => setProduct(prev => ({ ...prev, is_featured: checked === true }))}
                  />
                  <Label htmlFor="is_featured">Featured Product</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    name="is_active"
                    checked={product.is_active}
                    onCheckedChange={(checked) => setProduct(prev => ({ ...prev, is_active: checked === true }))}
                  />
                  <Label htmlFor="is_active">Active Product</Label>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-32"
                >
                  {isSubmitting ? 'Creating...' : 'Create Product'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}