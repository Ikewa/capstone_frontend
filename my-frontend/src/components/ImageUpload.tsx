import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  CircularProgress,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

interface ImageUploadProps {
  maxImages?: number;
  maxSizeMB?: number;
  uploadEndpoint: string;
  onImagesUploaded: (urls: string[]) => void;
  buttonText?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  maxImages = 5,
  maxSizeMB = 5,
  uploadEndpoint,
  onImagesUploaded,
  buttonText = 'Add Photos'
}) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + selectedImages.length > maxImages) {
      alert(`You can upload maximum ${maxImages} images`);
      return;
    }

    const invalidFiles = files.filter(file => file.size > maxSizeMB * 1024 * 1024);
    if (invalidFiles.length > 0) {
      alert(`Each image must be less than ${maxSizeMB}MB`);
      return;
    }

    setSelectedImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setUploadedUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (selectedImages.length === 0) return [];

    try {
      setUploading(true);
      const formData = new FormData();
      selectedImages.forEach(image => {
        formData.append('images', image);
      });

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/upload/${uploadEndpoint}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const urls = response.data.imageUrls || [response.data.imageUrl];
      setUploadedUrls(urls);
      onImagesUploaded(urls);
      return urls;
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
      return [];
    } finally {
      setUploading(false);
    }
  };

  // Auto-upload when images are selected
  React.useEffect(() => {
    if (selectedImages.length > 0 && uploadedUrls.length === 0) {
      uploadImages();
    }
  }, [selectedImages]);

  return (
    <Box>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id={`image-upload-${uploadEndpoint}`}
        type="file"
        multiple
        onChange={handleImageSelect}
      />
      <label htmlFor={`image-upload-${uploadEndpoint}`}>
        <Button
          variant="outlined"
          component="span"
          startIcon={uploading ? <CircularProgress size={20} /> : <PhotoCameraIcon />}
          disabled={selectedImages.length >= maxImages || uploading}
          fullWidth
        >
          {uploading ? 'Uploading...' : 
           selectedImages.length === 0 ? buttonText : 
           `${buttonText} (${selectedImages.length}/${maxImages})`}
        </Button>
      </label>

      {imagePreviews.length > 0 && (
        <ImageList sx={{ mt: 2 }} cols={3} rowHeight={164}>
          {imagePreviews.map((preview, index) => (
            <ImageListItem key={index}>
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                loading="lazy"
                style={{ objectFit: 'cover', height: '100%' }}
              />
              <ImageListItemBar
                actionIcon={
                  <IconButton
                    sx={{ color: 'rgba(255, 255, 255, 0.9)' }}
                    onClick={() => handleRemoveImage(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}
    </Box>
  );
};

export default ImageUpload;
