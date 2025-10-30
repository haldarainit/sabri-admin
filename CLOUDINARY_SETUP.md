# 🔧 Cloudinary Setup for Sabri Jewelry Admin

## 📋 Environment Variables Setup

Create a `.env.local` file in your `sabri-admin` directory with the following Cloudinary credentials:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dhz4my0yx
CLOUDINARY_API_KEY=653169211298715
CLOUDINARY_API_SECRET=OcW7HCdDIL6gT9NM_x1ylI-5hac
CLOUDINARY_URL=cloudinary://653169211298715:OcW7HCdDIL6gT9NM_x1ylI-5hac@dhz4my0yx

# Database
MONGODB_URI=mongodb://localhost:27017/sabri-jewelry-admin

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Admin Credentials
ADMIN_EMAIL=admin@sabri.com
ADMIN_PASSWORD=admin123
```

## 🚀 Installation Steps

1. **Install Dependencies**

   ```bash
   cd sabri-admin
   npm install
   ```

2. **Create Environment File**

   - Create `.env.local` file in the `sabri-admin` directory
   - Copy the environment variables above into the file

3. **Start the Development Server**
   ```bash
   npm run dev
   ```

## 📸 Image Upload Features

### ✨ What's Been Added:

1. **Cloudinary Integration**

   - Automatic image optimization
   - WebP format conversion
   - Responsive image sizing
   - CDN delivery

2. **Single Product Image Upload**

   - Upload up to 4 images per jewelry product
   - Real-time preview with Cloudinary URLs
   - Primary image designation
   - Drag-and-drop interface

3. **Bulk Image Upload**

   - Upload up to 50 images at once
   - Progress tracking
   - Automatic folder organization (`sabri-jewelry-bulk`)
   - CSV-ready URLs

4. **Image Management**
   - Automatic resizing to 800x800px max
   - Quality optimization
   - Format conversion (JPEG/PNG/WebP)
   - Secure HTTPS delivery

## 🎯 Jewelry-Specific Features

### **Image Folders:**

- `sabri-jewelry/` - Single product images
- `sabri-jewelry-bulk/` - Bulk upload images

### **Optimization Settings:**

- **Max Dimensions**: 800x800px (maintains aspect ratio)
- **Quality**: Auto-optimized for web
- **Format**: Auto-converts to WebP when beneficial
- **File Types**: JPEG, PNG, WebP supported

### **Admin Interface:**

- Real-time upload progress
- Image preview with Cloudinary URLs
- Primary image designation
- Easy image removal
- Upload status indicators

## 🔐 Security Features

- File type validation (JPEG, PNG, WebP only)
- File size limits (10MB per image)
- Secure API endpoints
- Admin authentication required
- HTTPS image delivery

## 📱 Usage Examples

### **Single Product Upload:**

1. Go to "Add New Jewelry Product"
2. Click "Choose Files" or drag images
3. Images upload automatically to Cloudinary
4. URLs are ready for product creation

### **Bulk Upload:**

1. Switch to "Bulk Tools" tab
2. Select multiple jewelry images
3. Click "Upload to Cloudinary"
4. Copy URLs for CSV files

### **CSV Integration:**

- Use Cloudinary URLs in your CSV files
- Separate multiple URLs with `|` (pipe symbol)
- Example: `https://res.cloudinary.com/dhz4my0yx/image/upload/v1234567890/sabri-jewelry/necklace1.jpg|https://res.cloudinary.com/dhz4my0yx/image/upload/v1234567890/sabri-jewelry/necklace2.jpg`

## 🛠️ Troubleshooting

### **Common Issues:**

1. **"No images provided"**

   - Ensure files are selected before upload
   - Check file types (JPEG, PNG, WebP only)

2. **"Files too large"**

   - Reduce image file size (max 10MB per file)
   - Use image compression tools

3. **Upload failures**
   - Check internet connection
   - Verify Cloudinary credentials
   - Check browser console for errors

### **Environment Variables Check:**

```bash
# Verify these are set correctly
echo $CLOUDINARY_CLOUD_NAME  # Should output: dhz4my0yx
echo $CLOUDINARY_API_KEY     # Should output: 653169211298715
```

## 🎨 Image Guidelines for Jewelry

### **Recommended Settings:**

- **Resolution**: 800x800px or higher
- **Format**: JPEG for photos, PNG for transparent backgrounds
- **File Size**: Under 2MB for optimal performance
- **Aspect Ratio**: Square (1:1) works best for jewelry

### **Best Practices:**

- Use high-quality product photos
- Include multiple angles
- Ensure good lighting
- Remove backgrounds when possible
- Use consistent styling across products

## 🔄 Next Steps

1. **Test the Integration**

   - Upload a test jewelry image
   - Verify it appears in Cloudinary dashboard
   - Check the generated URL

2. **Create Sample Products**

   - Use the new image upload feature
   - Test both single and bulk upload
   - Verify CSV template generation

3. **Customize Further**
   - Adjust image transformation settings
   - Add watermarking if needed
   - Set up additional folders for organization

Your Sabri Jewelry admin panel now has professional-grade image management with Cloudinary! 🎉
