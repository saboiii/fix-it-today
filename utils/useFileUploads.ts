import { useState, useEffect } from "react";

export async function compressAndConvertImage(file: File, maxSizeKB = 300): Promise<File> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);

        ctx.drawImage(img, 0, 0);

        let quality = 0.92;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);

        while (dataUrl.length / 1024 > maxSizeKB && quality > 0.4) {
          quality -= 0.07;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        
        fetch(dataUrl)
          .then(res => res.arrayBuffer())
          .then(buf => {
            const jpgFile = new File(
              [buf],
              file.name.replace(/\.(png|jpeg|jpg)$/i, ".jpg"),
              { type: "image/jpeg" }
            );
            resolve(jpgFile);
          });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function useFileUploads(product?: Product) {
  const [images, setImages] = useState<File[]>([]); // Holds NEW File objects for images
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // Holds ALL URLs (S3 or blob) for images

  const [models, setModels] = useState<File[]>([]); // Holds NEW File objects for models
  const [modelUrls, setModelUrls] = useState<string[]>([]); // Holds ALL URLs (S3 or blob) for models

  useEffect(() => {
    if (product) {
      // Initialize images
      setImagePreviews(product.images || []);
      setImages([]); // New files are empty on init

      // Initialize models
      setModelUrls(product.downloadableAssets || []);
      setModels([]); // New files are empty on init
    } else {
      // Reset for new product form
      setImagePreviews([]);
      setImages([]);
      setModelUrls([]);
      setModels([]);
    }
  }, [product]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImageFiles: File[] = [];
    const newImageBlobUrls: string[] = [];

    // Calculate current total images (S3 + new blobs)
    const currentTotalImages = imagePreviews.length;

    for (const file of files) {
      if (currentTotalImages + newImageBlobUrls.length >= 7) {
        alert("You can upload a maximum of 7 images.");
        break;
      }
      // const processedFile = await compressAndConvertImage(file); // If using compression
      // newImageFiles.push(processedFile);
      // newImageBlobUrls.push(URL.createObjectURL(processedFile));
      newImageFiles.push(file); // Store original File
      newImageBlobUrls.push(URL.createObjectURL(file)); // Store its blob URL
    }

    setImages(prev => [...prev, ...newImageFiles]);
    setImagePreviews(prev => [...prev, ...newImageBlobUrls]);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const removedPreviewUrl = imagePreviews[indexToRemove];
    setImagePreviews(prev => prev.filter((_, idx) => idx !== indexToRemove));

    if (removedPreviewUrl.startsWith("blob:")) {
      // If it was a blob URL, find and remove the corresponding File object from `images`
      // This assumes that blob URLs in imagePreviews directly correspond to files in `images` by order of addition.
      // A more robust method might involve IDs if order is not guaranteed.
      let newFileIndexToRemove = -1;
      let blobCount = 0;
      for(let i = 0; i < imagePreviews.length; i++) { // Iterate original imagePreviews before filtering
          if(imagePreviews[i].startsWith("blob:")) {
              if(imagePreviews[i] === removedPreviewUrl) { // Match the specific blob URL
                  newFileIndexToRemove = blobCount;
                  break;
              }
              blobCount++;
          }
      }
      if (newFileIndexToRemove !== -1) {
          setImages(prevFiles => prevFiles.filter((_, idx) => idx !== newFileIndexToRemove));
      }
      URL.revokeObjectURL(removedPreviewUrl);
    }
    // If it's an S3 URL, only the preview is removed. Backend handles S3 deletion if needed.
  };
  
  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newModelFiles: File[] = [];
    const newModelBlobUrls: string[] = [];
    const MODEL_WARN_THRESHOLD_MB = 25;
    const MODEL_HARD_LIMIT_MB = 50;
    const MODEL_WARN_THRESHOLD_BYTES = MODEL_WARN_THRESHOLD_MB * 1024 * 1024;
    const MODEL_HARD_LIMIT_BYTES = MODEL_HARD_LIMIT_MB * 1024 * 1024;

    for (const file of files) {
      if (file.size > MODEL_HARD_LIMIT_BYTES) {
        alert(
          `File "${file.name}" (${(file.size / 1024 / 1024).toFixed(
            2
          )} MB) exceeds the maximum allowed size of ${MODEL_HARD_LIMIT_MB} MB and will not be uploaded.`
        );
        continue; // Skip this file
      }

      if (file.size > MODEL_WARN_THRESHOLD_BYTES) {
        alert(
          `Warning: File "${file.name}" (${(file.size / 1024 / 1024).toFixed(
            2
          )} MB) is larger than ${MODEL_WARN_THRESHOLD_MB} MB. Uploads may be slow. Consider optimizing the model.`
        );
      }

      // Add any model count limits if necessary
      newModelFiles.push(file);
      newModelBlobUrls.push(URL.createObjectURL(file));
    }
    setModels(prev => [...prev, ...newModelFiles]);
    setModelUrls(prev => [...prev, ...newModelBlobUrls]);
  };

  const handleRemoveModel = (indexToRemove: number) => {
    const removedModelUrl = modelUrls[indexToRemove];
    setModelUrls(prev => prev.filter((_, idx) => idx !== indexToRemove));

    if (removedModelUrl.startsWith("blob:")) {
      // Similar logic to handleRemoveImage for finding the corresponding File in `models`
      let newFileIndexToRemove = -1;
      let blobCount = 0;
       for(let i = 0; i < modelUrls.length; i++) { // Iterate original modelUrls before filtering
          if(modelUrls[i].startsWith("blob:")) {
              if(modelUrls[i] === removedModelUrl) {
                  newFileIndexToRemove = blobCount;
                  break;
              }
              blobCount++;
          }
      }
      if (newFileIndexToRemove !== -1) {
        setModels(prevFiles => prevFiles.filter((_, idx) => idx !== newFileIndexToRemove));
      }
      URL.revokeObjectURL(removedModelUrl);
    }
  };

  return {
    images, // NEW File objects
    imagePreviews, // ALL URLs (S3 or blob)
    handleImageChange,
    handleRemoveImage,
    models, // NEW File objects
    modelUrls, // ALL URLs (S3 or blob) - formerly modelNames
    handleModelChange,
    handleRemoveModel,
  };
}