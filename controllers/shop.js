// FU-TING, LI, Student No: 8819152

const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');
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

      orders.sort((a, b) => {
        if (a.createdAt < b.createdAt) return 1
        if (a.createdAt > b.createdAt) return -1
        return 0
      })

      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
        user: req.user || ''
      });
    })
    .catch(err => console.log(err));
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .populate('products.product.userId')
    .then(order => {
      if (!order) {
        return next(new Error('No order found.'));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);
      const logoPath = path.join('public', 'images', 'logo', 'logo-1.png')

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.image(logoPath, 270, 20, {
        fit: [50, 50],
        align: 'center',
        valign: 'center',
      });

      pdfDoc.fontSize(26).text(`Invoice`, {
        underline: true
      });

      pdfDoc.fontSize(14).text(`Order No: ${order._id}`, {
        width: 480,
        align: 'right'
      });

      pdfDoc.fontSize(14).text(`Order Date: ${new Date(order.createdAt).toUTCString()}`, {
        width: 480,
        align: 'right'
      });

      pdfDoc.text(' ', 72).underline(72, 115, 480, 27, { color: '#000' })
      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
            ' - ' +
            prod.quantity +
            ' x ' +
            '$' +
            prod.product.price, {
            width: 480,
            height: 60,
            align: 'left',
            continued: true,
          }).text(
            `seller : ${prod.product.userId.email}`, {
            width: 480,
            height: 60,
            color: '#000',
            align: 'right',
          }).moveDown(0.5);
      });

      pdfDoc
        .moveDown(25).fontSize(20).text('Total Price: $' + totalPrice, {
          width: 480,
          align: 'right'
        })

      pdfDoc.end();
    })
    .catch(err => next(err));
};