const SENSITIVE_FIELDS = [
  'email',
  'phone',
  'mobile',
  'fax',
  'website',
  'address',
  'city',
  'state',
  'country',
  'postalCode',
  'socialLinks',
];

const getOwnerId = (ownerUserId) => {
  if (!ownerUserId) return '';
  if (typeof ownerUserId === 'string') return ownerUserId;
  if (ownerUserId._id) return ownerUserId._id.toString();
  return ownerUserId.toString();
};

const isPrivateCard = (card) => card && (card.privacy === 'private' || card.isPrivate === true);

const sanitizePrivateCard = (card) => {
  const cardObj = card?.toObject ? card.toObject() : { ...card };
  const filtered = { ...cardObj };

  if (filtered.email) {
    const [localPart, domain] = String(filtered.email).split('@');
    if (localPart && domain) {
      const maskedLocal =
        localPart.length <= 2
          ? `${localPart.charAt(0)}*`
          : `${localPart.charAt(0)}${'*'.repeat(Math.max(localPart.length - 2, 1))}${localPart.charAt(localPart.length - 1)}`;
      filtered.email = `${maskedLocal}@${domain}`;
    }
  }

  if (filtered.phone) {
    const cleaned = String(filtered.phone).replace(/\D/g, '');
    filtered.phone = cleaned.length >= 4 ? `***-***-${cleaned.slice(-4)}` : '***-***-****';
  }

  if (filtered.mobile) {
    filtered.mobile = '***-***-****';
  }

  filtered.fax = filtered.fax ? 'Hidden' : filtered.fax;
  filtered.website = filtered.website ? 'Hidden until access is approved' : filtered.website;
  filtered.address = filtered.address ? 'Address hidden for privacy' : filtered.address;
  filtered.city = undefined;
  filtered.state = undefined;
  filtered.country = undefined;
  filtered.postalCode = undefined;
  filtered.socialLinks = {};
  filtered.contactLocked = true;

  return filtered;
};

module.exports = {
  SENSITIVE_FIELDS,
  getOwnerId,
  isPrivateCard,
  sanitizePrivateCard,
};
