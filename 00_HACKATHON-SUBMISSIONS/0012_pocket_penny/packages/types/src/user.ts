export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "instructor" | "student";
}
