import { useEffect, useState } from "react";

export default function useOptimisedFile(files) {
  const [data, setData] = useState([]);

  function gcd(a, b) {
    return b == 0 ? a : gcd(b, a % b);
  }
  function calcAspectRation(width, height) {
    let r = gcd(width, height);
    return {
      width: parseInt(width / r),
      height: parseInt(height / r),
    };
  }

  useEffect(() => {
    setData(
      files.map((file) => {
        const { height, width } = calcAspectRation(file.width, file.height);
        return {
          src: file.public_url,
          _id: file._id,
          download_url: file.private_url,
          height: height,
          width: width,
          user: file.user[0],
          category: file.category[0] || {},
          resolution: `${file.height} x ${file.width}`,
          title: file.title,
          description: file.description,
          license: file.license,
          public_url: file.public_url,
          private_url: file.private_url,
        };
      })
    );
  }, [files]);
  return { data };
}
