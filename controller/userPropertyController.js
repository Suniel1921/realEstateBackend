// const fs = require('fs');
// const cloudinary = require('cloudinary').v2;
// const Property = require('../model/userPropertModel');
// const mongoose = require('mongoose'); // Add mongoose to check for ObjectId validation
// const MAX_FILE_SIZE = 20 * 1024 * 1024; // 10MB in bytes

// async function isFileSupported(type) {
//   const supportedTypes = ['jpg', 'jpeg', 'png'];
//   return supportedTypes.includes(type);
// }

// async function uploadFileToCloudinary(file, folder, quality) {
//   const options = { folder, resource_type: 'auto' };
//   if (quality) {
//     options.quality = quality;
//   }
//   const result = await cloudinary.uploader.upload(file.tempFilePath, options);
//   // Delete the temporary file after upload
//   fs.unlink(file.tempFilePath, (err) => {
//     if (err) {
//       console.error(`Failed to delete temp file ${file.tempFilePath}:`, err);
//     }
//   });
//   return result;
// }

// exports.userRegisterProperty = async (req, res) => {
//   try {
//     let files = req.files && req.files.images ? req.files.images : [];
//     let uploadedImages = [];

//     if (!Array.isArray(files)) {
//       files = [files];
//     }

//     const fileUploadPromises = files.map(async (file) => {
//       const fileType = file.name.split('.').pop().toLowerCase();
//       const fileSize = file.size;

//       if (fileSize > MAX_FILE_SIZE) {
//         throw new Error(`File size too large. Got ${fileSize}. Maximum is ${MAX_FILE_SIZE}.`);
//       }

//       if (!(await isFileSupported(fileType))) {
//         throw new Error('File format is not supported');
//       }

//       const response = await uploadFileToCloudinary(file, 'userImages', 90);
//       return response.secure_url;
//     });

//     uploadedImages = await Promise.all(fileUploadPromises);

//     const { propertyListingCategoryId, ...restBody } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(propertyListingCategoryId)) {
//       return res.status(400).json({ success: false, message: 'Invalid property listing category ID' });
//     }

//     const propertyData = {
//       ...restBody,
//       images: uploadedImages,
//       propertyListingCategory: propertyListingCategoryId // Ensure the correct field name
//     };

//     const property = new Property(propertyData);
//     await property.save();
//     res.status(201).json({ success: true, property });
//   } catch (error) {
//     console.error('Error while registering property:', error);
//     res.status(500).json({ success: false, message: `Error while registering property: ${error.message}` });
//   }
// };






const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const Property = require('../model/userPropertModel');
const mongoose = require('mongoose');
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes

// Function to check if the file type is supported
async function isFileSupported(type) {
  const supportedTypes = ['jpg', 'jpeg', 'png'];
  return supportedTypes.includes(type);
}

// Function to upload a file to Cloudinary
async function uploadFileToCloudinary(file, folder, quality) {
  const options = { folder, resource_type: 'auto' };
  if (quality) {
    options.quality = quality;
  }
  const result = await cloudinary.uploader.upload(file.tempFilePath, options);
  // Delete the temporary file after upload
  fs.unlink(file.tempFilePath, (err) => {
    if (err) {
      console.error(`Failed to delete temp file ${file.tempFilePath}:`, err);
    }
  });
  return result;
}

// Controller to handle property registration
exports.userRegisterProperty = async (req, res) => {
  try {
    let files = req.files && req.files.images ? req.files.images : [];
    let uploadedImages = [];

    if (!Array.isArray(files)) {
      files = [files];
    }

    const fileUploadPromises = files.map(async (file) => {
      const fileType = file.name.split('.').pop().toLowerCase();
      const fileSize = file.size;

      if (fileSize > MAX_FILE_SIZE) {
        throw new Error(`File size too large. Got ${fileSize}. Maximum is ${MAX_FILE_SIZE}.`);
      }

      if (!(await isFileSupported(fileType))) {
        throw new Error('File format is not supported');
      }

      const response = await uploadFileToCloudinary(file, 'userImages', 90);
      return response.secure_url;
    });

    uploadedImages = await Promise.all(fileUploadPromises);

    const { propertyListingCategoryId, ...restBody } = req.body;

    if (!mongoose.Types.ObjectId.isValid(propertyListingCategoryId)) {
      return res.status(400).json({ success: false, message: 'Invalid property listing category ID' });
    }

    const propertyData = {
      ...restBody,
      images: uploadedImages,
      propertyListingCategory: propertyListingCategoryId // Ensure the correct field name
    };

    const property = new Property(propertyData);
    await property.save();
    res.status(201).json({ success: true, property });
  } catch (error) {
    console.error('Error while registering property:', error);
    res.status(500).json({ success: false, message: `Error while registering property: ${error.message}` });
  }
};




// get all data
exports.getAllUserProperty = async (req, res) => {
  try {
      const allProperties = await Property.find({});
      if (allProperties.length === 0) {
          return res.status(400).json({ success: false, message: "No property found" });
      }
      return res.status(200).json({ success: true, message: "All property found", allProperties });
  } catch (error) {
      return res.status(500).json({ success: false, message: `Internal Server Error ${error}` });
  }
};





//get single user property
exports.singleUserProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const singleProperty = await Property.findById(id);

    if (!singleProperty) {
      return res.status(404).json({ success: false, message: 'No single property found' });
    }

    return res.status(200).json({ success: true, message: 'Single user property found', singleProperty });
  } catch (error) {
    console.error("Error while fetching property:", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};



// Update property
exports.updateProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const updateData = req.body;

    // Check if the property ID is valid
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ success: false, message: 'Invalid property ID' });
    }

    // Find the property by ID and update it
    const updatedProperty = await Property.findByIdAndUpdate(propertyId, updateData, { new: true });

    if (!updatedProperty) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    return res.status(200).json({ success: true, message: 'Property updated successfully', updatedProperty });
  } catch (error) {
    console.error("Error while updating property:", error);
    return res.status(500).json({ success: false, message: `Error while updating property: ${error.message}` });
  }
};








//delete property

exports.deleteProperty = async (req, res) => {
  try {
      const propertyId = req.params.id;
      const property = await Property.findByIdAndDelete(propertyId);

      if (!property) {
          return res.status(404).json({ success: false, message: "Property not found" });
      }

      return res.status(200).json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
      console.error("Error while deleting property:", error);
      return res.status(500).json({ success: false, message: `Error while deleting property: ${error.message}` });
  }
};









//get related products based on category

exports.getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL path parameters
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    const propertyListingCategory = property.propertyListingCategory; // Retrieve the property listing category from the property

    // Query the database to find related products based on the property listing category
    const relatedProducts = await Property.find({
      propertyListingCategory: propertyListingCategory, // Filter by the same property listing category
      _id: { $ne: id } // Exclude the current property itself
    }).limit(5); // Limiting to 5 related products for example

    res.json({ success: true, relatedProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


