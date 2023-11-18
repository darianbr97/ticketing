import { useState } from "react";
import useQuery from "../../hooks/useQuery";
import Router from "next/router";

const NewTicket = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(0);
  const { errors, query } = useQuery({
    url: "/api/tickets",
    method: "post",
    body: { title, price },
    onSuccess: () => Router.push("/"),
  });

  const createTicket = async (e) => {
    e.preventDefault();
    query();
  };

  const roundPrice = () => {
    const value = parseFloat(price);
    setPrice(value.toFixed(2));
  };

  return (
    <section>
      <h4>Create a Ticket</h4>
      <form onSubmit={createTicket}>
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Title
          </label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <label htmlFor="price" className="form-label">
            Price
          </label>
          <input
            type="number"
            name="price"
            className="form-control"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={roundPrice}
          />
          <input
            type="submit"
            value="Submit"
            className="btn btn-primary mt-2"
          />
          {!!errors.length && (
            <div className="alert alert-danger mt-3">
              <h4>Ooops...</h4>
              <ul>
                {errors.map((err, i) => (
                  <li key={i}>{err.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </form>
    </section>
  );
};
export default NewTicket;
