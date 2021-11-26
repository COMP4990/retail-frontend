import React, { Component } from "react";
import { Switch, Route, Link, BrowserRouter as Router } from "react-router-dom";
import axios from 'axios';

import AddProduct from './components/AddProduct';
import Cart from './components/Cart';
import Login from './components/Login';
import Register from './components/Register';
import ProductList from './components/ProductList';

import Context from "./Context";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      cart: {},
      products: []
    };
    this.routerRef = React.createRef();
  }

  async componentDidMount() {
    let user = localStorage.getItem("user");
    let cart = localStorage.getItem("cart");

    const products = await axios.get(process.env.REACT_APP_API_URL + '/products');
    const brands = await axios.get(process.env.REACT_APP_API_URL + '/brands');
    const categories = await axios.get(process.env.REACT_APP_API_URL + '/categories');

    user = user ? JSON.parse(user) : null;
    cart = cart? JSON.parse(cart) : {};

    this.setState({ user,  products: products.data, brands: brands.data, categories: categories.data, cart });
  }

  register = async (username, password) => {
    try {
      await axios.post(
        process.env.REACT_APP_API_URL + '/register',
        { username, password },
      );
      const res = await axios.post(
        process.env.REACT_APP_API_URL + '/login',
        { username, password },
      );
      let user = res.data.user;

      this.setState({ user });
      localStorage.setItem("user", JSON.stringify(user));
      return true;
    } catch (err) {
      return { status: 401, message: 'Unauthorized' }
    }
  }

  login = async (username, password) => {
    try {
      let res = await axios.post(
        process.env.REACT_APP_API_URL + '/login',
        { username, password },
      )
      if(res.status !== 200) throw new Error();
      let user = res.data.user;
      user.accessLevel = user.username === 'admin@example.com' ? 0 : 1

      this.setState({ user });
      localStorage.setItem("user", JSON.stringify(user));

      res = await axios.get(process.env.REACT_APP_API_URL + '/cart', {
        params: {
          user_id: user.id
        }
      });


      let cart = this.state.cart;

      for (let cartItem of res.data) {
        let product = await axios.get(process.env.REACT_APP_API_URL + '/product', {
          params: {
            product_id: cartItem.product_id
          }
        });
        if(product.status !== 200) throw new Error();
        cart[product.data.product_name] = {
          amount: cartItem.quantity,
          id: product.data.name,
          product: product.data
        }
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      this.setState({ cart });

      return true;
    } catch (err) {
      return { status: 401, message: 'Unauthorized' }
    }
  }

  logout = e => {
    e.preventDefault();
    this.setState({ user: null });
    localStorage.removeItem("user");
  };

  addProduct = (product, callback) => {
    let products = this.state.products.slice();
    products.push(product);
    this.setState({ products }, () => callback && callback());
  };

  addToCart = async cartItem => {
    let cart = this.state.cart;
    let user = this.state.user;

    if (cart[cartItem.id]) {
      cart[cartItem.id].amount += cartItem.amount;
    } else {
      cart[cartItem.id] = cartItem;
    }
    if (cart[cartItem.id].amount > cart[cartItem.id].product.item_in_stock) {
      cart[cartItem.id].amount = cart[cartItem.id].product.item_in_stock;
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    this.setState({ cart });

    // Update DB with cart
    if(user) {
      try {
        let res = await axios.post(
          process.env.REACT_APP_API_URL + '/addToCart', { 
            user_id: user.id,
            product_id: cartItem.product.product_id
          },
        )
        if(res.status !== 200) throw new Error();
      } catch(err) {
        return { status: 401, message: 'Unauthorized' }
      }
    }
    
  };

  removeFromCart = cartItemId => {
    let cart = this.state.cart;
    delete cart[cartItemId];
    localStorage.setItem("cart", JSON.stringify(cart));
    this.setState({ cart });
  };

  clearCart = () => {
    let cart = {};
    localStorage.removeItem("cart");
    this.setState({ cart });
  };

  checkout = () => {
    const user = this.state.user;
    const cart = this.state.cart;

    if (!user) {
      this.routerRef.current.history.push("/login");
      return;
    }

    axios.post(
      process.env.REACT_APP_API_URL + '/checkout', { 
        user_id: user.id
      },
    )

    const products = this.state.products.map(p => {
      if (cart[p.name]) {
        p.stock = p.stock - cart[p.name].amount;

        // axios.put(
        //   `http://localhost:3001/products/${p.id}`,
        //   { ...p },
        // )
      }
      return p;
    });

    this.setState({ products });
    this.clearCart();
  };

  render() {
    return (
      <Context.Provider
        value={{
          ...this.state,
          removeFromCart: this.removeFromCart,
          addToCart: this.addToCart,
          login: this.login,
          register: this.register,
          addProduct: this.addProduct,
          clearCart: this.clearCart,
          checkout: this.checkout
        }}
      >
        <Router ref={this.routerRef}>
        <div className="App">
          <nav
            className="navbar container"
            role="navigation"
            aria-label="main navigation"
          >
            <div className="navbar-brand">
              <b className="navbar-item is-size-4 ">ecommerce</b>
              <label
                role="button"
                className="navbar-burger burger"
                aria-label="menu"
                aria-expanded="false"
                data-target="navbarBasicExample"
                onClick={e => {
                  e.preventDefault();
                  this.setState({ showMenu: !this.state.showMenu });
                }}
              >
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
              </label>
            </div>
              <div className={`navbar-menu ${
                  this.state.showMenu ? "is-active" : ""
                }`}>
                <Link to="/products" className="navbar-item">
                  Products
                </Link>
                {this.state.user && this.state.user.accessLevel < 1 && (
                  <Link to="/add-product" className="navbar-item">
                    Add Product
                  </Link>
                )}
                <Link to="/cart" className="navbar-item">
                  Cart
                  <span
                    className="tag is-primary"
                    style={{ marginLeft: "5px" }}
                  >
                    { Object.keys(this.state.cart).length }
                  </span>
                </Link>
                {!this.state.user ? (
                  <Link to="/login" className="navbar-item">
                    Login
                  </Link>
                ) : (
                  <Link to="/" onClick={this.logout} className="navbar-item">
                    Logout
                  </Link>
                )}
              </div>
            </nav>
            <Switch>
              <Route exact path="/" component={ProductList} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/register" component={Register} />
              <Route exact path="/cart" component={Cart} />
              <Route exact path="/add-product" component={AddProduct} />
              <Route exact path="/products" component={ProductList} />
            </Switch>
          </div>
        </Router>
      </Context.Provider>
    );
  }
}
