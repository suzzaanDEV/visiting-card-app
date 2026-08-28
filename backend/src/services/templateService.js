const Template = require('../models/templateModel');
const logger = require('../utils/logger');

class TemplateService {
  // Get all active templates
  async getAllTemplates(filters = {}) {
    try {
      const query = {};

      if (filters.all) {
        // Admin view — don't filter by isActive
      } else if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      } else {
        query.isActive = true;
      }

      if (filters.category && filters.category !== 'all') {
        query.category = filters.category;
      }

      if (filters.isFeatured !== undefined) {
        query.isFeatured = filters.isFeatured;
      } else if (filters.featured) {
        query.isFeatured = true;
      }

      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      const hasPagination = filters.page !== undefined || filters.limit !== undefined;

      if (hasPagination) {
        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 20;
        const skip = (page - 1) * limit;

        const sort = {};
        if (filters.sortBy) {
          sort[filters.sortBy] = filters.sortOrder === 'asc' ? 1 : -1;
        } else {
          sort.isFeatured = -1;
          sort.usageCount = -1;
          sort.createdAt = -1;
        }

        const [templates, total] = await Promise.all([
          Template.find(query).sort(sort).skip(skip).limit(limit),
          Template.countDocuments(query)
        ]);

        return {
          templates,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        };
      }

      const sort = {};
      if (filters.sortBy) {
        sort[filters.sortBy] = filters.sortOrder === 'asc' ? 1 : -1;
      } else {
        sort.isFeatured = -1;
        sort.usageCount = -1;
        sort.createdAt = -1;
      }

      const templates = await Template.find(query).sort(sort);

      return templates;
    } catch (error) {
      logger.error(`Get all templates error: ${error.message}`);
      throw error;
    }
  }

  // Get template by ID
  async getTemplateById(templateId) {
    try {
      // Find by string id field only
      const template = await Template.findOne({ 
        id: templateId, 
        isActive: true 
      });
      
      if (!template) {
        throw new Error('Template not found');
      }
      
      return template;
    } catch (error) {
      logger.error(`Get template by ID error: ${error.message}`);
      throw error;
    }
  }

  // Create new template
  async createTemplate(templateData, adminId) {
    try {
      const data = { ...templateData };
      const design = data.design || {};

      // The model requires a `preview` subdoc (backgroundColor). The admin UI
      // only manages `design`, so derive preview from design when absent.
      if (!data.preview) {
        data.preview = {
          backgroundColor: design.backgroundColor || '#ffffff',
          textColor: design.textColor || '#1a1a1a',
          fontFamily: design.fontFamily || 'Arial',
          elements: design.elements || []
        };
      }

      const template = new Template({
        ...data,
        createdBy: adminId,
        usageCount: 0
      });
      
      await template.save();
      logger.info(`Template created: ${template.name}`);
      return template;
    } catch (error) {
      logger.error(`Create template error: ${error.message}`);
      throw error;
    }
  }

  // Update template
  async updateTemplate(templateId, updateData) {
    try {
      // Find by string id field only
      const template = await Template.findOneAndUpdate(
        { id: templateId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      if (!template) {
        throw new Error('Template not found');
      }
      
      logger.info(`Template updated: ${template.name}`);
      return template;
    } catch (error) {
      logger.error(`Update template error: ${error.message}`);
      throw error;
    }
  }

  // Delete template (soft delete)
  async deleteTemplate(templateId) {
    try {
      // Find by string id field only
      const template = await Template.findOneAndUpdate(
        { id: templateId },
        { isActive: false, updatedAt: new Date() },
        { new: true }
      );
      
      if (!template) {
        throw new Error('Template not found');
      }
      
      logger.info(`Template deleted: ${template.name}`);
      return template;
    } catch (error) {
      logger.error(`Delete template error: ${error.message}`);
      throw error;
    }
  }

  // Increment usage count
  async incrementUsage(templateId) {
    try {
      // Find by string id field only
      const template = await Template.findOneAndUpdate(
        { id: templateId },
        { $inc: { usageCount: 1 } },
        { new: true }
      );
      
      return template;
    } catch (error) {
      logger.error(`Increment template usage error: ${error.message}`);
      throw error;
    }
  }

  // Get featured templates
  async getFeaturedTemplates(limit = 6) {
    try {
      const templates = await Template.find({ 
        isActive: true, 
        isFeatured: true 
      })
      .sort({ usageCount: -1, createdAt: -1 })
      .limit(limit);
      
      return templates;
    } catch (error) {
      logger.error(`Get featured templates error: ${error.message}`);
      throw error;
    }
  }

  // Get templates by category
  async getTemplatesByCategory(category, limit = 10) {
    try {
      const templates = await Template.find({ 
        isActive: true, 
        category: category 
      })
      .sort({ usageCount: -1, createdAt: -1 })
      .limit(limit);
      
      return templates;
    } catch (error) {
      logger.error(`Get templates by category error: ${error.message}`);
      throw error;
    }
  }

  // Search templates
  async searchTemplates(searchTerm, limit = 20) {
    try {
      const templates = await Template.find({
        isActive: true,
        $text: { $search: searchTerm }
      })
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit);
      
      return templates;
    } catch (error) {
      logger.error(`Search templates error: ${error.message}`);
      throw error;
    }
  }

  // Generate design from template
  async generateDesignFromTemplate(templateId, cardData) {
    try {
      const template = await this.getTemplateById(templateId);
      
      // Merge template design with card data
      const design = {
        backgroundColor: template.design.backgroundColor,
        textColor: template.design.textColor,
        fontFamily: template.design.fontFamily,
        elements: template.design.elements.map(element => {
          // Replace placeholder text with actual card data
          if (element.type === 'Text') {
            const text = element.text;
            if (text.includes('{{fullName}}')) {
              element.text = text.replace('{{fullName}}', cardData.fullName || '');
            }
            if (text.includes('{{jobTitle}}')) {
              element.text = text.replace('{{jobTitle}}', cardData.jobTitle || '');
            }
            if (text.includes('{{company}}')) {
              element.text = text.replace('{{company}}', cardData.company || '');
            }
            if (text.includes('{{email}}')) {
              element.text = text.replace('{{email}}', cardData.email || '');
            }
            if (text.includes('{{phone}}')) {
              element.text = text.replace('{{phone}}', cardData.phone || '');
            }
            if (text.includes('{{website}}')) {
              element.text = text.replace('{{website}}', cardData.website || '');
            }
            if (text.includes('{{address}}')) {
              element.text = text.replace('{{address}}', cardData.address || '');
            }
          }
          return element;
        })
      };
      
      return design;
    } catch (error) {
      logger.error(`Generate design from template error: ${error.message}`);
      throw error;
    }
  }

  // Get template statistics
  async getTemplateStats() {
    try {
      const stats = await Template.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalTemplates: { $sum: 1 },
            totalUsage: { $sum: '$usageCount' },
            featuredTemplates: {
              $sum: { $cond: ['$isFeatured', 1, 0] }
            }
          }
        }
      ]);
      
      const categoryStats = await Template.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalUsage: { $sum: '$usageCount' }
          }
        },
        { $sort: { count: -1 } }
      ]);
      
      return {
        overall: stats[0] || { totalTemplates: 0, totalUsage: 0, featuredTemplates: 0 },
        byCategory: categoryStats
      };
    } catch (error) {
      logger.error(`Get template stats error: ${error.message}`);
      throw error;
    }
  }

  // Add template versioning system
  async createTemplateVersion(templateId, versionData) {
    try {
      const template = await Template.findOne({ id: templateId });
      if (!template) {
        throw new Error('Template not found');
      }
      
      const version = {
        version: template.versions ? template.versions.length + 1 : 1,
        data: versionData,
        createdAt: new Date()
      };
      
      if (!template.versions) {
        template.versions = [];
      }
      template.versions.push(version);
      await template.save();
      return template;
    } catch (error) {
      logger.error(`Create template version error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new TemplateService(); 