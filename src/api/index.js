import axios from "axios";

const getHeaders = () => {
  return {
    headers: {
      authorization: window.localStorage.getItem("token"),
    },
  };
};

const fetchProducts = async (setProducts) => {
  const response = await axios.get("/api/products");
  setProducts(response.data);
};

const fetchReviews = async(setReviews)=> {
  const response = await axios.get('/api/reviews');
  setReviews(response.data);
};
const fetchOrders = async(setOrders)=> {
  const response = await axios.get('/api/orders', getHeaders());
  setOrders(response.data);
};

const fetchLineItems = async (setLineItems) => {
  const response = await axios.get("/api/lineItems", getHeaders());
  setLineItems(response.data);
};

const fetchBookmarks = async (setBookmarks) => {
  const response = await axios.get("/api/bookmarks", getHeaders());
  setBookmarks(response.data);
};

const createLineItem = async ({ product, cart, lineItems, setLineItems }) => {
  const response = await axios.post(
    "/api/lineItems",
    {
      order_id: cart.id,
      product_id: product.id,
    },
    getHeaders()
  );
  setLineItems([...lineItems, response.data]);
};


const createBookmark = async ({ product, bookmarks, setBookmarks }) => {
  const response = await axios.post(
    "/api/bookmarks",
    {
      product_id: product.id,
    },
    getHeaders()
  );
  setBookmarks([...bookmarks, response.data]);
  
};

const createReview = async ({review, setReviews, reviews}) => {
  console.log(review)
  const response = await axios.post(
    "/api/reviews",
    {
      product: review.product,
     stars: review.stars,
     comment: review.comment,
    },
    getHeaders()
  );
  setReviews([...reviews, response.data]);
  
};

const updateBookmarks = async ({ product, bookmarks, setBookmarks }) => {
  const response = await axios.put(
    `/api/bookmarks/${bookmarks.id}`,
    {
      product_id: product.id,
    },
    getHeaders()
  );
  setBookmarks([...bookmarks, response.data]);
}

const updateLineItem = async ({ lineItem, cart, lineItems, setLineItems }) => {
  const response = await axios.put(
    `/api/lineItems/${lineItem.id}`,
    {
      quantity: lineItem.quantity + 1,
      order_id: cart.id,
    },
    getHeaders()
  );
  setLineItems(
    lineItems.map((lineItem) =>
      lineItem.id == response.data.id ? response.data : lineItem
    )
  );
};

const subtractLineItem = async ({
  lineItem,
  cart,
  lineItems,
  setLineItems,
}) => {
  const response = await axios.put(
    `/api/lineItems/${lineItem.id}`,
    {
      quantity: lineItem.quantity - 1,
      order_id: cart.id,
    },
    getHeaders()
  );
  setLineItems(
    lineItems.map((lineItem) =>
      lineItem.id == response.data.id ? response.data : lineItem
    )
  );
};

const updateOrder = async ({ order, setOrders }) => {
  await axios.put(`/api/orders/${order.id}`, order, getHeaders());
  const response = await axios.get("/api/orders", getHeaders());
  setOrders(response.data);
};

const removeFromCart = async ({ lineItem, lineItems, setLineItems }) => {
  const response = await axios.delete(
    `/api/lineItems/${lineItem.id}`,
    getHeaders()
  );
  setLineItems(lineItems.filter((_lineItem) => _lineItem.id !== lineItem.id));
};

const deleteBookmark = async ({ bookmark, bookmarks, setBookmarks }) => {
  const response = await axios.delete(
    `/api/bookmarks/${bookmark.id}`,
    getHeaders()
  );
  setBookmarks(bookmarks.filter(_bookmark => _bookmark.id !== bookmark.id));
};

const deleteOrder = async({order, setOrders}) => {
  const response = await axios.delete(`/api/orders/${order.id}`,getHeaders());
setOrders(orders.filter(_order => _order.id !== order.id));
}

const attemptLoginWithToken = async(setAuth)=> {
  const token = window.localStorage.getItem('token');
  if(token){
    try {
      const response = await axios.get("/api/me", getHeaders());
      setAuth(response.data);
    } catch (ex) {
      if (ex.response.status === 401) {
        window.localStorage.removeItem("token");
      }
    }
  }
};

const login = async ({ credentials, setAuth }) => {
  const response = await axios.post("/api/login", credentials);
  const { token } = response.data;
  window.localStorage.setItem("token", token);
  attemptLoginWithToken(setAuth);
};

const logout = (setAuth) => {
  window.localStorage.removeItem("token");
  setAuth({});
}

const createUser = async(user) => {
  const response = await axios.post('/api/users', user );
  setUsers([...users , response.data]);
}

const api = {
  login,
  logout,
  fetchProducts,
  fetchReviews,
  fetchOrders,
  fetchLineItems,
  fetchBookmarks,
  updateBookmarks,
  createBookmark,
  createLineItem,
  createReview,
  updateLineItem,
  subtractLineItem,
  updateOrder,
  deleteOrder,
  removeFromCart,
  deleteBookmark,
  attemptLoginWithToken,
  attemptLoginWithToken,
  createUser
};

export default api;
