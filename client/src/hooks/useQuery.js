import axios from "axios";
import { useState } from "react";

const useQuery = ({ url, method, body, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const query = async (extBody = {}) => {
    setIsLoading(true);
    setErrors([]);

    try {
      const { data } = await axios({
        url,
        method,
        data: { ...body, ...extBody },
      });

      onSuccess && onSuccess(data);
    } catch (error) {
      console.log(error);
      setErrors(error.response.data.errors);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, errors, query };
};

export default useQuery;
