import { enqueueSnackbar } from "notistack";

function success(msg) {
  enqueueSnackbar(msg, {
    autoHideDuration: 2000,
    anchorOrigin: {
      horizontal: "right",
      vertical: "top",
    },
    variant: "success",
  });
}
function fail(msg) {
  enqueueSnackbar(msg, {
    autoHideDuration: 2000,
    anchorOrigin: {
      horizontal: "right",
      vertical: "top",
    },
    variant: "error",
  });
}

export { fail, success };
