const Policy = require('../models/policyModel');
const AuditLog = require('../models/auditLogModel');

const policyService = {
  async createPolicy(data, adminId) {
    const policy = await Policy.create({ ...data, createdBy: adminId, updatedBy: adminId });
    await AuditLog.log({ action: 'policy.create', entityType: 'policy', entityId: policy._id, adminId, metadata: { title: policy.title, slug: policy.slug } });
    return policy;
  },

  async updatePolicy(slug, data, adminId) {
    const policy = await Policy.findOneAndUpdate({ slug }, { ...data, updatedBy: adminId }, { new: true });
    if (!policy) throw new Error('Policy not found');
    await AuditLog.log({ action: 'policy.update', entityType: 'policy', entityId: policy._id, adminId, metadata: { title: policy.title, changes: Object.keys(data) } });
    return policy;
  },

  async getPolicy(slug) {
    return Policy.findOne({ slug, isPublished: true });
  },

  async getPolicyForAdmin(slug) {
    return Policy.findOne({ slug });
  },

  async getAllPolicies() {
    return Policy.find().sort({ createdAt: -1 });
  },

  async publishPolicy(slug, adminId) {
    const policy = await Policy.findOneAndUpdate({ slug }, { isPublished: true, updatedBy: adminId }, { new: true });
    if (!policy) throw new Error('Policy not found');
    await AuditLog.log({ action: 'policy.publish', entityType: 'policy', entityId: policy._id, adminId, metadata: { title: policy.title } });
    return policy;
  },

  async deletePolicy(slug, adminId) {
    const policy = await Policy.findOneAndDelete({ slug });
    if (!policy) throw new Error('Policy not found');
    await AuditLog.log({ action: 'policy.update', entityType: 'policy', entityId: policy._id, adminId, metadata: { title: policy.title, action: 'delete' } });
    return policy;
  },

  async acceptPolicy(slug, userId) {
    const policy = await Policy.findOne({ slug, isPublished: true });
    if (!policy) throw new Error('Policy not found');
    const alreadyAccepted = policy.acceptedBy.some(a => a.userId.toString() === userId.toString());
    if (!alreadyAccepted) {
      policy.acceptedBy.push({ userId, version: policy.version });
      policy.acceptedCount += 1;
      await policy.save();
    }
    return policy;
  },

  async hasUserAccepted(slug, userId) {
    const policy = await Policy.findOne({ slug });
    if (!policy) return false;
    return policy.acceptedBy.some(a => a.userId.toString() === userId.toString());
  }
};

module.exports = policyService;
