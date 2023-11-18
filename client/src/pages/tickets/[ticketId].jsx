import Router from "next/router";
import useQuery from "../../hooks/useQuery";

const TicketDetails = ({ currentUser, ticket }) => {
  const { errors, query } = useQuery({
    url: "/api/orders",
    method: "post",
    body: { ticketId: ticket.id },
    onSuccess: (order) =>
      Router.push("/orders/[orderId]", `/orders/${order.id}`),
  });

  if (!currentUser) return Router.push("/");

  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: {ticket.price}</h4>
      <button className="btn btn-primary" onClick={() => query()}>
        Purchase
      </button>
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

TicketDetails.getInitialProps = async (context, client, currentUser) => {
  if (!currentUser) return {};

  const { ticketId } = context.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`);
  return { ticket: data };
};

export default TicketDetails;
