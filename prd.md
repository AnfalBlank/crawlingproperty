# PRODUCT REQUIREMENT DOCUMENT (PRD)

# BANGUN PROPERTY PRICE INTELLIGENCE

Version: 2.0

Status: MVP Production Ready

Platform: Web Application

Target Market:

* Property Investors
* Property Agents
* Property Owners
* Property Researchers
* Real Estate Consultants

---

# 1. EXECUTIVE SUMMARY

Bangun Property Price Intelligence adalah aplikasi web analytics yang secara otomatis mengumpulkan data harga sewa properti dari halaman publik SPEEDHOME Malaysia, mengolah data tersebut menjadi market intelligence, dan menyajikannya dalam dashboard interaktif yang modern.

Aplikasi ini bukan sekadar scraper data, tetapi sebuah platform analisis harga properti yang membantu pengguna memahami kondisi pasar, membandingkan area, menghitung harga wajar, menganalisis price per sqft, serta menghasilkan insight berbasis data.

---

# 2. PRODUCT GOALS

## Primary Goals

* Mengumpulkan data listing SPEEDHOME secara otomatis
* Menampilkan statistik harga yang akurat
* Membantu pengguna menentukan harga pasar
* Menyediakan alat perbandingan area
* Menyediakan insight pasar yang mudah dipahami

## Secondary Goals

* Menyediakan export data profesional
* Menampilkan visualisasi pasar
* Menyediakan konversi mata uang global
* Menyediakan dashboard responsif

---

# 3. SUCCESS METRICS

## Functional Metrics

* Crawl Success Rate > 95%
* Export Success Rate > 99%
* Currency Conversion Accuracy > 99%
* Dashboard Load Time < 3 detik
* Crawl Completion < 10 detik untuk area umum

## UX Metrics

* Mobile Friendly Score > 95
* Lighthouse Score > 90
* Accessibility Score > 90

---

# 4. USER ROLES

## Guest User

Dapat:

* Search area
* Analyze area
* Compare area
* View dashboard
* Export data

## Admin

Dapat:

* Monitor crawler
* Manage cache
* View logs
* Manage exchange rates
* Re-run crawl

---

# 5. USER JOURNEY

## Search Flow

Home

↓

Input URL / Area

↓

Autocomplete Suggestion

↓

Analyze

↓

Crawler Running

↓

Data Processing

↓

Analytics Engine

↓

Interactive Dashboard

↓

Export / Compare

---

# 6. SYSTEM ARCHITECTURE

Frontend

Next.js

↓

API Layer

↓

Scraper Service

↓

SPEEDHOME Public Pages

↓

Data Processing Engine

↓

Analytics Engine

↓

Database + Cache

↓

Dashboard

---

# 7. TECHNOLOGY STACK

Frontend

* Next.js 15
* TypeScript
* TailwindCSS
* shadcn/ui
* TanStack Table
* React Query
* Zustand
* Recharts
* Framer Motion

Backend

* Next.js API Routes
* Node.js

Crawler

* Playwright
* Cheerio

Database

* PostgreSQL

Caching

* Redis

Export

* ExcelJS
* CSV Export

Maps

* Mapbox / Leaflet

Deployment

* VPS Ubuntu
* Docker
* Nginx

---

# 8. PAGE STRUCTURE

## Home Page

URL:

/

### Components

* Hero Section
* Search Area
* Search URL
* Recent Searches
* Popular Areas
* Analyze Button

---

## Analysis Dashboard

URL:

/analysis

### Components

* Dashboard Header
* KPI Cards
* Market Insight
* Distribution Charts
* Comparison Panel
* Filters
* Listings Table

---

## Admin Dashboard

URL:

/admin

### Components

* Crawl Monitor
* Cache Manager
* Exchange Rate Manager
* Crawl History

---

# 9. FEATURE: SEARCH & AUTOCOMPLETE

Search by:

* Area Name
* Apartment Name
* SPEEDHOME URL

Autocomplete:

Real-time suggestion.

Debounce:

300ms

Maximum Results:

10

---

# 10. FEATURE: CRAWLER ENGINE

Respect robots.txt

Delay:

2-5 seconds randomized

Concurrency:

Maximum 3 tabs

Retry:

3 attempts

Backoff:

2s
4s
8s

---

# 11. PROPERTY DATA MODEL

Listing

* ID
* Listing Title
* Property Name
* Area
* Bedrooms
* Bathrooms
* Monthly Rent
* Yearly Rent
* Daily Rent
* Sqft
* Price Per Sqft
* Furnishing
* Listing URL
* Scraped At

---

# 12. PRICE ANALYTICS ENGINE

Metrics:

## Average Price

Mean

## Median Price

Middle Value

## Mode Price

Most Frequent Price

## Fair Price

Fair Price =
(Median × 70%)
+
(Average × 30%)

## Average Sqft

Average Unit Size

## Price Per Sqft

Monthly Rent / Sqft

---

# 13. FAIR PRICE CLASSIFICATION

Under Market

Price < Fair Price -10%

Fair

Price ±10%

Overpriced

Price > Fair Price +10%

---

# 14. INTERACTIVE KPI CARDS

Cards:

* Total Listings
* Average Rent
* Median Rent
* Fair Price
* Average Sqft
* Price Per Sqft
* Dominant Unit Type

Behavior:

Realtime update

Animated Count Up

No page reload

---

# 15. MARKET INSIGHT ENGINE

Automatically generate insights.

Example:

Mont Kiara currently has 124 active rental listings.

The average rental price is RM2,850/month.

2BR units dominate the market with 41% market share.

The market appears stable due to a small difference between average and median prices.

---

# 16. PRICE DISTRIBUTION CHART

Chart Type

Histogram

Interactive

Click Bar

↓

Auto Filter Table

Price Buckets:

1000-1500

1500-2000

2000-2500

2500-3000

3000-3500

3500+

---

# 17. BEDROOM DISTRIBUTION

Chart:

Pie Chart

Categories:

Studio

1BR

2BR

3BR

4BR+

---

# 18. FURNISHING DISTRIBUTION

Chart:

Pie Chart

Categories:

Fully Furnished

Partially Furnished

Unfurnished

---

# 19. AREA COMPARISON MODE

Compare up to:

5 Areas

Metrics:

* Listings
* Avg Rent
* Median
* Fair Price
* Avg Sqft
* Price/Sqft

Interactive Comparison Chart

Realtime Update

---

# 20. SMART AREA RECOMMENDATION

Example:

Mont Kiara provides the best value among selected areas due to the lowest price per sqft.

Generated automatically.

---

# 21. MULTI CURRENCY SYSTEM

Supported Currencies:

RM

IDR

USD

SGD

EUR

GBP

AUD

JPY

THB

---

# 22. CURRENCY CONVERSION

Entire dashboard updates automatically.

Affected:

* KPI Cards
* Charts
* Tables
* Exports
* Comparison

No page reload.

---

# 23. EXCHANGE RATE ENGINE

Source:

Frankfurter API

Update:

24 hours

Cache:

Database

Fallback:

Previous valid rate

---

# 24. ADVANCED FILTERS

Bedrooms

Bathrooms

Price Range

Sqft Range

Price Per Sqft

Furnishing

Area

Rental Type

---

# 25. UNIT LISTINGS TABLE

Features:

Global Search

Sorting

Filtering

Pagination

Column Visibility

Row Expand

Copy Link

Open Listing

---

Columns:

Listing

Property

Area

Bedrooms

Bathrooms

Monthly Rent

Yearly Rent

Daily Rent

Sqft

Price/Sqft

Furnishing

Source URL

---

# 26. INTERACTIVE TABLE

Click Row

↓

Expand Detail

Shows:

Property Detail

Market Comparison

Fair Price Status

Direct Link

---

# 27. RENTAL AVAILABILITY

Display:

Daily

Monthly

Yearly

If unavailable:

Not Available

---

# 28. SAVED COMPARISON

User can save comparison preset.

Example:

Mont Kiara vs KLCC

Stored:

Browser Local Storage

---

# 29. EXPORT SYSTEM

Formats:

CSV

Excel XLSX

---

Excel Sheets

Sheet 1

Summary

Sheet 2

Listings

Sheet 3

Comparison

Sheet 4

Market Insight

Sheet 5

Currency Information

---

# 30. EXPORT FILE NAME

SPEEDHOME_Mont_Kiara_20260603.xlsx

---

# 31. CACHING SYSTEM

Cache Duration

24 Hours

Display:

Last Updated

Refresh Button

---

# 32. SCAN HISTORY

Track:

Area

Listings

Duration

Scan Date

Status

---

# 33. INTERACTIVE MAP (BONUS FEATURE)

Display all listings on map.

Marker Info:

Price

Sqft

Bedrooms

Furnishing

Listing Link

---

# 34. LOADING EXPERIENCE

Skeleton Loading

Animated Placeholders

Progress Indicator

No blank screens

---

# 35. ANIMATION GUIDELINES

Use:

Framer Motion

Count Up Animation

Fade In

Slide Up

Hover Effect

Avoid:

Heavy animation

Page flicker

Layout shift

---

# 36. MOBILE EXPERIENCE

Mobile First

Features:

Sticky Search

Swipe KPI Cards

Collapsible Filters

Card Based Listing

Sticky Actions

Responsive Charts

Horizontal Table Scroll

---

# 37. ADMIN PANEL

Dashboard

Total Areas

Total Listings

Total Crawls

Cache Hit Ratio

Crawler Monitor

Running

Queued

Completed

Failed

Exchange Rates

Current Rates

Last Update

Cache Manager

Clear Cache

Refresh Cache

History Manager

View Logs

Re-run Crawl

Delete History

---

# 38. DATABASE SCHEMA

areas

id

name

slug

crawl_jobs

id

area_id

status

started_at

completed_at

listings

id

area_id

title

property_name

bedrooms

bathrooms

monthly_rent

yearly_rent

daily_rent

sqft

price_per_sqft

furnishing

url

scraped_at

price_summaries

id

area_id

avg_price

median_price

mode_price

fair_price

avg_sqft

exchange_rates

id

currency

rate

updated_at

scan_history

id

area_id

listing_count

duration

status

created_at

---

# 39. SECURITY

Rate Limiting

Input Validation

URL Validation

Robots Compliance

Request Timeout

Retry Control

Error Logging

---

# 40. FUTURE ROADMAP

Phase 2

* Historical Price Tracking
* Rental Yield Calculator
* ROI Calculator
* AI Price Prediction
* Market Trend Analysis
* Property Investment Scoring
* Portfolio Comparison
* Automated Scheduled Scan

---

# DELIVERABLES

* Responsive Web Application
* Admin Dashboard
* Scraping Engine
* Analytics Engine
* Comparison Engine
* Currency Conversion Engine
* Excel Export Engine
* Interactive Dashboard
* Mobile Responsive UI
* Production Deployment Ready
stt x