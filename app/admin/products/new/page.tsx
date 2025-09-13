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
  specifications: string;
}

export default function NewProductPage() {
  const [product, setProduct] = useState<ProductState>({
    name: '',
    description: '',
    price: '',
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

      // Parse specifications into JSON if provided
      let specificationsJson = null;
      if (product.specifications.trim()) {
        try {
          // Try to parse as JSON, if it fails, create simple object
          specificationsJson = JSON.parse(product.specifications);
        } catch {
          // If not valid JSON, create a simple notes object
          specificationsJson = { notes: product.specifications.trim() };
        }
      }

      const productData = {
        name: product.name.trim(),
        description: product.description.trim() || null,
        price: parseFloat(product.price),
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
      <div className="h-screen overflow-y-auto">
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

              {/* Additional Specifications */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="specifications">Additional Specifications</Label>
                  <Textarea
                    id="specifications"
                    name="specifications"
                    value={product.specifications}
                    onChange={handleInputChange}
                    placeholder="Enter any additional specifications or features"
                    rows={4}
                  />
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