# 03 — API Routes & Data Models

## API routes (mounted in `backend/src/app.js:185-192`)

Misc: `GET /health`, `GET /api` (self-describing endpoint index).

### `/api/auth`
register · login · refresh · forgot-password · reset-password · verify-email/request ·
verify-email · check · profile (GET/PUT) · stats · change-password · logout · check-status

### `/api/cards`
GET /public · /trending · /c/:shortLink · /public/view/:cardId
POST /:id/share · /:id/download
GET /:id/export · /:id/save-contact
access-requests list/approve/reject
POST / (multipart create) · /from-template
GET /my · /loved · /saved · /access/check/:cardId
love/save toggles
GET /:cardId (+ /enhanced, /analytics) · PUT/DELETE /:cardId
POST /request-access · /grant-qr-access · POST /:cardId/qr · PATCH /:cardId/privacy

### `/api/library`
POST / · GET / · /stats · /:cardId/check · PUT/DELETE /:cardId

### `/api/search`
GET / · /suggestions · POST /advanced · POST /analytics · /performance ·
GET /popular · /recent · /recommendations/:cardId · /category/:category

### `/api/admin`
login/logout · dashboard · realtime · users CRUD + ban/unban ·
access-requests approve/reject · cards CRUD + feature + analytics ·
templates CRUD + featured · analytics (+cards/users) · settings GET/PUT ·
backup/restore · notifications

### `/api/analytics`
POST /track · GET /card/:cardId · /user/:userId · /trending · /system ·
/realtime/:cardId · /insights/:cardId · /export/:cardId

### `/api/notifications`
GET / · /stats · PATCH /mark-all-read · PATCH /:id/read · DELETE /:id

### `/api/templates`
GET / · /featured · /category/:category · /search · GET /admin/all · /admin/stats ·
GET /:templateId · POST /:templateId/generate · POST / · PUT/DELETE /:templateId ·
PUT /:templateId/featured

## Mongoose models (`backend/src/models/`)

### User (`userModel.js`)
username* · email* (unique) · password* (hash) · name · jobTitle · company · phone ·
location · website · bio · avatar · lastLoginAt · loginCount · isActive ·
isEmailVerified · emailVerificationOtpHash/Expires · otpLastRequestedAt ·
refreshTokenHash/Expires · passwordResetTokenHash/Expires

### Admin
username · name · email · password · role (`admin`|`super_admin`) · isActive ·
isVerified · lastLoginAt

### Card (`cardModel.js`)
ownerUserId→User · title* · fullName* · jobTitle · company · email · phone · website ·
address · bio · backgroundColor/textColor/fontFamily · shortLink* (unique) ·
isPublic/isPrivate/privacy (`public|private|shared`) · templateId · featured ·
loveCount · views · shares · downloads · loves[] · isActive
— has instance methods (incrementViews/addLove…)

### Template
id (string unique) · name · description · category · tags[] ·
preview{colors, elements[]} · design{layout, aspectRatio} · isActive · isFeatured ·
usageCount · createdBy→Admin

### SavedCard
userId + cardId (compound unique) · notes · tags[]

### Notification
recipientId · senderId · type enum (`access_request|access_approved|access_rejected|
card_loved|card_shared|system`) · title · message · data(Mixed) · isRead · isDeleted ·
expiresAt (30d TTL-ish) — static factory methods

### CardAccessRequest
cardId · requesterId · ownerId · status (`pending|approved|rejected`) ·
requestType (`qr_scan|manual_request`) · messages · expiresAt (7d)

### Analytics
cardId · userId (nullable = anonymous) · actionType enum (`view|love|unlove|share|
download|save|qr_scan|link_click`) · metadata{userAgent, ip, deviceType, location,
sessionId, timeSpent…}

### CardDesign
cardId (unique) · designJson (Konva JSON) · cardImageUrl

## Privacy model (touch carefully)

Cards are public/private/shared. `privacyMiddleware` strips sensitive fields from public
payloads. QR scans can grant temporary access to private cards (CardAccessRequest with
7-day expiry). Many historical commits fix visibility regressions here — always run the
auth/card flows after touching privacy code.
