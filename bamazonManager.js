var mysql = require("mysql");
var inquirer = require("Inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Snickers428!",
    database: "bamazon"
  });

  connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    showMenu();
  });
  
  function showMenu() {
    inquirer.prompt([
        {name: "menu",
            type: "input",
            message: "What would you like to do? \n A. View Products for Sale \n B. View Low Inventory \n C. Add to Inventory \n D. Add New Product"},
        ])
        .then(function(answer) {   
            if (answer.menu === "a" || answer.menu === "A") {
                showProducts();      
            }
            else if (answer.menu === "b" || answer.menu === "B") {
                showLowInventory();
            }
            else if (answer.menu === "c" || answer.menu === "C") {
                AddtoInventory();
            }
            else if (answer.menu === "d" || answer.menu === "D") {
                console.log("You chose D");
            }
            else {console.log("That is not a valid choice");}
        });
        
    }

    function showProducts() {
        connection.query("SELECT * FROM products", function(err, res) {
            if (err) throw err;
            console.log( "\n Avabilable Products:\n-----------------\n")
            for (var i=0; i<res.length;i++) {
                console.log(
                "Product Name: "+res[i].product_name+ 
                "\n Item ID: "+res[i].item_id+   
                "\n Price: "+res[i].price+
                "\n Quantity: "+res[i].stock_quantity+ "\n");
              }
                           
        
    });
    
}

function showLowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, res) {
        if (err) throw err;
        console.log( "\n Low Inventory Products:\n-----------------\n")
        for (var i=0; i<res.length;i++) {
            console.log(
            "Product Name: "+res[i].product_name+ 
            "\n Item ID: "+res[i].item_id+   
            "\n Price: "+res[i].price+
            "\n Quantity: "+res[i].stock_quantity+ "\n");
          }
});
}

function  AddtoInventory() {
    inquirer.prompt([
        {name: "item",
            type: "input",
            message: "Which item would you like to add inventory to? (Item ID)"},
            {name: "newStock",
            type: "input",
            message: "How many would you like to add?"}
        ])
        .then(function(answer) { 
            // console.log(answer.item);  
             connection.query("SELECT stock_quantity FROM products WHERE ?", {item_id: answer.item}, function(err, res) {
                  if (err) throw err;
                  var updatedStock = parseInt(answer.newStock) + res[0].stock_quantity;
            //   if (answer.item === ) {
                    connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity: updatedStock}, {item_id: answer.item}], function(err, result) {
                         if (err) throw err;
                         console.log( "The stock has been updated!");
                         });
            // } else {
            //     console.log("That is not a valid item code, please ensure the code is typed in ALL CAPS and does not contain spaces.")
            //     }
    });
});
}
