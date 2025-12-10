import { useEffect } from "react";
import { logout } from "../utils/auth";

export default function Logout() {
  useEffect(() => {
    logout();
  }, []);
}
