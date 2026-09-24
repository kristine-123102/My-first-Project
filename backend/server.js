const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

let products = [
    {
        items: "laptop",
        price: "150"
    },
    {
        items: "mouse",
        price: "170"
    },
    {
        items: "keyboard",
        price: "120"
    },
    {
        items: "monitor",
        price: "90"
    }
];

app.get('/api/product', (req, res) => {
    res.json(products);
});

app.post('/api/product', (req, res) => {
    console.log(req.body);

    products.push(req.body);
    res.json(req.body);
});

app.listen(8080, () => {
    console.log("Server running on port 8080");
});   