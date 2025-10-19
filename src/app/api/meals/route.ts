// src/app/api/meals/route.ts
import { NextResponse } from "next/server";

// 假資料：模擬從外部 API 取得的餐點資訊
const meals = [
  {
    id: "m1",
    title: "Grilled Chicken with Veggies",
    ingredients: ["Chicken breast", "Broccoli", "Carrots", "Olive oil", "Salt"],
    calories: 450,
    image:
      "https://images.unsplash.com/photo-1606755962773-0e39f2a7e808?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "m2",
    title: "Salmon Rice Bowl",
    ingredients: ["Salmon", "Rice", "Avocado", "Soy sauce", "Sesame oil"],
    calories: 520,
    image:
      "https://images.unsplash.com/photo-1604908177522-4325d9e41a07?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "m3",
    title: "Avocado Toast",
    ingredients: ["Whole-grain bread", "Avocado", "Egg", "Salt", "Pepper"],
    calories: 320,
    image:
      "https://images.unsplash.com/photo-1559628233-1e1e70a3f9e1?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "m4",
    title: "Beef Stir-Fry",
    ingredients: ["Beef", "Bell peppers", "Soy sauce", "Garlic", "Rice"],
    calories: 600,
    image:
      "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "m5",
    title: "Caesar Salad",
    ingredients: ["Romaine lettuce", "Croutons", "Parmesan", "Caesar dressing"],
    calories: 280,
    image:
      "https://images.unsplash.com/photo-1551739440-59a3b2f2a7a6?auto=format&fit=crop&w=800&q=60",
  },
];

// GET: 取得所有餐點
export async function GET() {
  console.log("api");
  return NextResponse.json(meals);
}

// 可選：POST 讓你模擬新增餐點
export async function POST(req: Request) {
  const newMeal = await req.json();
  meals.push({ ...newMeal, id: `m${meals.length + 1}` });
  return NextResponse.json({ message: "Meal added", meal: newMeal });
}
