import React, { Component } from "react";
import withContext from "../withContext";
import { Redirect } from "react-router-dom";
import axios from 'axios';

const initState = {
  product_name: "",
  brand: {
    brand_name: "",
    brand_id: 0
  },
  category: {
    category_name: "",
    category_id: 0
  },
  price: "",
  item_in_stock: "",
  description: ""
};

class AddProduct extends Component {
  constructor(props) {
    super(props);
    this.state = initState;
  }

  save = async (e) => {
    e.preventDefault();
    const { product_name, price, brand, category, item_in_stock, description } = this.state;
    console.log(this.state);
    if (product_name && price) {
      await axios.post(
        process.env.REACT_APP_API_URL + '/addProduct',
        { product_name, description, price, brand_id: brand.brand_id, category_id: category.category_id, item_in_stock },
      )

      this.props.context.addProduct(
        {
          product_name,
          brand,
          category,
          price,
          description,
          item_in_stock: item_in_stock || 0
        },
        () => this.setState(initState)
      );
      this.setState(
        { flash: { status: 'is-success', msg: 'Product created successfully' }}
      );

    } else {
      this.setState(
        { flash: { status: 'is-danger', msg: 'Please enter name and price' }}
      );
    }
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value, error: "" });
    this.setState({clickedBrands: false});
    this.setState({clickedCategories: false});
  }

  handleDropdown = e => {
    let value = JSON.parse(e.target.getAttribute("value"));
    this.setState({ [e.target.name]: value, error: "" });
    this.setState({clickedBrands: false});
    this.setState({clickedCategories: false});
  }

  handleClickBrands = () => {
    this.setState({clickedCategories: false});
    this.setState({clickedBrands: true});
  }
  handleClickCategories = () => {
    this.setState({clickedBrands: false});
    this.setState({clickedCategories: true});
  }

  render() {
    const { product_name, brand, category, price, item_in_stock, description } = this.state;
    const { user, brands, categories } = this.props.context;
    var classNameBrands = this.state.clickedBrands ? 'dropdown is-active' : 'dropdown';
    var classNameCategories = this.state.clickedCategories ? 'dropdown is-active' : 'dropdown';


    return !(user && user.accessLevel < 1) ? (
      <Redirect to="/" />
    ) : (
      <>
        <div className="hero is-primary ">
          <div className="hero-body container">
            <h4 className="title">Add Product</h4>
          </div>
        </div>
        <br />
        <br />
        <form onSubmit={this.save}>
          <div className="columns is-mobile is-centered">
            <div className="column is-one-third">
              <div className="field">
                <label className="label">Product Name: </label>
                <input
                  className="input"
                  type="text"
                  name="product_name"
                  value={product_name}
                  onChange={this.handleChange}
                  required
                />
              </div>
              <div className="field">
                <label className="label">Brand: </label> 
                <div className={classNameBrands}>
                  <div className="dropdown-trigger">
                    <button className="button" aria-haspopup="true" aria-controls="dropdown-menu3" onClick={this.handleClickBrands}>
                      <span>{brand.brand_name}</span>
                      <span className="icon is-small">
                        <i className="fas fa-angle-down" aria-hidden="true"></i>
                      </span>
                    </button>
                  </div>
                  <div className="dropdown-menu" id="dropdown-menu3" role="menu">
                    <div className="dropdown-content">
                      { brands.map((brand, index) => (
                        <a name="brand" value={JSON.stringify(brand)} onClick={this.handleDropdown} key={index} className="dropdown-item">{brand.brand_name}</a>
                      )) }
                    </div>
                  </div>
                </div>
              </div>
              <div className="field">
                <label className="label">Category: </label> 
                <div className={classNameCategories}>
                  <div className="dropdown-trigger">
                    <button className="button" aria-haspopup="true" aria-controls="dropdown-menu3" onClick={this.handleClickCategories}>
                      <span>{category.category_name}</span>
                      <span className="icon is-small">
                        <i className="fas fa-angle-down" aria-hidden="true"></i>
                      </span>
                    </button>
                  </div>
                  <div className="dropdown-menu" id="dropdown-menu3" role="menu">
                    <div className="dropdown-content">
                      { categories.map((category, index) => (
                        <a name="category" value={JSON.stringify(category)} onClick={this.handleDropdown} key={index} className="dropdown-item">{category.category_name}</a>
                      )) }
                    </div>
                  </div>
                </div>
              </div>
              <div className="field">
                <label className="label">Price: </label>
                <input
                  className="input"
                  type="number"
                  name="price"
                  value={price}
                  onChange={this.handleChange}
                  required
                />
              </div>
              <div className="field">
                <label className="label">Available in item_in_stock: </label>
                <input
                  className="input"
                  type="number"
                  name="item_in_stock"
                  value={item_in_stock}
                  onChange={this.handleChange}
                />
              </div>
              <div className="field">
                <label className="label">Description: </label>
                <textarea
                  className="textarea"
                  type="text"
                  rows="2"
                  style={{ resize: "none" }}
                  name="description"
                  value={description}
                  onChange={this.handleChange}
                />
              </div>
              {this.state.flash && (
                <div className={`notification ${this.state.flash.status}`}>
                  {this.state.flash.msg}
                </div>
              )}
              <div className="field is-clearfix">
                <button
                  className="button is-primary is-outlined is-pulled-right"
                  type="submit"
                  onClick={this.save}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </form>
      </>
    );
  }
}

export default withContext(AddProduct);
