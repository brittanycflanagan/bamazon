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
  // console.log("Connected Sucessfully to mySQL Database");
  showProducts();
});

//Show Available Products after Connection
function showProducts() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    console.log( "\n Available Products:\n-----------------\n")
    for (var i=0; i<res.length;i++) {
        console.log(
        "Product Name: "+res[i].product_name+ 
        "\n Item ID: "+res[i].item_id+   
        "\n Price: $"+res[i].price+ "\n");
      }
    whichProduct();
    
  });
}

//Ask which product they'd like to purchase
function whichProduct() {
    inquirer.prompt([
    {name: "whichProduct",
        type: "input",
        message: "Which product would you like to buy? (item ID)"},
    {name: "howMany",
        type: "input",
        message: "How many units would you like to purchase?"},
    ])
    .then(function(answers) { 
      //Check if valid product ID   
      connection.query("SELECT item_id FROM products", function(err, res) {
        if (err) throw err;
        var count = 0;
        for (var i=0; i<res.length;i++) {
          count++;
          //If valid ID, pull stock & price from table
          if (answers.whichProduct === res[i].item_id) {
            count--;   
            connection.query("SELECT stock_quantity, price FROM products WHERE ?", {item_id: answers.whichProduct}, function(err, res) {
              if (err) throw err;
              //If enough stock, fullfill order
              if (parseInt(answers.howMany) <= res[0].stock_quantity) {
                  var newStock = res[0].stock_quantity - parseInt(answers.howMany);           
                  connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity: newStock}, {item_id: answers.whichProduct}], function(err, results) {
                    if (err) throw err;
                    var orderTotal = res[0].price*parseInt(answers.howMany);
                    console.log("Thank you for your purchase! Your order total is: $" + orderTotal.toFixed(2));
                    connection.end();
                  });
              //If not enough stock, provide error message and give user another chance
              } else {
                  console.log("Sorry, there is not enough stock available to fulfill that purchase. Please try again.\n");
                  whichProduct();
              }
            });
          } 
          //If not valid ID, provide error message and give user anouther chance
          if (count === res.length) {
            console.log("That's not a valid item ID. Please ensure the ID is entered in all CAPS. Please try again.\n")
            whichProduct();
          }
        }
      });
    });
}

