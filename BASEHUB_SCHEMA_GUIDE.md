# BaseHub Schema Setup Guide for Respira Forms Pro

## Overview
This guide will help you set up the required BaseHub schema structure for the marketing website template. The template expects a specific schema with `site` as the root level containing pages, settings, header, footer, and other components.

## Required Schema Structure

### 1. Root Level Structure
Your BaseHub repository should have this top-level structure:

```
Root
├── site (Document)
│   ├── pages (Collection)
│   ├── settings (Document)
│   ├── header (Document)
│   ├── footer (Document)
│   └── generalEvents (Document)
├── blog (Collection) - Optional
└── changelog (Collection) - Optional
```

### 2. Site Document Structure

#### Site Settings Document
Create a `settings` document under `site` with these fields:

**Theme Settings:**
- `theme` (Reference to Theme component)
  - `accent` (Select: blue, green, purple, red, orange, yellow, etc.)
  - `grayScale` (Select: slate, gray, zinc, neutral, stone)

**Logo Settings:**
- `logo` (Reference to Logo component)
  - `dark` (Image block)
  - `light` (Image block)

**Metadata Settings:**
- `metadata` (Reference to Metadata component)
  - `defaultTitle` (Text)
  - `titleTemplate` (Text)
  - `defaultDescription` (Text)

**General Settings:**
- `showUseTemplate` (Boolean)

#### Site Header Document
Create a `header` document under `site` with:

- `navbar` (Reference to Navbar component)
  - `items` (Collection of HeaderNavbarLinkComponent)
    - `_title` (Text)
    - `href` (Text)
    - `sublinks` (Collection)
      - `items` (Collection)
        - `_title` (Text)
        - `link` (Union: CustomTextComponent | PageReferenceComponent)
- `rightCtas` (Collection of ButtonComponent)
  - `items` (Collection)
    - `label` (Text)
    - `href` (Text)
    - `type` (Select: primary | secondary)
    - `icon` (Text)

#### Site Footer Document
Create a `footer` document under `site` with:

- `newsletter` (Reference to Newsletter component)
- `copyright` (Text)
- `navbar` (Reference to Navbar component)
  - `items` (Collection)
    - `_title` (Text)
    - `url` (Text)
- `socialLinks` (Collection)
  - `_title` (Text)
  - `icon` (Image block)
  - `url` (Text)

#### Site Pages Collection
Create a `pages` collection under `site` with:

Each page item should have:
- `pathname` (Text) - e.g., "/", "/about", "/pricing"
- `_title` (Text)
- `_analyticsKey` (Text)
- `metadataOverrides` (Reference to Metadata component)
  - `title` (Text)
  - `description` (Text)
- `sections` (Collection of various section components)

### 3. Required Component Types

#### HeroComponent
- `_analyticsKey` (Text)
- `customerSatisfactionBanner` (Reference to CustomerSatisfactionBanner)
  - `text` (Text)
  - `avatars` (Collection of Avatar components)
- `title` (Text)
- `subtitle` (Text)
- `actions` (Collection of ButtonComponent)

#### FeaturesGridComponent
- `_analyticsKey` (Text)
- `heading` (Reference to HeadingComponent)
- `features` (Collection of Feature components)

#### PricingComponent
- `_analyticsKey` (Text)
- `heading` (Reference to HeadingComponent)
- `plans` (Collection of PricingPlan components)

#### TestimonialsComponent
- `_analyticsKey` (Text)
- `heading` (Reference to HeadingComponent)
- `testimonials` (Collection of Testimonial components)

#### FaqComponent
- `_analyticsKey` (Text)
- `heading` (Reference to HeadingComponent)
- `faqs` (Collection of FAQ components)

#### FormComponent
- `_analyticsKey` (Text)
- `heading` (Reference to HeadingComponent)
- `formFields` (Collection of FormField components)

### 4. Supporting Component Types

#### ButtonComponent
- `label` (Text)
- `href` (Text)
- `type` (Select: primary | secondary)
- `icon` (Text)

#### HeadingComponent
- `title` (Text)
- `subtitle` (Text)
- `tag` (Text)
- `align` (Select: left | center | right)

#### Image Block
- `url` (Image)
- `alt` (Text)
- `width` (Number)
- `height` (Number)
- `aspectRatio` (Number)
- `blurDataURL` (Text)

#### Avatar Component
- `url` (Image)
- `alt` (Text)
- `width` (Number)
- `height` (Number)

## Step-by-Step Setup Instructions

### Step 1: Create Root Structure
1. Go to your BaseHub repository: https://basehub.com/webmyc/respiraforms/explore
2. Create a new Document called `site`
3. Inside `site`, create:
   - Document: `settings`
   - Document: `header`
   - Document: `footer`
   - Collection: `pages`
   - Document: `generalEvents`

### Step 2: Configure Settings
1. In the `settings` document, add:
   - `theme` field (Reference to Theme component)
   - `logo` field (Reference to Logo component)
   - `metadata` field (Reference to Metadata component)
   - `showUseTemplate` field (Boolean, set to true)

### Step 3: Create Component Types
You'll need to create these component types in BaseHub:
- Theme
- Logo
- Metadata
- Header
- Footer
- Navbar
- ButtonComponent
- HeadingComponent
- HeroComponent
- FeaturesGridComponent
- PricingComponent
- TestimonialsComponent
- FaqComponent
- FormComponent
- Image Block
- Avatar Component

### Step 4: Create Sample Content
1. Create a homepage in the `pages` collection with pathname "/"
2. Add sections like Hero, Features, Pricing, etc.
3. Configure the header and footer with appropriate links

### Step 5: Test the Integration
1. Update your website's BaseHub queries to match your schema
2. Test the build and deployment

## Alternative: Use BaseHub Templates

BaseHub offers pre-built templates that include the required schema. You can:
1. Start with a BaseHub marketing website template
2. Customize it for Respira Forms Pro
3. This will give you all the required components and schema structure

## Quick Start Option

If you want to get started quickly, I recommend:
1. Using BaseHub's marketing website template as a starting point
2. Customizing the content for Respira Forms Pro
3. This will give you all the required schema structure automatically

Would you like me to help you with any specific part of this setup process?
