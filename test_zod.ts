import { z } from "zod";
try {
  z.email({ message: "Invalid email format" });
  console.log("Success with object");
} catch(e) {
  console.log("Error with object", e);
}
