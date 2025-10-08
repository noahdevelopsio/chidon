# Chidon Kitchen E-Commerce Website

Welcome to the Chidon Kitchen e-commerce website! This project is a complete, modern, and fully responsive website designed for a kitchen supply store. It's built with HTML, CSS, and vanilla JavaScript, and it uses Firebase for the backend and Cloudinary for image hosting. The site is designed to be fast, easy to customize, and simple to deploy.

## Features

*   **Modern & Responsive Design:** The website is designed to look great on all devices, from mobile phones to desktops.
*   **Dynamic Product Loading:** Products are loaded dynamically from a Firestore database, making it easy to manage your inventory.
*   **Client-Side Search & Filtering:** Users can search for products by name and filter by category on the shop page.
*   **Admin Dashboard:** A secure admin dashboard allows you to easily add, edit, and delete products.
*   **Firebase Integration:** The website is integrated with Firebase for database and authentication.
*   **Cloudinary Image Hosting:** Product images are hosted on Cloudinary, a powerful and scalable image hosting service.
*   **WhatsApp Ordering:** The shop page includes a "Order on WhatsApp" button for each product, making it easy for customers to place orders.

## Getting Started

To get started with this project, you'll need to have a few things set up first:

1.  **Clone the Repository:** Clone this repository to your local machine:

    ```bash
    git clone https://github.com/your-username/chidon-kitchen.git
    ```

2.  **Set Up Firebase:**

    *   Create a new project in the [Firebase console](https://console.firebase.google.com/).
    *   In your new project, create a new web app.
    *   Copy the Firebase configuration object from your project's settings.
    *   Paste the configuration object into the `js/firebase-config.js` file.
    *   In the Firebase console, go to the "Firestore Database" section and create a new database.
    *   In the "Authentication" section, enable the "Email/Password" sign-in method.

3.  **Set Up Cloudinary:**

    *   Create a new account on [Cloudinary](https://cloudinary.com/).
    *   In your Cloudinary dashboard, go to the "Settings" section and then the "Upload" tab.
    *   Create a new "unsigned" upload preset.
    *   Copy your cloud name and the name of your unsigned upload preset.
    *   Paste your cloud name and upload preset name into the `js/admin.js` file.

4.  **Import Sample Products:**

    *   In the Firebase console, go to the "Firestore Database" section.
    *   Create a new collection called `products`.
    *   Import the `sample-products.json` file into the `products` collection.

## Customization

This project is designed to be easy to customize. Here are a few things you might want to change:

*   **Logo:** To change the logo, replace the text in the `.navbar-brand` class in the `index.html`, `shop.html`, `about.html`, and `contact.html` files.
*   **Social Media Links:** To change the social media links, replace the `href` values in the `.social-icons` class in the `index.html` file.
*   **WhatsApp Number:** To change the WhatsApp number, replace the placeholder number in the `js/shop.js` file.
*   **Colors & Fonts:** To change the colors and fonts, edit the variables at the top of the `css/style.css` file.

## Running the Project

To run the project locally, you can use a simple web server like [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for Visual Studio Code, or you can run the following command in your terminal:

```bash
python -m http.server
```

This will start a web server on port 8000. You can then open the project in your browser at `http://localhost:8000`.

## Deployment

To deploy the site, you can use any static web hosting service, such as Netlify, Vercel, or GitHub Pages. Simply upload the files to your hosting provider, and your site will be live.
