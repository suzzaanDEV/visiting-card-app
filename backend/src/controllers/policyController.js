const policyService = require('../services/policyService');

exports.createPolicy = async (req, res) => {
  try {
    const policy = await policyService.createPolicy(req.body, req.admin._id);
    res.status(201).json(policy);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    const policy = await policyService.updatePolicy(req.params.slug, req.body, req.admin._id);
    res.json(policy);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getPolicy = async (req, res) => {
  try {
    const policy = await policyService.getPolicy(req.params.slug);
    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    res.json(policy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPolicyForAdmin = async (req, res) => {
  try {
    const policy = await policyService.getPolicyForAdmin(req.params.slug);
    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    res.json(policy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllPolicies = async (req, res) => {
  try {
    const policies = await policyService.getAllPolicies();
    res.json(policies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllPoliciesAdmin = async (req, res) => {
  try {
    const policies = await policyService.getAllPoliciesAdmin();
    res.json(policies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.publishPolicy = async (req, res) => {
  try {
    const policy = await policyService.publishPolicy(req.params.slug, req.admin._id);
    res.json(policy);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deletePolicy = async (req, res) => {
  try {
    await policyService.deletePolicy(req.params.slug, req.admin._id);
    res.json({ message: 'Policy deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.acceptPolicy = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const policy = await policyService.acceptPolicy(req.params.slug, userId);
    res.json({ message: 'Policy accepted', policy });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.checkPolicyAccepted = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const accepted = await policyService.hasUserAccepted(req.params.slug, userId);
    res.json({ accepted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
