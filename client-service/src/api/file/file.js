import axios from "axios";
import { fail } from "../../components/Snackbar/Snackbar";

async function getFile(id) {
  try {
    const file = await axios.get(`http://localhost:4269/api/v1/file/${id}`, {
      withCredentials: true,
    });
    if (file.status == 200) return file.data[0];
  } catch (error) {
    fail(error?.reponse?.data?.msg || error?.message);
    throw error;
  }
}

export { getFile };
