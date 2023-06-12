const Sleep = (duration) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("Done!");
    }, duration);
  });
};

export {Sleep}