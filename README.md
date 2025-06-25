# E-commerce Project

![Image](https://github.com/user-attachments/assets/aa8dd01b-d3cb-4527-a254-f86556097268)

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

PostgresQL

CREATE TABLE category (
id SERIAL PRIMARY KEY,
title VARCHAR(50)
);

CREATE TABLE item (
id SERIAL PRIMARY KEY,
item_name VARCHAR(50),
description VARCHAR(255),
price FLOAT,
image TEXT,
category_id INTEGER REFERENCES category(id)
);

CREATE TABLE order_items (
id SERIAL PRIMARY KEY,
order_id INTEGER REFERENCES orders(id),
item_id INTEGER REFERENCES item(id),
item_name VARCHAR(50),
price FLOAT
);

CREATE TABLE orders (
id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(id),
first_name VARCHAR(50),
last_name VARCHAR(50),
address1 TEXT,
address2 TEXT,
country VARCHAR(30),
zip VARCHAR(10),
state VARCHAR(10),
payment VARCHAR(30),
order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
status VARCHAR(10),
price FLOAT
);

CREATE TABLE pages (
id SERIAL PRIMARY KEY,
title VARCHAR(50),
content TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
id SERIAL PRIMARY KEY,
first_name VARCHAR(50),
last_name VARCHAR(50),
email VARCHAR(50) UNIQUE,
password VARCHAR(255),
level INTEGER
);
