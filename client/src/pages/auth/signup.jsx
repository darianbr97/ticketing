import { useState } from "react";
import Router from "next/router";
import useQuery from "../../hooks/useQuery";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { errors, query } = useQuery({
    url: "/api/users/signup",
    method: "post",
    body: { email, password },
    onSuccess: () => Router.push("/"),
  });

  const registerUser = (e) => {
    e.preventDefault();
    query();
  };

  return (
    <form onSubmit={registerUser}>
      <h1>Sign Up</h1>
      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email address
        </label>
        <input
          type="text"
          name="email"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="form-group mt-4">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          type="password"
          name="password"
          className="form-control"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <input type="submit" value="Sing Up" className="btn btn-primary mt-2" />
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
    </form>
  );
};
export default Signup;
