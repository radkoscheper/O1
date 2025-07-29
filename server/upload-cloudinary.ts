import { Router } from 'express';
import multer from 'multer';
import CloudinaryService from './cloudinary.js';

const router = Router();

// Multer configuration for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Upload image to Cloudinary
router.post('/cloudinary', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { folder = 'ontdek-polen', public_id, transformations } = req.body;

    // Parse transformations if provided
    let parsedTransformations = {};
    if (transformations) {
      try {
        parsedTransformations = JSON.parse(transformations);
      } catch (e) {
        console.warn('Invalid transformations JSON:', transformations);
      }
    }

    // Upload to Cloudinary
    const result = await CloudinaryService.uploadImage(req.file.buffer, {
      folder,
      public_id,
      transformation: parsedTransformations,
    });

    res.json({
      success: true,
      data: result,
      message: 'Image uploaded successfully to Cloudinary',
    });

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({
      error: 'Failed to upload image',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// List images from Cloudinary folder
router.get('/cloudinary/list/:folder?', async (req, res) => {
  try {
    const folder = req.params.folder || 'ontdek-polen';
    const images = await CloudinaryService.listImages(folder);

    res.json({
      success: true,
      data: images,
      total: images.length,
    });

  } catch (error) {
    console.error('Cloudinary list error:', error);
    res.status(500).json({
      error: 'Failed to list images',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Delete image from Cloudinary
router.delete('/cloudinary/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    const success = await CloudinaryService.deleteImage(publicId);

    if (success) {
      res.json({
        success: true,
        message: 'Image deleted successfully',
      });
    } else {
      res.status(400).json({
        error: 'Failed to delete image',
        message: 'Image not found or deletion failed',
      });
    }

  } catch (error) {
    console.error('Cloudinary delete error:', error);
    res.status(500).json({
      error: 'Failed to delete image',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Generate optimized URL
router.post('/cloudinary/url', async (req, res) => {
  try {
    const { publicId, transformations = {} } = req.body;

    if (!publicId) {
      return res.status(400).json({ error: 'Public ID is required' });
    }

    const optimizedUrl = CloudinaryService.getOptimizedUrl(publicId, transformations);

    res.json({
      success: true,
      url: optimizedUrl,
    });

  } catch (error) {
    console.error('Cloudinary URL generation error:', error);
    res.status(500).json({
      error: 'Failed to generate URL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;