import Router from "next/router";
import Link from "next/link";

const OrderList = ({ currentUser, orders }) => {
  if (!currentUser) return Router.push("/");

  const formatDate = (date) => {
    const tempDate = new Date(date);
    const day = tempDate.getDate();
    const month = tempDate.getMonth() + 1;
    const year = tempDate.getFullYear();

    return `${month}/${day}/${year}`;
  };

  return (
    <section>
      <h1>Orders</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Price</th>
            <th>Status</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {orders?.length > 0 &&
            orders.map((order) => (
              <tr key={order.id}>
                <td>{formatDate(order.expiresAt)}</td>
                <td>{order.ticket.title}</td>
                <td>$ {order.ticket.price}</td>
                <td>{order.status}</td>
                <td>
                  <Link href={"/orders/[orderId]"} as={`/orders/${order.id}`}>
                    {" "}
                    view
                  </Link>
                </td>
              </tr>
            ))}
        </tbody>
        <tfoot>
          {orders.length <= 0 && (
            <tr>
              <td className="border-b-0">No orders registered</td>
            </tr>
          )}
        </tfoot>
      </table>
    </section>
  );
};

OrderList.getInitialProps = async (context, client, currentUser) => {
  if (!currentUser) return {};

  const { data } = await client.get("/api/orders");
  return { orders: data };
};

export default OrderList;
