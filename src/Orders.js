import React from "react";

const Orders = ({ orders, products, lineItems, users }) => {
  return (
    <div className="ordersDiv">
      <h1>Orders</h1>
      <ul className="ordersList">
        {orders
          .filter((order) => !order.is_cart)
          .map((order) => {
            const orderLineItems = lineItems.filter(
              (lineItem) => lineItem.order_id === order.id
            );
            return (
              <li key={order.id}>
                ({new Date(order.created_at).toLocaleString()})
                <ul>
                  {orderLineItems.map((lineItem) => {
                    const product = products.find(
                      (product) => product.id === lineItem.product_id
                    );
                    return (
                      <li key={lineItem.id}>{product ? product.name : ""}</li>
                    );
                  })}
                </ul>
                <hr></hr>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default Orders;
