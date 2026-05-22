import { useEffect } from "react";
import api from "@/api/api";
import { setAuth } from "@/store/auth/auth.store";

export const useBootstrapAuth = () => {
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.post("/auth/refresh-token");
        setAuth({
          accessToken: data.accessToken,
          roleSelected: data.roleSelected,
          user: data.user,
        });
      } catch (e) {
        setAuth({ accessToken: null });
        console.log("Error bootstrapAuth", e);
      }
    })();
  }, []);
};
