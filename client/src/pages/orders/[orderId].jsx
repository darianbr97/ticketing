import Router from "next/router";
import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import useQuery from "../../hooks/useQuery";

const OrderDetails = ({ currentUser, order }) => {
  const [expiresAt, setExpiresAt] = useState("");
  const { errors, query } = useQuery({
    url: "/api/payments",
    method: "post",
    body: { orderId: order.id },
    onSuccess: () => Router.push("/orders"),
  });

  if (!currentUser) return Router.push("/");

  useEffect(() => {
    if (!order) return;

    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setExpiresAt((msLeft / 1000).toFixed(0));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => clearInterval(timerId);
  }, []);

  if (expiresAt < 0)
    return (
      <div>
        <h4>Oopss... the order has expired</h4>
      </div>
    );

  return (
    <div>
      <h1>Purching </h1>
      <p>{expiresAt} seconds until order expires</p>
      <StripeCheckout
        token={({ id }) => query({ token: id })}
        stripeKey="pk_test_51Nu7BaFKxfykXpdW1mEyKYr15ReQ0IdFD2UYp1NL5rmO3QTnr25VfB4kBSlqzrNjYDCqspJulMsRo5ZBxkzxXp4800McWYIN3y"
        amount={order.ticket.price * 100}
        email={currentUser.email}
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
  );
};

OrderDetails.getInitialProps = async (context, client, currentUser) => {
  if (!currentUser) return {};

  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  return { order: data };
};

export default OrderDetails;
