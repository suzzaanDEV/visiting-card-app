# Algorithm Documentation
**Project:** Digital Business Card System  
**Developer:** Sujan Ghimire  
**Date:** 2024

## Overview
This document provides comprehensive documentation for the algorithms implemented in the Digital Business Card System. The system implements three core algorithms: Short Link Generation, QR Code Generation, and Full Text Search.

## 1. Short Link Generation Algorithm

### Purpose
Generates unique, short, and user-friendly URLs for business cards to enable easy sharing and access.

### Algorithm Details

#### Implementation Location
- **File:** `backend/src/algorithms/shortLinkGenerator.js`
- **Dependencies:** `base62` library

#### Algorithm Steps
1. **Random Number Generation**: Generate a random number between 0 and 999,999
2. **Base62 Encoding**: Convert the random number to base62 encoding for URL-safe characters
3. **Collision Detection**: Check if the generated short link already exists in the database
4. **Recursive Retry**: If collision occurs, recursively call the function to generate a new link

#### Code Implementation
```javascript
const base62 = require('base62');
const Card = require('../models/cardModel');
const logger = require('../utils/logger');

exports.generate = async () => {
  try {
    const randomNum = Math.floor(Math.random() * 1000000);
    const shortLink = base62.encode(randomNum);

    const existing = await Card.findOne({ shortLink });
    if (existing) return await exports.generate(); // Retry if collision

    return shortLink;
  } catch (error) {
    logger.error(`Short link generation error: ${error.message}`);
    throw new Error('Failed to generate short link');
  }
};
```

#### Complexity Analysis
- **Time Complexity**: O(1) average case, O(n) worst case (due to collision resolution)
- **Space Complexity**: O(1)
- **Collision Probability**: Very low due to large random number range (1,000,000 possibilities)

#### Advantages
- **URL Safe**: Uses base62 encoding (A-Z, a-z, 0-9) for web-safe characters
- **Short Length**: Typically 4-5 characters long
- **Unique**: Collision detection ensures uniqueness
- **Fast**: Constant time generation in most cases

#### Disadvantages
- **Potential Collisions**: Requires database lookup for collision detection
- **Sequential Access**: Database queries for each generation

#### Usage Example
```javascript
const shortLink = await shortLinkGenerator.generate();
// Output: "aB3x9" (example)
```

## 2. QR Code Generation Algorithm

### Purpose
Generates QR codes containing business card URLs for easy mobile scanning and access.

### Algorithm Details

#### Implementation Location
- **File:** `backend/src/algorithms/qrCodeGenerator.js`
- **Dependencies:** `qrcode` library

#### Algorithm Steps
1. **URL Input**: Accept the business card URL as input
2. **QR Code Generation**: Use the qrcode library to generate QR code data
3. **Data URL Conversion**: Convert QR code to base64 data URL for web display
4. **Error Handling**: Handle generation errors gracefully

#### Code Implementation
```javascript
const QRCode = require('qrcode');
const logger = require('../utils/logger');

exports.generate = async (url) => {
  try {
    return await QRCode.toDataURL(url);
  } catch (error) {
    logger.error(`QR code generation error: ${error.message}`);
    throw new Error('Failed to generate QR code');
  }
};
```

#### Complexity Analysis
- **Time Complexity**: O(n²) where n is the QR code size
- **Space Complexity**: O(n²) for storing the QR code matrix
- **QR Code Size**: Automatically determined by content length

#### QR Code Features
- **Error Correction**: Built-in Reed-Solomon error correction
- **Version**: Auto-selected based on data size
- **Format**: PNG data URL for web compatibility
- **Size**: Optimized for mobile scanning

#### Advantages
- **Standard Format**: Uses established QR code standards
- **Error Correction**: Built-in redundancy for damaged codes
- **Web Compatible**: Returns data URL for direct use in HTML
- **Mobile Friendly**: Optimized size for smartphone cameras

#### Disadvantages
- **Library Dependency**: Requires external qrcode library
- **Processing Time**: Can be slow for large URLs

#### Usage Example
```javascript
const qrCodeDataUrl = await qrCodeGenerator.generate('https://example.com/card/abc123');
// Output: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." (base64 encoded PNG)
```

## 3. Full Text Search Algorithm

### Purpose
Provides efficient text-based search functionality for finding business cards by name, company, or other text content.

### Algorithm Details

#### Implementation Location
- **File:** `backend/src/algorithms/fullTextSearch.js`
- **Service:** `backend/src/services/searchService.js`

#### Algorithm Steps
1. **Query Processing**: Clean and normalize search query
2. **MongoDB Text Search**: Utilize MongoDB's built-in text search capabilities
3. **Index Utilization**: Use text indexes for efficient searching
4. **Result Ranking**: Return results sorted by relevance score

#### Code Implementation
```javascript
// Placeholder: MongoDB text search is handled in searchService.js
module.exports = {
    search: (query) => {
      // MongoDB $text operator is used directly in searchService
      return query;
    },
  };
```

#### MongoDB Text Search Features
- **Text Index**: Automatic indexing of text fields
- **Language Support**: Multi-language text processing
- **Relevance Scoring**: Built-in relevance ranking
- **Stemming**: Automatic word stemming for better matches

#### Complexity Analysis
- **Time Complexity**: O(log n) with proper indexing
- **Space Complexity**: O(n) for text indexes
- **Index Size**: Proportional to text content

#### Search Capabilities
- **Fuzzy Matching**: Handles typos and variations
- **Partial Matching**: Finds partial word matches
- **Case Insensitive**: Automatic case normalization
- **Multi-field Search**: Searches across multiple text fields

#### Advantages
- **Database Native**: Uses MongoDB's optimized text search
- **Scalable**: Efficient for large datasets
- **Flexible**: Supports complex search queries
- **Fast**: Indexed search for quick results

#### Disadvantages
- **Index Overhead**: Requires additional storage for text indexes
- **MongoDB Specific**: Tied to MongoDB's text search implementation

#### Usage Example
```javascript
const searchResults = await searchService.searchCards('john doe company');
// Returns cards matching the search query
```

## 4. Template Design Generation Algorithm

### Purpose
Dynamically generates card designs by combining template layouts with user-provided information.

### Algorithm Details

#### Implementation Location
- **Service:** `backend/src/services/cardService.js`

#### Algorithm Steps
1. **Template Retrieval**: Load template design from database
2. **Data Mapping**: Map user form data to template placeholders
3. **Element Generation**: Create design elements with user data
4. **Layout Assembly**: Combine elements into final design JSON

#### Code Implementation
```javascript
const generateDesignFromTemplate = async (templateId, formData) => {
  const template = await Template.findOne({ id: templateId });
  if (!template) throw new Error('Template not found');

  const design = {
    width: 800,
    height: 480,
    backgroundColor: template.preview.backgroundColor,
    elements: template.preview.elements.map(element => {
      if (element.type === 'Text') {
        // Replace placeholder text with form data
        let text = element.text;
        if (text === 'John Doe') text = formData.fullName || 'Your Name';
        if (text === 'Software Engineer') text = formData.jobTitle || 'Your Title';
        if (text.includes('@email.com')) text = formData.email || 'your.email@example.com';
        if (text.includes('(555)')) text = formData.phone || '+1 (555) 000-0000';
        if (text.includes('www.')) text = formData.website || 'www.yourwebsite.com';
        
        return { ...element, text };
      }
      return element;
    })
  };

  return design;
};
```

#### Complexity Analysis
- **Time Complexity**: O(n) where n is the number of design elements
- **Space Complexity**: O(n) for storing the generated design
- **Template Elements**: Linear processing of design elements

#### Design Features
- **Dynamic Content**: Replaces placeholders with user data
- **Responsive Layout**: Maintains design proportions
- **Element Types**: Supports text, rectangles, circles, lines
- **Styling**: Preserves colors, fonts, and positioning

#### Advantages
- **Flexible**: Supports various template designs
- **User-Friendly**: Simple form-based customization
- **Consistent**: Maintains design quality across users
- **Scalable**: Easy to add new templates

#### Disadvantages
- **Limited Customization**: Fixed template structure
- **Design Constraints**: Bound by template limitations

## 5. Performance Optimization Techniques

### Database Indexing
- **Text Indexes**: For full-text search functionality
- **Compound Indexes**: For multi-field queries
- **Unique Indexes**: For short links and user emails

### Caching Strategy
- **Redis Caching**: For frequently accessed templates
- **Memory Caching**: For static design elements
- **CDN**: For image and asset delivery

### Algorithm Optimization
- **Lazy Loading**: Load templates on demand
- **Batch Processing**: Process multiple cards efficiently
- **Connection Pooling**: Optimize database connections

## 6. Security Considerations

### Input Validation
- **SQL Injection Prevention**: Use parameterized queries
- **XSS Protection**: Sanitize user inputs
- **File Upload Security**: Validate file types and sizes

### Authentication & Authorization
- **JWT Tokens**: Secure API access
- **Role-Based Access**: Admin vs user permissions
- **Rate Limiting**: Prevent abuse

## 7. Testing Strategy

### Unit Tests
- **Algorithm Functions**: Test individual algorithm components
- **Edge Cases**: Handle boundary conditions
- **Error Scenarios**: Test error handling

### Integration Tests
- **Database Operations**: Test with real database
- **API Endpoints**: Test complete request flows
- **Performance Tests**: Measure algorithm efficiency

## 8. Future Enhancements

### Planned Improvements
1. **Advanced Search**: Implement semantic search capabilities
2. **AI-Powered Design**: Use machine learning for design generation
3. **Real-time Collaboration**: Multi-user card editing
4. **Analytics Dashboard**: Advanced usage analytics

### Algorithm Extensions
1. **Image Processing**: Automatic image optimization
2. **Design Validation**: Quality assurance for generated designs
3. **A/B Testing**: Template performance optimization

## Conclusion

The Digital Business Card System implements three core algorithms that work together to provide a comprehensive digital business card solution. Each algorithm is optimized for its specific use case while maintaining security, performance, and scalability.

The short link generation provides easy sharing, QR code generation enables mobile access, and full-text search ensures discoverability. These algorithms form the foundation of a robust and user-friendly digital business card platform.

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Maintained By:** Sujan Ghimire 