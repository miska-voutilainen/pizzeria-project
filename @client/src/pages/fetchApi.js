const URL = "http://localhost:3001";

// fetch all from the backend
export const getFoods = async () => {
  try {
    const res = await fetch(`${URL}/`);

    if (!res.ok) {
      throw new Error("Faild to fetch foods");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching foods:", err.message);
    return []; // return empty array to avoid breaking frontend
  }
};

export const getFoodsById = async (id, token) => {
  try {
    const res = await fetch(`${URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch food by ID");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching food", err.message);
    return null;
  }
};
