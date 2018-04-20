CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
	item_id INT NOT NULL,
	product_name varchar(100) NOT NULL,
    department_name varchar(100) NOT NULL,
	price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER(10),
	PRIMARY KEY (item_id),
    UNIQUE(item_id)
);
