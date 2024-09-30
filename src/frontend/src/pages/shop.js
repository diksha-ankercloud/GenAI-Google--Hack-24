import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const removeHtmlTags = (str) => {
    return str.replace(/<\/?[^>]+(>|$)/g, "");
  };

  const openProduct = (name, image) => {
    const obj = {
      name: removeHtmlTags(name).replace(/[^a-zA-Z0-9\s]/g, ""),
      image: image,
      site: "",
    };

    window.location.href = `product?product=${JSON.stringify(obj)}`;
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/list_products`); 
      console.log(response)
      setProducts(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error fetching products: {error}</p>;

  return (
    <>
      <section
        className="py-5 mb-5"
        style={{ background: "url(images/background-pattern.jpg)" }}
      >
        <div className="container-fluid">
          <div className="d-flex justify-content-between">
            <h1 className="page-title pb-2">Shop</h1>
            <nav className="breadcrumb fs-6">
              <a className="breadcrumb-item nav-link" href="#">
                Home
              </a>
              <a className="breadcrumb-item nav-link" href="#">
                Pages
              </a>
              <span className="breadcrumb-item active" aria-current="page">
                Shop
              </span>
            </nav>
          </div>
        </div>
      </section>
      <div className="shopify-grid">
        <div className="container-fluid">
          <div className="row g-5">
            <main className="col-md-12">
              <div className="filter-shop d-flex justify-content-between">
                <div className="showing-product">
                  <p>Showing 1–{products.length} of {products.length} results</p>
                </div>
                <div className="sort-by">
                  <select
                    id="input-sort"
                    className="form-control"
                    data-filter-sort=""
                    data-filter-order=""
                  >
                    <option value="">Default sorting</option>
                    <option value="">Name (A - Z)</option>
                    <option value="">Name (Z - A)</option>
                    <option value="">Price (Low-High)</option>
                    <option value="">Price (High-Low)</option>
                    <option value="">Rating (Highest)</option>
                    <option value="">Rating (Lowest)</option>
                    <option value="">Model (A - Z)</option>
                    <option value="">Model (Z - A)</option>
                  </select>
                </div>
              </div>
              <div className="product-grid row row-cols-sm-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4">
                {products.map((product) => (
                  <div className="col" key={product.id} onClick={() => {
                    openProduct(product.product,product.image )
                  }}>
                    <div className="product-item">
                      {product.discount && (
                        <span className="badge bg-success position-absolute m-3">
                          -{product.discount}%
                        </span>
                      )}
                      <a href="#" className="btn-wishlist">
                        <svg width={24} height={24}>
                          <use xlinkHref="#heart" />
                        </svg>
                      </a>
                      <figure>
                          <img
                            src={product.image}
                            alt={product.product}
                            className="tab-image"
                          />
                      </figure>
                      <h3>{product.product}</h3>
                      {/* <span className="qty">{product.quantity} Unit</span>
                      <span className="rating">
                        <svg width={24} height={24} className="text-primary">
                          <use xlinkHref="#star-solid" />
                        </svg>{" "}
                      </span> */}
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="input-group product-qty">
                          {/* <span className="input-group-btn">
                            <button
                              type="button"
                              className="quantity-left-minus btn btn-danger btn-number"
                              data-type="minus"
                            >
                              <svg width={16} height={16}>
                                <use xlinkHref="#minus" />
                              </svg>
                            </button>
                          </span>
                          <input
                            type="text"
                            name="quantity"
                            className="form-control input-number quantity"
                            defaultValue={1}
                          />
                          <span className="input-group-btn">
                            <button
                              type="button"
                              className="quantity-right-plus btn btn-success btn-number"
                              data-type="plus"
                            >
                              <svg width={16} height={16}>
                                <use xlinkHref="#plus" />
                              </svg>
                            </button>
                          </span> */}
                        </div>
                        {/* <a href="#" className="nav-link">
                          Add to Cart{" "}
                          <svg width={18} height={18}>
                            <use xlinkHref="#cart" />
                          </svg>
                        </a> */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* / product-grid */}
              <nav className="text-center py-4" aria-label="Page navigation">
                {/* Pagination code remains the same */}
              </nav>
            </main>
          </div>
        </div>
      </div>
      <section className="py-5">
        {/* Discount section remains the same */}
      </section>
    </>
  );
}

export default Shop;
