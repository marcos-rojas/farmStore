const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override')

const PORT = 3000;

const mongoose = require('mongoose');
const Product = require('./models/product');
const Farm = require('./models/farm');

mongoose.connect("mongodb://localhost:27017/farmStand2", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('database connection open');
    })
    .catch(err => {
        console.log('Oh no mongo error');
        console.log(err);
    })

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const categories = ['fruit', 'vegetable', 'dairy'];

// FARM ROUTES
app.get('/farms/new', async (req, res) => {
    res.render('farms/new')
})

app.get('/farms/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const farm = await Farm.findById(id).populate('products');
        res.render('farms/show', { farm });
    } catch (e) {
        throw new Error('Bad request')
    }

})

app.post('/farms', async (req, res) => {
    const myFarm = new Farm(req.body.farm);
    await myFarm.save();
    console.log(`${myFarm.name} saved`)
    res.redirect('/farms');
})

app.get('/farms', async (req, res) => {
    const farms = await Farm.find({})
    res.render('farms/index', { farms });
})


app.post('/farms/:id/products', async (req, res) => {

    const newProduct = new Product(req.body)
    const farm = await Farm.findById(req.params.id);
    farm.products.push(newProduct);
    newProduct.farm = farm;

    await newProduct.save();
    await farm.save();
    console.log(`Product ${req.body.name} saved in ${farm.name} farm`)
    res.redirect(`/farms/${farm._id}`);
})

app.get('/farms/:id/products/new', async (req, res) => {
    const { id } = req.params;
    const farm = await Farm.findById(id);
    res.render('products/new', { categories, farm });
})

app.delete('/farms/:id', async (req, res) => {
    const farm = await Farm.findByIdAndDelete(req.params.id);
    res.redirect('/farms')
})
// PRODUCTS ROUTE
app.get('/products', async (req, res) => {
    const { category } = req.query;
    if (category) {
        const products = await Product.find({ category });
        res.render('products/index', { products, categ: category });
    } else {
        const products = await Product.find({});
        res.render('products/index', { products, categ: 'All' });
    }

})

app.get('/products/new', (req, res) => {
    res.render('products/new', { categories });
})

app.post('/products', async (req, res) => {
    const newProduct = new Product(req.body)
    await newProduct.save();
    console.log(`${req.body.name} saved`)
    res.redirect('/products');
})

app.get('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id).populate('farm', 'name');
        res.render('products/show', { product });
    } catch (err) {
        res.redirect('products/index');
    }

})
app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findByIdAndDelete(id);
        console.log(`${product.name} deleted`)
        res.redirect('/products');
    } catch (err) {
        res.redirect('/products');
    }
})
app.get('/products/:id/edit', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render('products/edit', { product, categories });
})

app.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    res.redirect(`/products/${product._id}`);
})

app.get('*', (req, res) => {
    res.send('Pagina en construccion')
})

// app.use((err, req, res, next) => {
//     res.send('404 No sabía');
// })

app.listen(PORT, function () {
    console.log(`Connected to server in port ${PORT}`);
})