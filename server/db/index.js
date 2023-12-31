const client = require('./client');
const path = require('path');
const fs = require('fs');

const {
  fetchProducts,
  createProduct
} = require('./products');

const {
  createUser,
  authenticate,
  findUserByToken
} = require('./auth');

const {
  fetchLineItems,
  createLineItem,
  updateLineItem,
  deleteLineItem,
  updateOrder,
  fetchOrders,
} = require('./cart');

const {
  fetchBookmarks,
  createBookmark
} = require('./bookmarks');

const {
  fetchReviews,
  createReview,
} = require('./reviews');
const { LoaderOptionsPlugin } = require('webpack');

const loadImage = (filePath)=> {
  return new Promise ((resolve, reject)=> {
    const fullPath = path.join(__dirname, filePath);
    fs.readFile(fullPath, 'base64', (err, result)=>{
      if(err){
        reject(err);
      }
      else{
        resolve(`data:image/png;base64,${result}`);
      }
    });
  });
};

const seed = async()=> {
  const SQL = `
    DROP TABLE IF EXISTS bookmarks;
    DROP TABLE IF EXISTS line_items;
    DROP TABLE IF EXISTS reviews;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS users;
    

    CREATE TABLE users(
      id UUID PRIMARY KEY,
      created_at TIMESTAMP DEFAULT now(),
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL,
      is_admin BOOLEAN DEFAULT false,
      is_vip BOOLEAN  DEFAULT false
    );

    CREATE TABLE products(
      id UUID PRIMARY KEY,
      created_at TIMESTAMP DEFAULT now(),
      name VARCHAR(100) UNIQUE NOT NULL,
      price DECIMAL(10,2),
      description CHAR(2000),
      image TEXT
    );

    CREATE TABLE bookmarks(
      id UUID PRIMARY KEY,
      created_at TIMESTAMP DEFAULT now(),
      user_id UUID REFERENCES users(id) NOT NULL,
      product_id UUID REFERENCES products(id) NOT NULL
    );
     
    CREATE TABLE orders(
      id UUID PRIMARY KEY,
      created_at TIMESTAMP DEFAULT now(),
      is_cart BOOLEAN NOT NULL DEFAULT true,
      user_id UUID REFERENCES users(id) NOT NULL
      
    );

    CREATE TABLE line_items(
      id UUID PRIMARY KEY,
      created_at TIMESTAMP DEFAULT now(),
      product_id UUID REFERENCES products(id) NOT NULL,
      order_id UUID REFERENCES orders(id) NOT NULL,
      quantity INTEGER,
      CONSTRAINT product_and_order_key UNIQUE(product_id, order_id)
    );

    CREATE TABLE reviews(
      id UUID PRIMARY KEY,
      product VARCHAR(100) REFERENCES products(name),
      stars INTEGER NOT NULL, 
      comment VARCHAR(1000)
      );

  `;
  await client.query(SQL);

  const [moe, lucy, ethyl] = await Promise.all([
    createUser({ username: 'moe', password: 'm_password', is_admin: false}),
    createUser({ username: 'lucy', password: 'l_password', is_admin: false}),
    createUser({ username: 'ethyl', password: '1234', is_admin: true})
  ]);

  const posterImage = await loadImage('/images/poster.png');
  const hatImage = await loadImage('/images/hat.png');
  const shirtImage = await loadImage('/images/shirt.png');
  const hoodieImage = await loadImage('/images/hoodie.png');

  const [Poster, Hat, Shirt, Hoodie] = await Promise.all([
    createProduct({ name: 'Poster', price:'10', description:' Want to join the SpaceCats club? Now you can with our premium one of a kind SpaceCat poster! Let your friends know you are a SpaceCat.', image: posterImage}),
    createProduct({ name: 'Hat', price: '20', description: ' Walk around in style with our premium SpaceCat trucker hat! Bill to the front or back, it does not matter if you are a SPACECAT!', image: hatImage}),
    createProduct({ name: 'Shirt', price: '30', description: ' SpaceCats run the world. Our Elite one of a kind tri-blend tees are so soft, you will feel like your floating in space!', image: shirtImage}),
    createProduct({ name: 'Hoodie', price: '55', description: ' A SpaceCat on a hoodie???? Our super comfortable SpaceCats hoodie, has a 99.9% chance of being abducted by your girlfriend!', image: hoodieImage})
  ]);


 

  const userBookmarks = await fetchBookmarks(moe.id);

  const bookmark = await Promise.all ([
    createBookmark(moe.id, Poster.id),
    createBookmark(lucy.id, Shirt.id),
  ]);
 
 const firstReview = await Promise.all ([
    createReview({ product: 'Poster', stars: 3, comment: "average"}),
    createReview({ product: 'Poster', stars: 3, comment: "Average quality. Not bad, but not outstanding either."}),
    createReview({ product: 'Hat', stars: 3, comment: "This hat is just okay. It serves its purpose, but there's nothing special about it."}),
    createReview({ product: 'Shirt', stars: 3, comment: "Decent shirt. It's comfortable, but nothing to write home about."}),
    createReview({ product: 'Hoodie', stars: 3, comment: "An average hoodie. Keeps you warm, but not the most stylish choice."}),
    createReview({ product: 'Poster', stars: 3, comment: "Mediocre poster. The image is fine, but the paper quality could be better."}),
    createReview({ product: 'Hat', stars: 3, comment: "It's an average hat. It fits well, but the design is a bit plain."}),
    createReview({ product: 'Shirt', stars: 3, comment: "A middle-of-the-road shirt. It's just a basic wardrobe item."}),
    createReview({ product: 'Hoodie', stars: 3, comment: "This hoodie is average. It keeps you warm, but it's not the softest material."}),
    createReview({ product: 'Poster', stars: 3, comment: "Okay poster. The colors are decent, but I expected better print quality."}),
    createReview({ product: 'Hat', stars: 3, comment: "This hat is average. It does its job, but it's not a standout accessory."}),
    ]);

  let orders = await fetchOrders(ethyl.id);
  let cart = orders.find(order => order.is_cart);
  let lineItem = await createLineItem({ order_id: cart.id, product_id: Poster.id});
  lineItem.quantity++;
  await updateLineItem(lineItem);
  lineItem = await createLineItem({ order_id: cart.id, product_id: Hat.id});
  cart.is_cart = false;
  await updateOrder(cart);
};

module.exports = {
  fetchProducts,
  fetchOrders,
  fetchLineItems,
  fetchBookmarks,
  fetchReviews,
  createLineItem,
  createBookmark,
  createReview,
  updateLineItem,
  deleteLineItem,
  updateOrder,
  authenticate,
  createUser,
  findUserByToken,
  seed,
  client
};
