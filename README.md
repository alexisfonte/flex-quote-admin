# Flex5 Quote Admin Dashboard & CMS

> A admin dashboard and CMS designed for Flex5

This application is a fully functional CMS designed to integrate with [Flex Rental Solutions](https://www.flexrentalsolutions.com/flex-rental-solutions/), a cloud-based, inventory management and rental software primarily used for the live event industry. Using the Flex5 API, this application allows customers to request a quote, from your company's real-time Flex rental inventory. The application's robust api allows you to easily connect to a customer-facing rental website like the one I created for [Corporate Lighting and Audio](https://rentals.corplighting.com/). 

This headless CMS allows members of your company to review the inventory items you want customers to see, view customer submitted quotes, and manage promotional banners for your customer-facing rental site.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Features](#features)
- [Schema](#schema)
- [Backend API Endpoints](#backend-api-endpoints)
- [Future Improvements](#future-improvements)
- [Acknowledgements](#acknowledgements)

## Technologies Used

- Next.js 14.1.0
- React
- Typescript
- Prisma ORM
- Clerk Auth
- TailwindCSS
- Shadcn UI
- MySQL
- PlanetScale
- Cloudinary
- Nodemailer
- Vercel Cron Jobs
- Zod State Management
- React Hook Forms
- Recharts (for the graph on the dashboard)
![](/images/Screenshot%202024-01-20%20at%208.57.55 PM.png)

## Features

Users will be able to:

- Import inventory models from their Flex5 rental inventory
- Create, update, and delete products and categories without manipulating their data in Flex5.
- Archive inventory models without manipulating their data in Flex5.
- Upload multiple images for products.
- Mark products as featured so they are shown on the rental site's homepage.
- Create, update, and delete product filters such as "Manufacturer" and "Size".
- Create promotional banners that can be attatched to a category or used individially.
- Search through all products, categories, manufacturers, sizes, and banners with pagination.
- View customer quotes and import them into Flex (disabled in demo)
- View graphs of most popular products and categories.
- Track who's viewed a quote.
- Sort, filter, and change the status of quotes from data tables
![](/images/Datatable.gif)

### Schema

![Database Schema](/images/Admin%20Schema.png)

### Backend API Endpoints

| Method | Endpoint           | Params                                                                                                                                                                                                                                           | Description                                                                        |
| ------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| GET    | /banners           |                                                                                                                                                                                                                                                  | returns all unarchived banners                                                     |
| POST   | /banners           | label, imageURL, isArchived, link                                                                                                                                                                                                                | creates a banner                                                                   |
| GET    | /banners/:id       | bannerId                                                                                                                                                                                                                                         | return an unarchived banner                                                        |
| PATCH  | /banners/:id       | label, imageURL, isArchived, link                                                                                                                                                                                                                | updates a banner                                                                   |
| DELETE | /banners/:id       | bannerId                                                                                                                                                                                                                                         | deletes a banner                                                                   |
| GET    | /categories        | parentId                                                                                                                                                                                                                                         | returns all child categories                                                       |
| POST   | /categories        | name, parentId, bannerId                                                                                                                                                                                                                         | creates a category                                                                 |
| GET    | /categories/:id    |                                                                                                                                                                                                                                                  | returns a category, its parent category and its child categories                   |
| PATCH  | /categories/:id    | name, parentId, bannerId                                                                                                                                                                                                                         | updates a category                                                                 |
| DELETE | /categories/:id    | categoryId                                                                                                                                                                                                                                       | deletes a category                                                                 |
| GET    | /manufacturers     |                                                                                                                                                                                                                                                  | returns all manufacturers                                                          |
| POST   | /manufacturers     | name, country                                                                                                                                                                                                                                    | creates a manufacturer                                                             |
| GET    | /manufacturers/:id |                                                                                                                                                                                                                                                  | returns a manufacturer                                                             |
| PATCH  | /manufacturers/:id | name, country                                                                                                                                                                                                                                    | updates a manufacturer                                                             |
| DELETE | /manufacturers/:id | manufaturerId                                                                                                                                                                                                                                    | deletes a manufacturer                                                             |
| GET    | /sizes             |                                                                                                                                                                                                                                                  | returns all sizes                                                                  |
| POST   | /sizes             | value                                                                                                                                                                                                                                            | creates a size                                                                     |
| GET    | /sizes/:id         |                                                                                                                                                                                                                                                  | returns a size                                                                     |
| PATCH  | /sizes/:id         | value                                                                                                                                                                                                                                            | updates a size                                                                     |
| DELETE | /sizes/:id         | sizeId                                                                                                                                                                                                                                           | deletes a size                                                                     |
| GET    | /products          | searchTerm, categoryId, manufacturerId[], sizeId[], isFeatured                                                                                                                                                                                   | returns all products that fit the params and their filters                         |
| POST   | /products          | name, description, weight, dimensions, manufacturerId, categoryId, sizeId, images,isFeatured, isArchived, barcode                                                                                                                                | creates a product                                                                  |
| GET    | /products/:id      |                                                                                                                                                                                                                                                  | returns a product and it's breadcrumbs                                             |
| PATCH  | /products/:id      | name, description, weight, dimensions, manufacturerId, categoryId, sizeId, images,isFeatured, isArchived, barcode                                                                                                                                | updates a product                                                                  |
| DELETE | /products/:id      | productId                                                                                                                                                                                                                                        | deletes a product                                                                  |
| POST   | /quotes            | acceptedTerms, company,firstName, lastName, email, phone, startDate, endDate, deliveryMethod, notes, deliveryContactName, deliveryContactPhone, venueName, venueLine1, venueLine2, venueCity, venueState, venueZipcode, venueCountry, quoteItems | creates and submits a quote                                                        |
| PATCH  | /quotes/:id        | status                                                                                                                                                                                                                                           | updates a quote's status                                                           |
| DELETE | /quotes/:id        | quoteId                                                                                                                                                                                                                                          | deletes a quote                                                                    |
| PATCH  | /quotes/:id/export | quoteId                                                                                                                                                                                                                                          | imports a quote into the company's flex5 database and marks the status as imported |
| GET    | /inventory/update  |                                                                                                                                                                                                                                                  | updates the invventory from the company's flex database                            |
| DELETE | /inventory/reset   |                                                                                                                                                                                                                                                  | resets the inventory (ie. Categories, Products, Sizes, Manufacturers)              |

## Future Improvements

In progress:

- ability to add staff notes to the quotes
- quote status change log

## Acknowledgements

This project was created as a pitch for [Corporate Ligthing and Audio](https://www.corplighting.com/), a New Orleans based live event production company. In collabaration with the UX designer at Poola Marketing, it has since been styled to align with their brand identity. You can view their rental site [here](https://rentals.corplighting.com/).

All inventory data is pulled from the Corporate Lighting Flex5 database, and any features that would affect their inventory directly has been disabled to protect their data. 

The inventory data is pulled from the Flex5 API using a custom jaspersoft report to avoid hitting the API's request limit. If you would like to see the documentation for the Flex5 API you can access it [here](https://cla.flexrentalsolutions.com/f5/swagger-ui/index.html#/)

The concept of this project was inspired by https://www.rentex.com/.

Dashboard design inspired by [Shadcn UI](https://ui.shadcn.com/examples/dashboard). 
