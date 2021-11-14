import React from "react";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/styles";

const CssTextField = styled(TextField)({
  "& label.Mui-focused": {
    color: "black",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "black",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "black",
    },
    "&:hover fieldset": {
      borderColor: "black",
    },
    "&.Mui-focused fieldset": {
      borderColor: "black",
    },
  },
});

function MTextField({ textFieldValue, handleChange, type }) {
  return (
    <CssTextField
      label={type === "twitter" ? "Twitter" : "Secret"}
      size="small"
      value={textFieldValue}
      onChange={(e) => handleChange(e.target.value)}
    />
  );
}

export default MTextField;
