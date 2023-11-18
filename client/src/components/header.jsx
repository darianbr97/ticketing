import Link from "next/link";

const header = ({ currentUser }) => {
  const links = [
    currentUser && { label: "My Orders", href: "/orders" },
    currentUser && { label: "Sell ticket", href: "/tickets/new" },
    currentUser && { label: "Sign Out", href: "/auth/signout" },
    !currentUser && { label: "Sign Up", href: "/auth/signup" },
    !currentUser && { label: "Sign In", href: "/auth/signin" },
  ]
    .filter((e) => e)
    .map((link) => (
      <li key={link.href} className="nav-item">
        <Link href={link.href} className="nav-link fw-medium">
          {link.label}
        </Link>
      </li>
    ));

  return (
    <header className="navbar navbar-light bg-light px-3">
      <Link href="/" className="navbar-brand">
        GitTix
      </Link>

      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center gap-3">{links}</ul>
      </div>
    </header>
  );
};
export default header;
