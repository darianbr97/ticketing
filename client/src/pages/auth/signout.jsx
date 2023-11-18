import { useEffect } from "react";
import Router from "next/router";
import useQuery from "../../hooks/useQuery";

const signout = () => {
  const { query } = useQuery({
    url: "/api/users/signout",
    method: "post",
    body: {},
    onSuccess: () => Router.push("/"),
  });

  useEffect(() => {
    query();
  }, []);

  return <div>signing you out...</div>;
};
export default signout;
