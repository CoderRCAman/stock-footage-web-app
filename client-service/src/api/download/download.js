import axios from "axios";
import { fail } from "../../components/Snackbar/Snackbar";

const download = async (file) => {
  try {
    const downloadRes = await axios.get(file.private_url, {
      withCredentials: true,
      responseType: "blob",
    });
    console.log(downloadRes);
    const url = window.URL.createObjectURL(downloadRes.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.title;
    link.click();
    window.location.reload();
  } catch (error) {
    if (error?.response?.status == 401) {
      fail("Please login");
      window.location.href = "/login";
    } else if (error?.response?.status == 403) {
      fail("You are forbiden to download!");
    } else {
      fail(error?.message);
    }

    console.log(error);
  }
};

export { download };
