const Policy = require('../models/policyModel');
const AuditLog = require('../models/auditLogModel');

const policyService = {
  async createPolicy(data, adminId) {
    try {
      const policy = await Policy.create({ ...data, createdBy: adminId, updatedBy: adminId });
      await AuditLog.log({ action: 'policy.create', entityType: 'policy', entityId: policy._id, adminId, metadata: { title: policy.title, slug: policy.slug } });
      return policy;
    } catch (err) {
      if (err && err.code === 11000) {
        throw new Error('A policy with this slug already exists');
      }
      throw err;
    }
  },

  async updatePolicy(slug, data, adminId) {
    const policy = await Policy.findOneAndUpdate({ slug }, { ...data, updatedBy: adminId }, { new: true });
    if (!policy) throw new Error('Policy not found');
    await AuditLog.log({ action: 'policy.update', entityType: 'policy', entityId: policy._id, adminId, metadata: { title: policy.title, changes: Object.keys(data) } });
    return policy;
  },

  async getPolicy(slug) {
    return Policy.findOne({ slug, isPublished: true }).select('-acceptedBy');
  },

  async getPolicyForAdmin(slug) {
    return Policy.findOne({ slug });
  },

  // Public list: published documents only, no per-user acceptance data.
  async getAllPolicies() {
    return Policy.find({ isPublished: true }).select('-acceptedBy').sort({ createdAt: -1 });
  },

  // Admin list: every document (drafts included), with acceptance data.
  async getAllPoliciesAdmin() {
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
    // Guard against malformed entries lacking a userId (defensive against
    // prior partial writes); compare only records that carry a userId.
    const byUser = policy.acceptedBy.filter((a) => a.userId);
    const alreadyAccepted = byUser.some((a) => String(a.userId) === String(userId));
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
    return (policy.acceptedBy || []).some((a) => a.userId && String(a.userId) === String(userId));
  },

  // Seed default legal documents if the collection is empty so /privacy and
  // /terms always resolve. Content is DB-driven and fully editable in admin.
  async seedDefaults() {
    const count = await Policy.countDocuments();
    if (count > 0) return { seeded: false };
    const defaults = [
      {
        slug: 'privacy-policy',
        title: 'Privacy Policy',
        summary: 'How Cardly collects, uses, and protects your personal information.',
        version: '1.0',
        isPublished: true,
        isRequired: true,
        content: `# Cardly Privacy Policy\n\n_Last updated:_ January 1, 2026\n\n## 1. Information We Collect\n\n- **Account data** – name, email address, phone number, and profile details you provide when creating an account.\n- **Card data** – the professional information, images, and designs you add to your digital visiting cards.\n- **Usage data** – pages visited, cards viewed, and interaction events (views, loves, saves) used for analytics.\n\n## 2. How We Use Your Information\n\nWe use your information to:\n\n- Provide, personalize, and improve the Cardly service\n- Display your cards in public discovery when you choose to publish them\n- Send service notifications you have opted into\n- Maintain security, prevent abuse, and analyse platform performance\n\n## 3. Information Sharing\n\nWe do **not** sell your personal data. Public cards are visible to anyone with the link or through discovery; private cards are only shown to people you have granted access.\n\n## 4. Data Security\n\nWe use HTTPS, secure password hashing, rotating authentication tokens, and rate limiting to protect your data. No system is completely secure, and we encourage strong unique passwords.\n\n## 5. Data Retention\n\nAccount data is retained while your account is active. You can request deletion at any time by contacting us.\n\n## 6. Your Rights\n\nYou may update or delete your account information at any time from your profile settings.`,
      },
      {
        slug: 'terms-of-service',
        title: 'Terms of Service',
        summary: 'The rules and conditions for using Cardly.',
        version: '1.0',
        isPublished: true,
        isRequired: true,
        content: `# Cardly Terms of Service\n\n_Last updated:_ January 1, 2026\n\n## 1. Acceptance of Terms\n\nBy creating an account or using Cardly you agree to these Terms of Service and our Privacy Policy.\n\n## 2. Your Account\n\n- You are responsible for the accuracy of the information on your cards.\n- Keep your credentials secure; you are responsible for activity on your account.\n- You must be at least 13 years old to use Cardly.\n\n## 3. Acceptable Use\n\nYou agree not to:\n\n- Publish unlawful, misleading, or malicious content\n- Impersonate other people or organisations\n- Attempt to gain unauthorised access to other accounts or systems\n- Abuse rate-limited APIs or scrape the platform at scale\n\n## 4. Content You Publish\n\nYou retain ownership of the content you publish. You grant Cardly a limited licence to store, display, and transmit your content to operate the service.\n\n## 5. Our Service\n\nWe may modify or discontinue features, and may suspend or terminate accounts that violate these terms.\n\n## 6. Limitation of Liability\n\nCardly is provided "as is" without warranties of any kind, and our liability is limited to the fullest extent permitted by law.\n\n## 7. Contact\n\nQuestions about these terms? Contact us via the Contact page.`,
      },
      {
        slug: 'cookie-policy',
        title: 'Cookie Policy',
        summary: 'How Cardly uses cookies and local storage to improve your experience.',
        version: '1.0',
        isPublished: true,
        isRequired: false,
        content: `# Cardly Cookie Policy\n\n_Last updated:_ January 1, 2026\n\n## 1. What Are Cookies?\n\nCookies are small text files stored on your device that help websites remember your preferences.\n\n## 2. Cookies We Use\n\n- **Essential** – required for authentication and security (for example, your login state).\n- **Preferences** – remember your theme choice and cookie preferences.\n- **Analytics** – anonymous usage statistics that help us improve the product.\n\n## 3. Managing Cookies\n\nYou can block or delete cookies through your browser settings. Essential cookies cannot be disabled while using the service.\n\n## 4. Local Storage\n\nCardly uses browser local storage to persist lightweight preferences such as your chosen theme and cookie consent choice. This data stays on your device.`,
      },
    ];
    await Policy.insertMany(defaults);
    return { seeded: true };
  },
};

module.exports = policyService;
