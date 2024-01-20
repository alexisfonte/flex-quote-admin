# Flex5 Quote Admin Dashboard & CMS

> A admin dashboard and CMS designed for Flex5

This application is a fully functional CMS designed to integrate with [Flex Rental Solutions](https://www.flexrentalsolutions.com/flex-rental-solutions/), a cloud-based, inventory management and rental software primarily used for the live event industry. Using the Flex5 API, this application allows customers to request a quote, from your company's real-time Flex rental inventory. The application's robust api allows you to easily connect to a customer-facing rental website. (here)

This headless CMS allows members of your company to review the inventory items you want customers to see, view customer submitted quotes, and manage promotional banners for your customer-facing rental site.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Features](#features)
- [Schema](#schema)
- [Backend API Endpoints](#backend-api-endpoints)
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
- Leave staff note's on a quote.
- View a quote's status history.

### Schema

![Database Schema](/images/Admin%20Schema.png)

### Backend API Endpoints

| Method | Endpoint        | Params                            | Description                                                      |
| ------ | --------------- | --------------------------------- | ---------------------------------------------------------------- |
| GET    | /banners        |                                   | returns all unarchived banners                                   |
| POST   | /banners        | label, imageURL, isArchived, link | creates a banner                                                 |
| PATCH  | /banners/:id    | label, imageURL, isArchived, link | updates a banner                                                 |
| DELETE | /banners/:id    | bannerId                          | deletes a banner                                                 |
| GET    | /banners/:id    | bannerId                          | return an unarchived banner                                      |
| GET    | /categories     | parentId                          | returns all child categories                                     |
| POST   | /categories     | name, parentId, bannerId          | creates a category                                               |
| PATCH  | /categories/:id | name, parentId, bannerId          | updates a category                                               |
| DELETE | /categories/:id | categoryId                        | deletes a category                                               |
| GET    | /categories/:id |                                   | returns a category, its parent category and its child categories |
| PATCH  | /users/:id      | user_id, avatar_id                | updates a user's avatar                                          |
| GET    | /auth           |                                   | authenticates teh current user                                   |
| POST   | /login          | username, password                | creates a user session                                           |
| DELETE | /logout         |                                   | deletes a user session                                           |

## Acknowledgements

This project was created as a pitch for [Corporate Ligthing and Audio](https://www.corplighting.com/), a New Orleans based live event production company. In collabaration with the UX designer at Poola Marketing, it has since been styled to align with their brand identity. You can view their rental site [here](https://rentals.corplighting.com/).
