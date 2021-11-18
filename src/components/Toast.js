import React from "react";
import toast, { Toaster } from "react-hot-toast";

function Toast() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      toastOptions={{ duration: 5000, success: { duration: 10000 } }}
    />
  );
}

export default Toast;
