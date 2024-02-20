# Northcoders News API

## Hosted Version

[Link to Hosted Version](https://nc-news-kpcd.onrender.com)

## Project Summary

This project is a web application designed to serve as a news page where users can read articles, filter them based on various criteria, and engage in discussions by adding comments.

## Installation Instructions

1. Clone the repository:

```
   git clone https://github.com/ZEwela/nc-news
```

2. Navigate to the project directory:

```
   cd nc-news
```

3. Install dependencies:

```
   npm install
```

4. Setup databases:

```
   npm run setup-dbs
```

5. Seed local database:

```
   npm run seed
```

6. Run tests:

```
   npm test
```

## Environment Variables

This project requires two `.env` files:

1. Create .env.test file (see .env-example, check db/setup.sql for database name)
2. Create .env.development file (see .env-example, check db/setup.sql for database name)

## Minimum Versions

- Node.js: v19.6.0
- PostgreSQL: v14.8
