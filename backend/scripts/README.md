# Backend Scripts

This directory contains utility scripts for development and maintenance.

## Available Scripts

### `createToken.js`
Creates a JWT token for testing authentication.
```bash
node scripts/createToken.js
```

### `checkCards.js`
Lists all cards in the database with basic information.
```bash
node scripts/checkCards.js
```

### `seedMockData.js`
Populates the database with mock data for development and testing.
```bash
node scripts/seedMockData.js
```

### `seedFreshData.js`
Creates fresh test data including users, cards, and access requests for comprehensive testing.
```bash
node scripts/seedFreshData.js
```

## Usage

All scripts should be run from the `backend` directory:

```bash
cd backend
node scripts/[script-name].js
```

## Notes

- These scripts are for development and testing purposes only
- Make sure the database is running before executing scripts
- Some scripts may modify database data - use with caution in production 