import { useState, useEffect } from 'react'

export default function Display({ onLogout }) {

  const [products, setProducts] = useState([])
  const [items, setItems] = useState('')
  const [price, setPrice] = useState('')

  const api_url = 'http://localhost:8080/api/product'

  useEffect(() => {
    fetch(api_url)
      .then((response) => response.json())
      .then((data) => {
        setProducts(data)
      })
      .catch((err) => {
        console.log(err)
      })

  }, [])

  async function formSubmit(event) {
    event.preventDefault()
    try {

      const response = await fetch(api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: items,
          price: price
        })
      })

      const newProduct = await response.json()

      setProducts((currentProducts) => [
        ...currentProducts,
        newProduct
      ])

      setItems('')
      setPrice('')

    } catch (err) {

      console.log(err)

    }
  }

  function handleLogout() {
    onLogout?.()
  }

  return (

    <div className="bg-primary-subtle" style={{ minHeight: "100vh" }}>
      <div className="text-center d-flex justify-content-center flex-column bg-primary-subtle">
        <header className="fw-bold text-dark text-start bg-secondary m-2 p-4 mx-1">
          Laptop and PC Accessories 
        </header>

        <h1 className="fw-bold text-dark">
          Inventory Management System
        </h1>

        <form onSubmit={formSubmit}>
          <label
            className="fw-light"
            htmlFor="items"
          >
            Items:
          </label>

          <input
            type="text"
            className="form-control "
            style={{ width: "300px", margin: "auto" }}
            id="items"
            placeholder="Items"
            value={items}
            onChange={(event) =>
              setItems(event.target.value)
            }
          />

          <label
            className="fw-light"
            htmlFor="price"
          >
            Price:
          </label>

          <input
            type="number"
            className="form-control mb-2"
            style={{ width: "300px", margin: "auto" }}
            placeholder="Price"
            id="price"
            value={price}
            onChange={(event) =>
              setPrice(event.target.value)
            }
          />

          <input
            type="submit"
            value="Submit"
          />

        </form>

        <table
          className="table table-striped mt-3"
          style={{ border: '1px solid black' }}
        >
          <thead className='table-dark'>
            <tr>
              <td>Items</td>
              <td>Price</td>
            </tr>
          </thead>

          <tbody className="table ">
            {products.map((product, index) => (
              <tr key={index}>
                <td>
                  {product.items}
                </td>
                <td>
                  {product.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <button
            type="button"
            className="btn btn-secondary btn-lg my-3"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}