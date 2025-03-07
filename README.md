# Vice Queen Industries API Documentation

## Authentication

### Login

**POST** `/api/auth/login`

**Description:**
A customer with an account can log in using their email and password.

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "token": "string",
  "user": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string"
  }
}
```

### Register

**POST** `/api/auth/register`

**Description:**
A customer can create an account by providing their first name, last name, email address, and preferred password.

**Request Body:**

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "message": "Account created successfully.",
  "user": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string"
  }
}
```

### Open Authentication (if applicable)

**POST** `/api/auth/oauth`

**Description:**
Handles authentication using third-party providers. User data will also be stored in the app's database.

**Request Body:**

```json
{
  "provider": "string",
  "accessToken": "string"
}
```

**Response:** which will then be sent to the database

```json
{
  "token": "string",
  "user": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string"
  }
}
```

---

## Product Management

### Get All Products

**GET** `/api/products`

**Description:**
Retrieve a list of all available products.

**Response:**

```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "currentPrice": "number",
    "previousPrice": "number",
    "category": "string",
    "stock": "number",
    "image": "string"
  }
]
```

### Get Single Product

**GET** `/api/products/:id`

**Description:**
Retrieve details of a specific product by its ID.

**Response:**

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "currentPrice": "number",
  "previousPrice": "number",
  "category": "string",
  "stock": "number",
  "images": ["string"],
  "reviews": [
    {
      "id": "string",
      "starRating": "number",
      "reviewMessage": "string",
      "reviewMedia": "string",
      "createdAt": "string"
    }
  ],
  "variants": {
    "variantName": "string",
    "variations": ["string"]
    // If a product has several variations, then variants will be an array of objects.
  }
}
```

### Create Product

**POST** `/api/products`

**Description:**
Create a new product (admin only).

**Request Body:**

```json
{
  "name": "string",
  "description": "string",
  "price": "number",
  "category": "string",
  "stock": "number",
  "image": ["string"],
  "variants": {
    "variantName": "string",
    "variations": ["string"]
    // If a product has several variations, then variants will be an array of objects.
  }
}
```

**Response:**

```json
{
  "message": "Product created successfully."
}
```

### Add to Cart

**POST** `/api/cart`

**Description:** Add a product to the cart(for authenticated users only).

**Request Body:**

```json
{
  "productId": "number",
  "quantity": "number"
}
```

**Response:**

```json
{
  "message": "Product added to cart.",
  "product": {
    "id": "string",
    "quantity": "string"
  }
}
```

### Update Product

**PUT** `/api/products/:id`

**Description:**
Update an existing product (admin only).

**Request Body:**

```json
{
  "name": "string",
  "description": "string",
  "price": "number",
  "category": "string",
  "stock": "number",
  "image": "string"
}
```

**Response:**

```json
{
  "message": "Product updated successfully.",
  "product": {
    "id": "string",
    "name": "string",
    "description": "string",
    "price": "number",
    "category": "string",
    "stock": "number",
    "image": "string"
  }
}
```

### Delete Product

**DELETE** `/api/products/:id`

**Description:**
Delete an existing product (admin only).

**Response:**

```json
{
  "message": "Product deleted successfully."
}
```

---

## Category Management

### Get All Categories

**GET** `/api/categories`

**Description** : Get all categories.

**Response:**

```json
{
  "categories": [
    {
      "id": "string",
      "name": "string",
      "description": "string"
    }
  ]
}
```

### Get All products of a Category

**GET** `/api/categories/:id/products`

**Description:** Get all products of a category.

**Response:**

```json
{
  "products": [
    {
      "id": "string",
      "image": "string",
      "name": "string",
      "price": "number"
    }
  ]
}
```

### Create a Category

**POST** `/api/categories`

**Description:** Create a new category.

**Request Body:**

```json
{
  "name": "string",
  "description": "string"
}
```

**Response:**

```json
{
  "message": "Product category created successfully",
  "category": {
    "id": "string",
    "name": "string",
    "description": "string"
  }
}
```

### Update a Category

**PUT** `/api/categories/:id`

**Descritpion:** Update a category by id.

**Request Body:**

```json
{
  "name": "string",
  "description": "string"
}
```

**Response:**

```json
{
  "message": "Product category updated successfully",
  "category": {
    "id": "string",
    "name": "string",
    "description": "string"
  }
}
```

### Delete a Category

**DELETE** `/api/categories/:id`

**Descritpion:** Delete a category by id.

**Response:**

```json
{
  "message": "Product category deleted successfully"
}
```

## Order Management

### Create Order

**POST** `/api/orders`

**Description:**
Place an order for products.

**Request Body:**

```json
{
  "customerEmail": "string",
  "products": [
    {
      "productId": "string",
      "quantity": "number"
    }
  ],
  "totalAmount": "number",
  "status": "string"
}
```

**Response:**

```json
{
  "message": "Order created successfully.",
  "order": {
    "id": "string",
    "customerEmail": "string",
    "products": [
      {
        "productId": "string",
        "quantity": "number"
      }
    ],
    "totalAmount": "number",
    "status": "string"
  }
}
```

### Get Customer Orders

**GET** `/api/orders?customerId=:customerId`

**Description:**
Retrieve all orders for a specific customer.

**Response:**

```json
[
  {
    "id": "string",
    "customerId": "string",
    "products": [
      {
        "productId": "string",
        "quantity": "number"
      }
    ],
    "totalAmount": "number",
    "status": "string",
    "createdAt": "string"
  }
]
```

### Get Single Order

**GET** `/api/orders/:id`

**Description:**
Retrieve details of a specific order by its ID.

**Response:**

```json
{
  "id": "string",
  "customerId": "string",
  "products": [
    {
      "productId": "string",
      "quantity": "number"
    }
  ],
  "totalAmount": "number",
  "status": "string",
  "createdAt": "string"
}
```

### Update Order Status

**PUT** `/api/orders/:id`

**Description:**
Update the status of an order (e.g., "pending", "shipped", "delivered").

**Request Body:**

```json
{
  "status": "string"
}
```

**Response:**

```json
{
  "message": "Order status updated successfully.",
  "order": {
    "id": "string",
    "status": "string"
  }
}
```

---

## Review Management

### Make a Review

**POST** `/api/reviews`

**Description:** Create a new review for a product.

**Request Body:**

```json
{
  "productId": "string",
  "starRating": "number",
  "reviewMessage": "string",
  "reviewMedia": ["string"]
}
```

**Response:**

```json
{
  "message": "Review posted successfully.",
  "review": {
    "id": "string",
    "productId": "string",
    "starRating": "number",
    "reviewMessage": "string",
    "reviewMedia": ["string"],
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### Get Product's Reviews

**GET** `/api/reviews/product/:productId`

**Description:** Get all reviews for a product.

**Response:**

```json
{
  "reviews": [
    {
      "id": "string",
      "starRating": "number",
      "reviewMessage": "string",
      "reviewMedia": ["string"],
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

### Edit a Review

**PUT** `/api/reviews/:reviewId`

**Description:** Edit a review.

**Request Body:**

```json
{
  "productId": "string",
  // starRatings can not be edited
  "reviewMessage": "string",
  "reviewMedia": ["string"]
}
```

**Response:**

```json
{
  "message": "Review posted successfully.",
  "review": {
    "id": "string",
    "productId": "string",
    "starRating": "number",
    "reviewMessage": "string",
    "reviewMedia": ["string"],
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```
