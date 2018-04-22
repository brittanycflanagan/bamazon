var mysql = require("mysql");
var inquirer = require("Inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
  });

  connection.connect(function(err) {
    if (err) throw err;
    //console.log("Connected Sucessfully to mySQL Database");
    showMenu();
  });
  
  function continueApp() {
    inquirer.prompt([
        {name: "continue",
            type: "input",
            message: "Would you like to continue using the application? (y/n) \n"},
        ]).then(function(answer) {   
            if (answer.continue === "y" || answer.menu === "Y") {
                showMenu();}
            else if (answer.continue === "n" || answer.menu === "N") {
                console.log("Thank you. Connection ended.")
                connection.end();}
            else {
                console.log("That was not a valid response. Connection ended.")
                connection.end();}    
        });
    }

  //Show menu after connection
  function showMenu() {
    inquirer.prompt([
        {name: "menu",
            type: "input",
            message: "What would you like to do? \n A. View Products for Sale \n B. View Low Inventory \n C. Add Inventory \n D. Add New Product \n"},
        ])
        .then(function(answer) {   
            if (answer.menu === "a" || answer.menu === "A") {
                showProducts();}
            else if (answer.menu === "b" || answer.menu === "B") {
                showLowInventory();}
            else if (answer.menu === "c" || answer.menu === "C") {
                addToInventory();}
            else if (answer.menu === "d" || answer.menu === "D") {
                addNewProduct();}
            else {
                console.log("That is not a valid choice. Please type A, B, C or D. Please try again.\n");
                showMenu();
            }
    });       
}

function showProducts() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        console.log( "\n Available Products:\n-----------------\n")
        for (var i=0; i<res.length;i++) {
            console.log(
            "Product Name: "+res[i].product_name+ 
            "\n Item ID: "+res[i].item_id+   
            "\n Price: "+res[i].price+
            "\n Quantity: "+res[i].stock_quantity+ "\n");
        }                  
        continueApp(); 
    });
    
}

function showLowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, res) {
        if (err) throw err;
        console.log( "\n Low Inventory Products (<5 in stock):\n-----------------\n")
        for (var i=0; i<res.length;i++) {
            console.log(
            "Product Name: "+res[i].product_name+ 
            "\n Item ID: "+res[i].item_id+   
            "\n Price: "+res[i].price+
            "\n Quantity: "+res[i].stock_quantity+ "\n");
        }
        continueApp();
    });
}

function  addToInventory() {
    inquirer.prompt([
        {name: "item",
            type: "input",
            message: "Which item would you like to add inventory to? (Item ID)"},
        {name: "newStock",
            type: "input",
            message: "How many would you like to add?"}
        ])
        .then(function(answer) { 
            //Clean ItemID entry
            var itemID = answer.item.toUpperCase();
            var itemIDTrim = itemID.trim();
            //Check if valid stock number
            var newStock = parseInt(answer.newStock);
            if (isNaN(newStock)) {
                console.log("Stock is invalid. Please try again. Ensure you do not have any characters other than numbers.\n");
                addToInventory();
            } else {
            //Check if valid product ID
            connection.query("SELECT item_id FROM products", function(err, res) {
                if (err) throw err;
                var count = 0;
                for (var i=0; i<res.length;i++) {
                  count++;
                  //If valid ID, update stock
                  if (itemIDTrim === res[i].item_id) {
                    count--;   
                    connection.query("SELECT stock_quantity FROM products WHERE ?", {item_id: itemIDTrim}, function(err, res) {
                        if (err) throw err;
                        var updatedStock = newStock + res[0].stock_quantity;
                            connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity: updatedStock}, {item_id: itemIDTrim}], function(err, result) {
                                if (err) throw err;
                                console.log( "The stock has been updated!\n");
                                continueApp();
                            });
                        });
                    }
                    //If not valid ID, provide error
                    if (count === res.length) {
                        console.log("That's not a valid item ID. Please try again.\n");
                        addToInventory();
                    }
                }
            });
            }
        });
}

function addNewProduct() {
    inquirer.prompt([
            {name: "item_id",
            type: "input",
            message: "Please Enter the Item's ID Number:"},
            {name: "product_name",
            type: "input",
            message: "Please Enter the Item's Product Name:"},
            {name: "department_name",
            type: "input",
            message: "Please Enter Department name:"},
            {name: "price",
            type: "input",
            message: "Please Enter the Item's Price: (ex: 99.95)"},
            {name: "stock_quantity",
            type: "input",
            message: "Please Enter Stock:"}
        ]).then(function(answer) {
    //Check if already in database
        connection.query("SELECT item_id FROM products", function(err, res) {
            if (err) throw err;
            var count = 0;
            var itemID1 = answer.item_id.toUpperCase();
            var itemID = itemID1.trim();
            for (var i=0; i<res.length;i++) {
                count++;
                //Check if ID Already Exists
                if (itemID === res[i].item_id) {
                    count--;
                    console.log("That ID Already Exists. Please try again.\n");
                    addNewProduct();
                }  
                //If ID Does not exist...
                if (count === res.length) {
                    var newPrice = parseFloat(answer.price);
                    var newStock = parseInt(answer.stock_quantity);
                    //Check if enteries match character restriction
                    if (answer.item_id.length > 25 || answer.product_name.length > 100 || answer.department_name.length > 100) {
                        console.log("The item id, product name or department name is too long. Item id cannot be longer than 25 characters. Product name & department name cannot be longer than 100 characters.")
                        addNewProduct();
                    } else {
                        //Check if product code contains a space
                        if(answer.item_id.indexOf(' ') >= 0){
                            console.log("Product code contains a space, which is invalid. Please try again.\n");
                            addNewProduct();
                        } else {
                            //Check stock is a valid number
                            if (isNaN(newStock)) {
                                console.log("Stock is invalid. Please try again. Ensure you do not have any characters other than numbers.\n");
                                addNewProduct();
                            } else {
                                //Check if price is a valid number
                                if (isNaN(newPrice)) {
                                    console.log("Price is invalid. Please try again. Ensure you do not have any characters other than numbers.\n");
                                    addNewProduct();
                                } else{
                                    //Add product to table
                                    connection.query("INSERT INTO products SET ?",
                                    {   
                                        item_id: itemID,
                                        product_name: answer.product_name,
                                        department_name: answer.department_name,
                                        price: newPrice.toFixed(2),
                                        stock_quantity: newStock,
                                    },
                                    function(err) {
                                        if (err) throw err;
                                        console.log("Thank you for your valid entry. Your new product was added successfully!\n");
                                        continueApp();
                                    }); 
                                }
                            }
                        }
                    }
                }
            }
        });
    });
}
