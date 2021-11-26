import React, { useState } from "react";
import withContext from "../withContext";
import CartItem from "./CartItem";

const Cart = props => {
  const { cart } = props.context;
  const [showModal, setShowModal] = useState(false);

  const cartKeys = Object.keys(cart || {});


  function Modal(props) {
    const showModal = props.showModal;
    if(showModal) {
      return (
        <div class="modal is-active">
          <div class="modal-background"></div>
          <div class="modal-card">
            <header class="modal-card-head">
              <p class="modal-card-title">Success!</p>
              <button class="delete" aria-label="close" onClick={() => setShowModal(false)}></button>
            </header>
            <section class="modal-card-body">
              Your order has been completed
            </section>
            <footer class="modal-card-foot">
              <button class="button is-success" onClick={() => setShowModal(false)}>Back to cart</button>
            </footer>
          </div>
        </div>
      );
    }
    return (<></>)
  }


  function checkout() {
    props.context.checkout();
    props.context.getProducts();
    setShowModal(true);
  };

  return (
    <>
      <div className="hero is-primary">
        <div className="hero-body container">
          <h4 className="title">My Cart</h4>
        </div>
      </div>
      <br />
      <Modal showModal={showModal}/>
      <div className="container">
        {cartKeys.length ? (
          <div className="column columns is-multiline">
            {cartKeys.map(key => (
              <CartItem
                cartKey={key}
                key={key}
                cartItem={cart[key]}
                removeFromCart={props.context.removeFromCart}
              />
            ))}
            <div className="column is-12 is-clearfix">
              <br />
              <div className="is-pulled-right">
                <button
                  onClick={props.context.clearCart}
                  className="button is-warning "
                >
                  Clear cart
                </button>{" "}
                <button
                  className="button is-success"
                  onClick={checkout}
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="column">
            <div className="title has-text-grey-light">No item in cart!</div>
          </div>
        )}
      </div>
    </>
  );
};

export default withContext(Cart);
