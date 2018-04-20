var mysql = require("mysql");
var inquirer = require("Inquirer"); //NEED TO MAKE PACKAGE.JSON FILE

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  afterConnection();
});

function afterConnection() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    console.log( "\n Avabilable Products:\n-----------------\n")
    for (var i=0; i<res.length;i++) {
        console.log(
        "Product Name: "+res[i].product_name+ 
        "\n Item ID: "+res[i].item_id+   
        "\n Price: "+res[i].price+ "\n");
      }
    whichProduct(); // add res
    
  });
}

function whichProduct() { // add res
    inquirer.prompt([
    {name: "whichProduct",
        type: "input",
        message: "Which product would you like to buy? (item ID)"},
    {name: "howMany",
        type: "input",
        message: "How many units would you like to purchase?"},
    ])
    .then(function(answers) {       
        
        connection.query("SELECT stock_quantity, price FROM products WHERE ?", {item_id: answers.whichProduct}, function(err, res) {
          //  console.log(stock[0].stock_quantity, parseInt(answers.howMany));
         // console.log(res[0].stock_quantity, res[0].price);
          if (parseInt(answers.howMany) <= res[0].stock_quantity) {
                 var newStock = res[0].stock_quantity - parseInt(answers.howMany);
                
                connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity: newStock}, {item_id: answers.whichProduct}], function(err, results) {
                    if (err) throw err;
                   // console.log("Thank you for your purchase!");
                    console.log("Thank you for your purchase! Your order total is: $" + res[0].price);
                    });
            } 
            else {
                console.log("Sorry, there is not enough stock available to fulfill that purchase");
                whichProduct();
            }
        });

      //  connection.end();
    });
}

