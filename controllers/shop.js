const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  let newProducts = ''

  Product.find()
    .populate('userId')
    .then(products => {
      // console.log('products', products)
      if (req.session.isLoggedIn) {
        newProducts = products.filter((item) => item.userId._id.toString() !== req.user._id.toString())
      }
      console.log('newProducts', newProducts)
      res.render('shop/product-list', {
        prods: !req.user ? products : newProducts,
        pageTitle: 'All Products',
        path: '/products',
        user: req.user || ''
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
        user: req.user || ''
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  let newProducts = ''

  Product.find()
    .populate('userId')
    .then(products => {

      if (req.session.isLoggedIn) {
        newProducts = products.filter((item) => item.userId._id.toString() !== req.user._id.toString())
      }

      res.render('shop/index', {
        prods: !req.user ? products : newProducts,
        pageTitle: 'Shop',
        path: '/',
        user: req.user || ''
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
        user: req.user || ''
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .populate('products.product.userId')
    .then(orders => {
      // console.log('orders', orders[0].products[0].product.userId)
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
        user: req.user || ''
      });
    })
    .catch(err => console.log(err));
};
