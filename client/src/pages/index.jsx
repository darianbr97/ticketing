import Link from "next/link";

const LandingPage = ({ currentUser, tickets }) => {
  if (!currentUser) return <h1>Your not signed in</h1>;

  return (
    <section>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {tickets?.length > 0 &&
            tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.title}</td>
                <td>{ticket.price}</td>
                <td>
                  <Link
                    href={"/tickets/[ticketId]"}
                    as={`/tickets/${ticket.id}`}
                  >
                    {" "}
                    view
                  </Link>
                </td>
              </tr>
            ))}
        </tbody>
        <tfoot>
          {tickets.length <= 0 && (
            <tr>
              <td className="border-b-0">No tickets available</td>
            </tr>
          )}
        </tfoot>
      </table>
    </section>
  );
};

LandingPage.getInitialProps = async (context, client, currentUser) => {
  if (!currentUser) return {};

  const { data } = await client.get("/api/tickets");
  return data;
};

export default LandingPage;
